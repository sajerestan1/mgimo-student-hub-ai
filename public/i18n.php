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

function sl_language_normalize(mixed $language): string
{
    return in_array($language, ['en', 'ru'], true) ? $language : 'en';
}
