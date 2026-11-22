<?php
declare(strict_types=1);

if (!defined('STUDENTLIFE_BOOTSTRAPPED')) {
    http_response_code(404);
    exit('Not found.');
}

/** Read provider settings from the host environment or the protected PHP file outside the web root. */
function sl_ai_provider_file_settings(): array
{
    $configFile = dirname(__DIR__).'/studentlife-ai-secrets.php';
    if (!is_link($configFile) && is_file($configFile) && is_readable($configFile)) {
        try {
            $loaded = require $configFile;
            return is_array($loaded) ? $loaded : [];
        } catch (Throwable $e) { return []; }
    }
    return [];
}

/** Write provider credentials outside the document root with owner-only file permissions. */
function sl_ai_provider_store_file(array $settings): bool
{
    $configDir = dirname(__DIR__);
    $configFile = $configDir.'/studentlife-ai-secrets.php';
    if (!is_dir($configDir) || !is_writable($configDir) || is_link($configFile)) return false;
    $temporaryFile = @tempnam($configDir, '.studentlife-ai-');
    if (!is_string($temporaryFile) || $temporaryFile === '') return false;
    $source = "<?php\nreturn ".var_export($settings, true).";\n";
    $written = @file_put_contents($temporaryFile, $source, LOCK_EX);
    if ($written !== strlen($source) || !@chmod($temporaryFile, 0600) || !@rename($temporaryFile, $configFile)) {
        @unlink($temporaryFile);
        return false;
    }
    @chmod($configFile, 0600);
    return true;
}

function sl_ai_provider_config(): array
{
    $settings = sl_ai_provider_file_settings();

    $endpoint = trim((string)(getenv('STUDENTLIFE_AI_ENDPOINT') ?: ($settings['endpoint'] ?? '')));
    $apiKey = trim((string)(getenv('STUDENTLIFE_AI_API_KEY') ?: ($settings['api_key'] ?? '')));
    $model = trim((string)(getenv('STUDENTLIFE_AI_MODEL') ?: ($settings['model'] ?? '')));
    $validEndpoint = $endpoint !== '' && filter_var($endpoint, FILTER_VALIDATE_URL)
        && strtolower((string)parse_url($endpoint, PHP_URL_SCHEME)) === 'https';
    return ['endpoint' => $validEndpoint ? $endpoint : '', 'api_key' => $apiKey, 'model' => $model];
}

function sl_ai_provider_ready(): bool
{
    $config = sl_ai_provider_config();
    return $config['endpoint'] !== '' && $config['api_key'] !== '' && $config['model'] !== '';
}

/** OpenAI-compatible HTTPS endpoint. No network request is made unless the host supplies all three settings. */
function sl_ai_complete(array $messages, int $maxTokens = 1400): array
{
    $config = sl_ai_provider_config();
    if ($config['endpoint'] === '' || $config['api_key'] === '' || $config['model'] === '') {
        return ['ok' => false, 'error' => 'The AI service is not configured.'];
    }
    $payload = json_encode([
        'model' => $config['model'],
        'messages' => $messages,
        'temperature' => 0.2,
        'max_tokens' => max(1, min(6000, $maxTokens)),
    ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    if (!is_string($payload)) return ['ok' => false, 'error' => 'The AI request could not be prepared.'];

    $body = false;
    $status = 0;
    if (function_exists('curl_init')) {
        $ch = curl_init($config['endpoint']);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_TIMEOUT => 35,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer '.$config['api_key'],
                'Content-Type: application/json',
                'Accept: application/json',
            ],
            CURLOPT_POSTFIELDS => $payload,
        ]);
        $body = curl_exec($ch);
        $status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
    } else {
        $context = stream_context_create(['http' => [
            'method' => 'POST',
            'timeout' => 35,
            'ignore_errors' => true,
            'header' => "Authorization: Bearer ".$config['api_key']."\r\nContent-Type: application/json\r\nAccept: application/json\r\n",
            'content' => $payload,
        ]]);
        $body = @file_get_contents($config['endpoint'], false, $context);
        $responseHeaders = $http_response_header ?? [];
        if (isset($responseHeaders[0]) && preg_match('/\s([0-9]{3})\s/', $responseHeaders[0], $match)) $status = (int)$match[1];
    }
    if (!is_string($body) || $status < 200 || $status >= 300) {
        return ['ok' => false, 'error' => 'The AI service could not answer right now. No academic decision was made.'];
    }
    $decoded = json_decode($body, true);
    $answer = $decoded['choices'][0]['message']['content'] ?? '';
    if (is_array($answer)) {
        $answer = implode("\n", array_map(static fn($part) => (string)($part['text'] ?? ''), $answer));
    }
    $answer = trim((string)$answer);
    if ($answer === '') return ['ok' => false, 'error' => 'The AI service returned no answer.'];
    return ['ok' => true, 'answer' => mb_substr($answer, 0, min(60000, max(12000, $maxTokens * 8)))];
}

