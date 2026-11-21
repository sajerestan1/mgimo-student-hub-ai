<?php
declare(strict_types=1);

/** Central StudentLife interface translations. User-authored and academic data are never passed through this dictionary. */
function sl_i18n_catalogue(): array
{
    static $catalogue = [
        'en' => [
            'common.search'=>'Search','common.language'=>'Language','common.sign_in'=>'Sign In','common.sign_out'=>'Sign out',
            'common.email'=>'Email address','common.password'=>'Password','common.remember_me'=>'Remember me','common.show'=>'Show',
            'common.hide'=>'Hide','common.save'=>'Save','common.cancel'=>'Cancel','common.update'=>'Update','common.open'=>'Open',
            'common.student'=>'Student','common.lecturer'=>'Lecturer / Professor','common.administrator'=>'Administrator',
            'common.workspace'=>'YOUR WORKSPACE','common.student_workspace'=>'STUDENT WORKSPACE','common.lecturer_workspace'=>'LECTURER WORKSPACE',
            'common.admin_workspace'=>'ADMINISTRATOR WORKSPACE','common.academic_companion'=>'ACADEMIC COMPANION',
            'common.secure_access'=>'Secure access to your academic workspace','common.forgot_password'=>'Forgot password? Contact your administrator.',
            'nav.dashboard'=>'Dashboard','nav.learning'=>'LEARNING','nav.campus'=>'CAMPUS & SUPPORT','nav.communication'=>'COMMUNICATION',
            'nav.account'=>'ACCOUNT','nav.teaching'=>'TEACHING','nav.resources_settings'=>'RESOURCES & SETTINGS',
            'nav.my_courses'=>'My Courses','nav.assignments'=>'Assignments','nav.quizzes'=>'Quizzes & Exams',
            'nav.grades'=>'Grades & Transcript','nav.timetable'=>'Timetable','nav.attendance'=>'Attendance',
            'nav.academic_intelligence'=>'Academic Intelligence','nav.academic_integrity'=>'Academic Integrity',
            'nav.applications'=>'Applications & Certificates','nav.library'=>'Library','nav.study_groups'=>'Study Groups',
            'nav.notifications'=>'Notifications','nav.ai_study'=>'AI Academic Assistant','nav.study_planner'=>'Study Planner',
            'nav.recommendations'=>'Study Recommendations','nav.communication_hub'=>'Communication Hub','nav.inbox'=>'Inbox',
            'nav.announcements'=>'Announcements','nav.profile_settings'=>'Profile & Settings','nav.documents'=>'Documents & Resources',
            'nav.user_roles'=>'User & Role Management','nav.academic_management'=>'Academic Management','nav.reports'=>'Attendance Reports',
            'nav.risk_radar'=>'Academic Risk Radar','nav.analytics'=>'Reports & Analytics','nav.settings'=>'Settings',
            'header.search_placeholder'=>'Search courses, assignments, tasks...','header.mobile_search_placeholder'=>'Search courses, tasks…',
            'auth.tagline'=>'Your all-in-one academic space for learning, teaching and academic management.',
            'auth.heading'=>'YOUR ACADEMIC SPACE','auth.sign_in_subtitle'=>'Sign in to continue to your workspace.',
            'auth.access_as'=>'Access as','auth.email_placeholder'=>'Enter your email address','auth.password_placeholder'=>'Enter your password',
            'auth.password_show'=>'Show password','auth.language_label'=>'Language',
            'settings.choose_language'=>'Choose your workspace language.','settings.language_preference'=>'Language preference',
            'settings.language_help'=>'This changes the workspace interface. Course names, announcements and resources remain in the language they were written.',
            'settings.language_title'=>'Language','settings.saved_language'=>'Your language preference is saved to your account.',
            'dashboard.welcome'=>'Welcome','dashboard.manage_platform'=>'Manage users, academic activity and the StudentLife platform.',
            'communication.unread'=>'%d unread communications','communication.notifications'=>'Communication notifications',
            'page.dashboard'=>'Dashboard','page.users'=>'User & Role Management','page.academic'=>'Academic Management','page.announcements'=>'Announcements','page.documents'=>'Documents & Resources','page.reports'=>'Attendance Reports','page.analytics'=>'Reports & Analytics','page.settings'=>'System Settings','page.tasks'=>'Assignments & Tasks','page.courses'=>'My Courses','page.teaching_courses'=>'My Courses','page.grades'=>'Grades & Transcript','page.timetable'=>'Timetable','page.profile'=>'Profile & Settings','page.progress'=>'Academic Progress','page.quizzes'=>'Quizzes & Exams','page.intelligence'=>'Academic Intelligence','page.integrity'=>'Academic Integrity','page.applications'=>'Applications & Certificates','page.library'=>'Library','page.study_groups'=>'Study Groups','page.notifications'=>'Notifications','page.companion'=>'Study Companion','page.recommendations'=>'Study Recommendations','page.inbox'=>'Inbox','page.risk_radar'=>'Academic Risk Radar','page.ai_study'=>'AI Academic Assistant','page.ai_teaching'=>'AI Teaching Assistant',
        ],
        'ru' => [
            'common.search'=>'Поиск','common.language'=>'Язык','common.sign_in'=>'Войти','common.sign_out'=>'Выйти',
            'common.email'=>'Адрес электронной почты','common.password'=>'Пароль','common.remember_me'=>'Запомнить меня','common.show'=>'Показать',
            'common.hide'=>'Скрыть','common.save'=>'Сохранить','common.cancel'=>'Отмена','common.update'=>'Обновить','common.open'=>'Открыть',
            'common.student'=>'Студент','common.lecturer'=>'Преподаватель','common.administrator'=>'Администратор',
            'common.workspace'=>'ВАШЕ РАБОЧЕЕ ПРОСТРАНСТВО','common.student_workspace'=>'РАБОЧЕЕ ПРОСТРАНСТВО СТУДЕНТА','common.lecturer_workspace'=>'РАБОЧЕЕ ПРОСТРАНСТВО ПРЕПОДАВАТЕЛЯ',
            'common.admin_workspace'=>'РАБОЧЕЕ ПРОСТРАНСТВО АДМИНИСТРАТОРА','common.academic_companion'=>'АКАДЕМИЧЕСКИЙ ПОМОЩНИК',
            'common.secure_access'=>'Защищённый доступ к вашему учебному кабинету','common.forgot_password'=>'Забыли пароль? Обратитесь к администратору.',
            'nav.dashboard'=>'Главная','nav.learning'=>'ОБУЧЕНИЕ','nav.campus'=>'КАМПУС И ПОДДЕРЖКА','nav.communication'=>'ОБЩЕНИЕ',
            'nav.account'=>'УЧЁТНАЯ ЗАПИСЬ','nav.teaching'=>'ПРЕПОДАВАНИЕ','nav.resources_settings'=>'РЕСУРСЫ И НАСТРОЙКИ',
            'nav.my_courses'=>'Мои курсы','nav.assignments'=>'Задания','nav.quizzes'=>'Тесты и экзамены',
            'nav.grades'=>'Оценки и выписка','nav.timetable'=>'Расписание','nav.attendance'=>'Посещаемость',
            'nav.academic_intelligence'=>'Академическая аналитика','nav.academic_integrity'=>'Академическая добросовестность',
            'nav.applications'=>'Заявки и справки','nav.library'=>'Библиотека','nav.study_groups'=>'Учебные группы',
            'nav.notifications'=>'Уведомления','nav.ai_study'=>'ИИ-помощник в учёбе','nav.study_planner'=>'Планировщик занятий',
            'nav.recommendations'=>'Рекомендации по учёбе','nav.communication_hub'=>'Центр общения','nav.inbox'=>'Входящие',
            'nav.announcements'=>'Объявления','nav.profile_settings'=>'Профиль и настройки','nav.documents'=>'Документы и ресурсы',
            'nav.user_roles'=>'Пользователи и роли','nav.academic_management'=>'Управление обучением','nav.reports'=>'Отчёты о посещаемости',
            'nav.risk_radar'=>'Индикатор академических рисков','nav.analytics'=>'Отчёты и аналитика','nav.settings'=>'Настройки',
            'header.search_placeholder'=>'Поиск курсов, заданий и задач…','header.mobile_search_placeholder'=>'Поиск курсов и заданий…',
            'auth.tagline'=>'Единое учебное пространство для студентов, преподавателей и администраторов.',
            'auth.heading'=>'ВАШЕ УЧЕБНОЕ ПРОСТРАНСТВО','auth.sign_in_subtitle'=>'Войдите, чтобы продолжить работу.',
            'auth.access_as'=>'Войти как','auth.email_placeholder'=>'Введите адрес электронной почты','auth.password_placeholder'=>'Введите пароль',
            'auth.password_show'=>'Показать пароль','auth.language_label'=>'Язык',
            'settings.choose_language'=>'Выберите язык интерфейса.','settings.language_preference'=>'Язык интерфейса',
            'settings.language_help'=>'Язык интерфейса изменится. Названия курсов, объявления и ресурсы останутся на исходном языке.',
            'settings.language_title'=>'Язык','settings.saved_language'=>'Выбранный язык сохранён в вашей учётной записи.',
            'dashboard.welcome'=>'Добро пожаловать','dashboard.manage_platform'=>'Управляйте пользователями, учебной деятельностью и платформой StudentLife.',
            'communication.unread'=>'Непрочитанных сообщений: %d','communication.notifications'=>'Уведомления об общении',
            'page.dashboard'=>'Главная','page.users'=>'Пользователи и роли','page.academic'=>'Управление учебным процессом','page.announcements'=>'Объявления','page.documents'=>'Документы и ресурсы','page.reports'=>'Отчёты о посещаемости','page.analytics'=>'Отчёты и аналитика','page.settings'=>'Системные настройки','page.tasks'=>'Задания','page.courses'=>'Мои курсы','page.teaching_courses'=>'Мои курсы','page.grades'=>'Оценки и выписка','page.timetable'=>'Расписание','page.profile'=>'Профиль и настройки','page.progress'=>'Успеваемость','page.quizzes'=>'Тесты и экзамены','page.intelligence'=>'Академическая аналитика','page.integrity'=>'Академическая добросовестность','page.applications'=>'Заявки и справки','page.library'=>'Библиотека','page.study_groups'=>'Учебные группы','page.notifications'=>'Уведомления','page.companion'=>'Планировщик занятий','page.recommendations'=>'Рекомендации по учёбе','page.inbox'=>'Входящие','page.risk_radar'=>'Индикатор академических рисков','page.ai_study'=>'ИИ-помощник в учёбе','page.ai_teaching'=>'ИИ-помощник преподавателя',
        ],
    ];
    return $catalogue;
}

