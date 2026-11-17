<?php
declare(strict_types=1);

$host = getenv('TEST_DB_HOST') ?: '127.0.0.1';
$name = getenv('TEST_DB_NAME') ?: 'studentlife_test';
$user = getenv('TEST_DB_USER') ?: 'root';
$pass = getenv('TEST_DB_PASS') ?: 'root';
$pdo = new PDO("mysql:host={$host};dbname={$name};charset=utf8mb4", $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

$pdo->exec("CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(24) NOT NULL DEFAULT 'student',
    account_status VARCHAR(16) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
$pdo->exec("CREATE TABLE courses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(150) NOT NULL,
    credits TINYINT UNSIGNED NOT NULL DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
$pdo->exec("CREATE TABLE tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(180) NOT NULL,
    course VARCHAR(100) DEFAULT '',
    due_date DATE NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'todo',
    priority VARCHAR(10) NOT NULL DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
$pdo->exec("CREATE TABLE grades (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NOT NULL,
    assessment VARCHAR(150) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
$pdo->exec("CREATE TABLE events (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(180) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NULL,
    location VARCHAR(150) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(user_id,event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$insert = $pdo->prepare('INSERT INTO users(name,email,password_hash,role,account_status) VALUES(?,?,?,?,?)');
$hash = password_hash('TestPassword-2026!', PASSWORD_DEFAULT);
$accounts = [
    ['CI Administrator', 'admin@studentlife.test', $hash, 'administrator', 'active'],
    ['CI Lecturer', 'lecturer@studentlife.test', $hash, 'lecturer', 'active'],
    ['CI Student One', 'student1@studentlife.test', $hash, 'student', 'active'],
    ['CI Student Two', 'student2@studentlife.test', $hash, 'student', 'active'],
];
foreach ($accounts as $account) {
    $insert->execute($account);
}

$config = [
    'db_host' => $host,
    'db_name' => $name,
    'db_user' => $user,
    'db_pass' => $pass,
];
file_put_contents(__DIR__ . '/../../public/config.php', "<?php\nreturn " . var_export($config, true) . ";\n", LOCK_EX);
echo "Test database seeded and temporary config created.\n";