function sl_ai_all(PDO $db, string $sql, array $params = []): array
{
    $q = $db->prepare($sql);
    $q->execute($params);
    return $q->fetchAll();
}

function sl_ai_risk_rules(PDO $db): array
{
    $rules = [
        'moderate_below' => 75,
        'high_below' => 60,
        'critical_below' => 40,
        'moderate_min_records' => 2,
        'high_min_records' => 3,
        'critical_min_records' => 5,
    ];
    $q = $db->prepare("SELECT setting_key,setting_value FROM app_settings WHERE setting_key LIKE 'risk_%'");
    $q->execute();
    foreach ($q->fetchAll() as $row) {
        $key = substr((string)$row['setting_key'], 5);
        if (array_key_exists($key, $rules) && is_numeric($row['setting_value'])) {
            $rules[$key] = (int)$row['setting_value'];
        }
    }
    if (!($rules['critical_below'] < $rules['high_below']
        && $rules['high_below'] < $rules['moderate_below']
        && $rules['moderate_below'] <= 100)) {
        $rules['moderate_below'] = 75;
        $rules['high_below'] = 60;
        $rules['critical_below'] = 40;
    }
    $rules['moderate_min_records'] = max(1, min(50, $rules['moderate_min_records']));
    $rules['high_min_records'] = max($rules['moderate_min_records'], min(100, $rules['high_min_records']));
    $rules['critical_min_records'] = max($rules['high_min_records'], min(200, $rules['critical_min_records']));
    return $rules;
}