function sl_t(string $key, array $vars = []): string
{
    $lang = $GLOBALS['sl_language'] ?? 'en';
    $catalogue = sl_i18n_catalogue();
    $value = $catalogue[$lang][$key] ?? $catalogue['en'][$key] ?? $key;
    foreach ($vars as $name => $replacement) {
        $value = str_replace('{'.$name.'}', (string)$replacement, $value);
    }
    return $value;
}

function sl_plural_ru(int $count, string $one, string $few, string $many): string
{
    $n=abs($count);$n10=$n%10;$n100=$n%100;
    return ($n10===1&&$n100!==11)?$one:(($n10>=2&&$n10<=4&&($n100<12||$n100>14))?$few:$many);
}

function sl_format_date(string $date, ?string $language = null): string
{
    $language=$language??($GLOBALS['sl_language']??'en');
    $timestamp=strtotime($date);
    if($timestamp===false)return $date;
    if($language==='ru'){
        $months=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
        return date('j',$timestamp).' '.$months[(int)date('n',$timestamp)-1].' '.date('Y',$timestamp).' г.';
    }
    return date('F j, Y',$timestamp);
}

function sl_language_normalize(mixed $language): string
{
    return in_array($language, ['en', 'ru'], true) ? $language : 'en';
}

function sl_page_label(string $page): string
{
    return sl_t('page.'.$page);
}