/** Risk flags use recorded attendance only. Missing official grade and submission data is reported separately. */
function sl_ai_risk_data(PDO $db, array $rules, string $courseCode = ''): array
{
    $students = sl_ai_all($db, "SELECT u.id,u.name,COUNT(DISTINCT e.offering_id) AS sections,COUNT(DISTINCT s.id) AS scheduled,COUNT(DISTINCT ar.id) AS marked,COALESCE(SUM(ar.status='present'),0) AS present,GROUP_CONCAT(DISTINCT c.code ORDER BY c.code SEPARATOR ', ') AS courses
        FROM users u
        JOIN course_enrolments e ON e.student_id=u.id AND e.status='enrolled'
        JOIN course_offerings o ON o.id=e.offering_id
        JOIN academic_courses c ON c.id=o.course_id
        LEFT JOIN class_sessions s ON s.offering_id=o.id
        LEFT JOIN attendance_records ar ON ar.session_id=s.id AND ar.student_id=u.id
        WHERE u.role='student' AND u.account_status='active' AND (?='' OR c.code=?)
        GROUP BY u.id,u.name ORDER BY u.name", [$courseCode,$courseCode]);
    $counts = ['Low' => 0, 'Moderate' => 0, 'High' => 0, 'Critical' => 0, 'Insufficient data' => 0];
    foreach ($students as &$student) {
        $marked = (int)$student['marked'];
        $present = (int)$student['present'];
        $student['attendance_rate'] = $marked > 0 ? round(100 * $present / $marked, 1) : null;
        if ($marked < $rules['moderate_min_records']) {
            $student['risk'] = 'Insufficient data';
        } elseif ($marked >= $rules['critical_min_records'] && $student['attendance_rate'] < $rules['critical_below']) {
            $student['risk'] = 'Critical';
        } elseif ($marked >= $rules['high_min_records'] && $student['attendance_rate'] < $rules['high_below']) {
            $student['risk'] = 'High';
        } elseif ($student['attendance_rate'] < $rules['moderate_below']) {
            $student['risk'] = 'Moderate';
        } else {
            $student['risk'] = 'Low';
        }
        $counts[$student['risk']]++;
    }
    unset($student);
    $riskOrder = ['Critical' => 0, 'High' => 1, 'Moderate' => 2, 'Low' => 3, 'Insufficient data' => 4];
    usort($students, static function ($a, $b) use ($riskOrder) {
        return ($riskOrder[$a['risk']] <=> $riskOrder[$b['risk']])
            ?: (($a['attendance_rate'] ?? 101) <=> ($b['attendance_rate'] ?? 101))
            ?: strcmp($a['name'], $b['name']);
    });

    $departments = sl_ai_all($db, "SELECT COALESCE(d.name,'Unassigned department') AS department,COUNT(DISTINCT e.student_id) AS students,COUNT(DISTINCT ar.id) AS marked,COALESCE(SUM(ar.status='present'),0) AS present
        FROM course_enrolments e
        JOIN users u ON u.id=e.student_id AND u.role='student' AND u.account_status='active'
        JOIN course_offerings o ON o.id=e.offering_id
        JOIN academic_courses c ON c.id=o.course_id
        LEFT JOIN departments d ON d.id=c.department_id
        LEFT JOIN class_sessions s ON s.offering_id=o.id
        LEFT JOIN attendance_records ar ON ar.session_id=s.id AND ar.student_id=u.id
        WHERE e.status='enrolled' AND (?='' OR c.code=?)
        GROUP BY d.id,d.name ORDER BY department", [$courseCode,$courseCode]);
    foreach ($departments as &$department) {
        $department['attendance_rate'] = (int)$department['marked'] > 0
            ? round(100 * (int)$department['present'] / (int)$department['marked'], 1) : null;
    }
    unset($department);

    $courses = sl_ai_all($db, "SELECT c.id,c.code,c.title,COALESCE(d.name,'Unassigned department') AS department,l.name AS lecturer,COUNT(DISTINCT e.student_id) AS students,COUNT(DISTINCT ar.id) AS marked,COALESCE(SUM(ar.status='present'),0) AS present
        FROM academic_courses c
        JOIN course_offerings o ON o.course_id=c.id
        LEFT JOIN departments d ON d.id=c.department_id
        LEFT JOIN users l ON l.id=o.lecturer_id
        LEFT JOIN course_enrolments e ON e.offering_id=o.id AND e.status='enrolled'
        LEFT JOIN class_sessions s ON s.offering_id=o.id
        LEFT JOIN attendance_records ar ON ar.session_id=s.id AND ar.student_id=e.student_id
        WHERE (?='' OR c.code=?)
        GROUP BY c.id,c.code,c.title,d.name,l.name ORDER BY c.code", [$courseCode,$courseCode]);
    foreach ($courses as &$course) {
        $course['attendance_rate'] = (int)$course['marked'] > 0
            ? round(100 * (int)$course['present'] / (int)$course['marked'], 1) : null;
    }
    unset($course);

    $trend = sl_ai_all($db, "SELECT DATE_FORMAT(s.session_date,'%Y-%m') AS month,COUNT(ar.id) AS marked,COALESCE(SUM(ar.status='present'),0) AS present
        FROM attendance_records ar
        JOIN class_sessions s ON s.id=ar.session_id
        JOIN course_offerings o ON o.id=s.offering_id
        JOIN academic_courses c ON c.id=o.course_id
        WHERE (?='' OR c.code=?)
        GROUP BY DATE_FORMAT(s.session_date,'%Y-%m') ORDER BY month", [$courseCode,$courseCode]);
    foreach ($trend as &$month) {
        $month['attendance_rate'] = (int)$month['marked'] > 0
            ? round(100 * (int)$month['present'] / (int)$month['marked'], 1) : null;
    }
    unset($month);

    return [
        'students' => $students,
        'student_count' => count($students),
        'counts' => $counts,
        'attention_count' => $counts['Moderate'] + $counts['High'] + $counts['Critical'],
        'departments' => $departments,
        'courses' => $courses,
        'trend' => $trend,
        'rules' => $rules,
        'limitations' => [
            'Institution-level course-linked grades are not stored in this app.',
            'Official assignment submissions and missed-submission history are not stored.',
            'Faculty records are not stored; comparisons use configured departments.',
            'Only recorded attendance entries are used. Unmarked sessions are not counted as absences.',
        ],
    ];
}

function sl_ai_authorized_context(PDO $db, array $user, string $courseCode = ''): array
{
    $uid = (int)$user['id'];
    $role = (string)$user['role'];
    if ($role === 'student') {
        $courses = sl_ai_all($db, "SELECT c.code,c.title,c.description,o.section_code,t.name AS term,l.name AS lecturer
            FROM course_enrolments e JOIN course_offerings o ON o.id=e.offering_id
            JOIN academic_courses c ON c.id=o.course_id JOIN academic_terms t ON t.id=o.term_id
            LEFT JOIN users l ON l.id=o.lecturer_id
            WHERE e.student_id=? AND e.status='enrolled' AND (?='' OR c.code=?)
            ORDER BY c.code", [$uid,$courseCode,$courseCode]);
        return [
            'scope' => 'Only this authenticated student’s records and shared materials for enrolled courses.',
            'courses' => $courses,
            'tasks' => sl_ai_all($db, "SELECT title,course,due_date,status,priority FROM tasks WHERE user_id=? AND (?='' OR course=? OR course='') ORDER BY due_date LIMIT 60", [$uid,$courseCode,$courseCode]),
            'grades' => sl_ai_all($db, "SELECT c.code,c.name,g.assessment,g.score,g.created_at FROM grades g JOIN courses c ON c.id=g.course_id AND c.user_id=g.user_id WHERE g.user_id=? AND (?='' OR c.code=? OR c.name=?) ORDER BY g.created_at DESC LIMIT 80", [$uid,$courseCode,$courseCode,$courseCode]),
            'timetable' => sl_ai_all($db, "SELECT c.code,c.title,o.section_code,s.session_date,s.starts_at,s.ends_at,s.room,s.topic FROM course_enrolments e JOIN course_offerings o ON o.id=e.offering_id JOIN academic_courses c ON c.id=o.course_id JOIN class_sessions s ON s.offering_id=o.id WHERE e.student_id=? AND e.status='enrolled' AND s.session_date>=CURRENT_DATE AND (?='' OR c.code=?) ORDER BY s.session_date,s.starts_at LIMIT 50", [$uid,$courseCode,$courseCode]),
            'attendance' => sl_ai_all($db, "SELECT c.code,s.session_date,ar.status FROM attendance_records ar JOIN class_sessions s ON s.id=ar.session_id JOIN course_offerings o ON o.id=s.offering_id JOIN academic_courses c ON c.id=o.course_id JOIN course_enrolments e ON e.offering_id=o.id AND e.student_id=ar.student_id AND e.status='enrolled' WHERE ar.student_id=? AND (?='' OR c.code=?) ORDER BY s.session_date DESC LIMIT 80", [$uid,$courseCode,$courseCode]),
            'announcements' => sl_ai_all($db, "SELECT title,body,published_at FROM announcements WHERE status='published' AND (audience='all' OR audience='student') ORDER BY published_at DESC,id DESC LIMIT 10"),
            'resources' => sl_ai_all($db, "SELECT title,description,url FROM resource_library WHERE status='active' AND (audience='all' OR audience='student') ORDER BY created_at DESC,id DESC LIMIT 30"),
        ];
    }
    if ($role === 'lecturer') {
        $courses = sl_ai_all($db, "SELECT o.id AS offering_id,c.code,c.title,c.description,o.section_code,t.name AS term
            FROM course_offerings o JOIN academic_courses c ON c.id=o.course_id JOIN academic_terms t ON t.id=o.term_id
            WHERE o.lecturer_id=? AND o.status='open' AND (?='' OR c.code=?) ORDER BY c.code,o.section_code", [$uid,$courseCode,$courseCode]);
        return [
            'scope' => 'Only courses assigned to this authenticated lecturer and their enrolled roster and attendance records.',
            'courses' => $courses,
            'timetable' => sl_ai_all($db, "SELECT c.code,c.title,o.section_code,s.session_date,s.starts_at,s.ends_at,s.room,s.topic FROM course_offerings o JOIN academic_courses c ON c.id=o.course_id JOIN class_sessions s ON s.offering_id=o.id WHERE o.lecturer_id=? AND o.status='open' AND s.session_date>=CURRENT_DATE AND (?='' OR c.code=?) ORDER BY s.session_date,s.starts_at LIMIT 80", [$uid,$courseCode,$courseCode]),
            'student_attendance' => sl_ai_all($db, "SELECT c.code,u.name AS student,COUNT(DISTINCT ar.id) AS recorded,COALESCE(SUM(ar.status='present'),0) AS present,COALESCE(SUM(ar.status='absent'),0) AS absent,COALESCE(SUM(ar.status='late'),0) AS late
                FROM course_enrolments e JOIN course_offerings o ON o.id=e.offering_id JOIN academic_courses c ON c.id=o.course_id
                JOIN users u ON u.id=e.student_id LEFT JOIN class_sessions s ON s.offering_id=o.id
                LEFT JOIN attendance_records ar ON ar.session_id=s.id AND ar.student_id=u.id
                WHERE o.lecturer_id=? AND e.status='enrolled' AND (?='' OR c.code=?)
                GROUP BY c.id,u.id,c.code,u.name ORDER BY c.code,u.name", [$uid,$courseCode,$courseCode]),
            'resources' => sl_ai_all($db, "SELECT title,description,url FROM resource_library WHERE status='active' AND (audience='all' OR audience='lecturer') ORDER BY created_at DESC,id DESC LIMIT 30"),
            'limitations' => ['Course-linked gradebook submissions and assignment submissions are not stored in this app.'],
        ];
    }
    if ($role === 'administrator') {
        $rules = sl_ai_risk_rules($db);
        $risk = sl_ai_risk_data($db, $rules, $courseCode);
        $students = array_values(array_filter($risk['students'], static fn($row) => in_array($row['risk'], ['Critical','High','Moderate'], true)));
        $risk['students'] = array_slice($students, 0, 100);
        unset($risk['rules']);
        if ($courseCode !== '') {
            $risk['selected_course'] = sl_ai_all($db, "SELECT c.code,c.title,COALESCE(d.name,'Unassigned department') AS department FROM academic_courses c LEFT JOIN departments d ON d.id=c.department_id WHERE c.code=? LIMIT 1", [$courseCode]);
        }
        $risk['scope'] = 'Authorized institutional records: active student enrolments, course sections, departments and recorded attendance. Risk signals are rule-based and require human review.';
        return $risk;
    }
    return ['scope' => 'No academic records are available for this role.'];
}
