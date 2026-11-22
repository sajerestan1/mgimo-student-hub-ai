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
            'communication.page_title'=>'Communication Hub','communication.kicker'=>'STUDENT COMMUNICATION','communication.subtitle'=>'Class and study-group chats, with direct student messages when you need them.',
            'communication.new_chat'=>'New student chat…','communication.open'=>'Open','communication.groups_link'=>'Create or join a study group','communication.search'=>'Search','communication.search_placeholder'=>'Search active chat',
            'communication.conversations'=>'Your conversations','communication.no_chats'=>'Your course-section chats will appear here when you are enrolled in an active section.',
            'communication.choose_chat'=>'Choose a conversation','communication.choose_chat_help'=>'Open a course-section chat, start a private student message, or join a study group.',
            'communication.back'=>'← Conversations','communication.chat'=>'chat','communication.mute'=>'Mute','communication.unmute'=>'Unmute','communication.search_results'=>'Search results for “{query}” · {count} shown',
            'communication.earlier'=>'Load earlier messages','communication.no_matches'=>'No messages match your search.','communication.start'=>'No messages yet. Start the conversation.',
            'communication.removed'=>'Message removed','communication.edit'=>'Save edit','communication.remove'=>'Remove message','communication.report'=>'Report',
            'communication.type_message'=>'Type a message…','communication.attach'=>'Attach a file','communication.attach_help'=>'Attach PDF, TXT, DOCX, PPTX, PNG, JPG or WebP (up to 10 MB).',
            'page.dashboard'=>'Dashboard','page.login'=>'Sign In','page.search'=>'Search','page.communication'=>'Communication Hub','page.users'=>'User & Role Management','page.academic'=>'Academic Management','page.announcements'=>'Announcements','page.documents'=>'Documents & Resources','page.reports'=>'Attendance Reports','page.analytics'=>'Reports & Analytics','page.settings'=>'System Settings','page.tasks'=>'Assignments & Tasks','page.courses'=>'My Courses','page.teaching_courses'=>'My Courses','page.grades'=>'Grades & Transcript','page.timetable'=>'Timetable','page.profile'=>'Profile & Settings','page.progress'=>'Academic Progress','page.quizzes'=>'Quizzes & Exams','page.intelligence'=>'Academic Intelligence','page.integrity'=>'Academic Integrity','page.applications'=>'Applications & Certificates','page.library'=>'Library','page.study_groups'=>'Study Groups','page.notifications'=>'Notifications','page.companion'=>'Study Companion','page.recommendations'=>'Study Recommendations','page.inbox'=>'Inbox','page.risk_radar'=>'Academic Risk Radar','page.ai_study'=>'AI Academic Assistant','page.ai_teaching'=>'AI Teaching Assistant',
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
            'communication.page_title'=>'Центр общения','communication.kicker'=>'ОБЩЕНИЕ СТУДЕНТОВ','communication.subtitle'=>'Общайтесь в чатах курсов и учебных групп, а также отправляйте личные сообщения студентам.',
            'communication.new_chat'=>'Новый чат со студентом…','communication.open'=>'Открыть','communication.groups_link'=>'Создать учебную группу или присоединиться','communication.search'=>'Поиск','communication.search_placeholder'=>'Поиск в чате',
            'communication.conversations'=>'Ваши чаты','communication.no_chats'=>'Чаты курсов появятся здесь после зачисления в активную учебную группу.',
            'communication.choose_chat'=>'Выберите чат','communication.choose_chat_help'=>'Откройте чат курса, начните личную переписку или присоединитесь к учебной группе.',
            'communication.back'=>'← К чатам','communication.chat'=>'чат','communication.mute'=>'Отключить звук','communication.unmute'=>'Включить звук','communication.search_results'=>'Результаты поиска «{query}» · найдено: {count}',
            'communication.earlier'=>'Загрузить предыдущие сообщения','communication.no_matches'=>'Сообщений по вашему запросу нет.','communication.start'=>'Сообщений пока нет. Начните общение.',
            'communication.removed'=>'Сообщение удалено','communication.edit'=>'Сохранить','communication.remove'=>'Удалить сообщение','communication.report'=>'Пожаловаться',
            'communication.type_message'=>'Введите сообщение…','communication.attach'=>'Прикрепить файл','communication.attach_help'=>'Можно прикрепить PDF, TXT, DOCX, PPTX, PNG, JPG или WebP (до 10 МБ).',
            'page.dashboard'=>'Главная','page.login'=>'Войти','page.search'=>'Поиск','page.communication'=>'Центр общения','page.users'=>'Пользователи и роли','page.academic'=>'Управление учебным процессом','page.announcements'=>'Объявления','page.documents'=>'Документы и ресурсы','page.reports'=>'Отчёты о посещаемости','page.analytics'=>'Отчёты и аналитика','page.settings'=>'Системные настройки','page.tasks'=>'Задания','page.courses'=>'Мои курсы','page.teaching_courses'=>'Мои курсы','page.grades'=>'Оценки и выписка','page.timetable'=>'Расписание','page.profile'=>'Профиль и настройки','page.progress'=>'Успеваемость','page.quizzes'=>'Тесты и экзамены','page.intelligence'=>'Академическая аналитика','page.integrity'=>'Академическая добросовестность','page.applications'=>'Заявки и справки','page.library'=>'Библиотека','page.study_groups'=>'Учебные группы','page.notifications'=>'Уведомления','page.companion'=>'Планировщик занятий','page.recommendations'=>'Рекомендации по учёбе','page.inbox'=>'Входящие','page.risk_radar'=>'Индикатор академических рисков','page.ai_study'=>'ИИ-помощник в учёбе','page.ai_teaching'=>'ИИ-помощник преподавателя',
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

function sl_i18n_phrase_map(): array
{
    static $map=null;if($map!==null)return $map;
    $map=[];
    $catalogue=sl_i18n_catalogue();
    foreach($catalogue['en'] as $key=>$english){$russian=$catalogue['ru'][$key]??null;if(is_string($english)&&is_string($russian)&&$english!==$russian)$map[$english]=$russian;}
    $extra=[
        'ADMINISTRATION'=>'АДМИНИСТРИРОВАНИЕ','ACADEMIC MANAGEMENT'=>'УПРАВЛЕНИЕ ОБУЧЕНИЕМ','COMMUNICATION & RESOURCES'=>'ОБЩЕНИЕ И РЕСУРСЫ','INSIGHTS & CONTROL'=>'АНАЛИТИКА И УПРАВЛЕНИЕ',
        'Signed in as'=>'Вы вошли как','Menu'=>'Меню','Search StudentLife'=>'Поиск в StudentLife','Show'=>'Показать','Hide'=>'Скрыть','EN'=>'EN','RU'=>'RU',
        'Total Users'=>'Всего пользователей','Across all accounts'=>'Во всех учётных записях','Course Sections'=>'Учебные группы','active enrolments'=>'активных зачислений',
        'Class Sessions'=>'Занятия','upcoming ·'=>'предстоящих ·','attendance records'=>'записей посещаемости','PLATFORM CONTROL'=>'УПРАВЛЕНИЕ ПЛАТФОРМОЙ',
        'Manage Users →'=>'Управление пользователями →','Students'=>'Студенты','Lecturers / Professors'=>'Преподаватели','Administrators'=>'Администраторы',
        'Create accounts and assign access roles. Public registration remains disabled.'=>'Создавайте учётные записи и назначайте роли. Открытая регистрация отключена.',
        'ACADEMIC OVERSIGHT'=>'КОНТРОЛЬ УЧЕБНОГО ПРОЦЕССА','Academic Activity'=>'Учебная деятельность','Manage Academics →'=>'Управление обучением →',
        'Course sections'=>'Учебные группы','Upcoming class sessions'=>'Предстоящие занятия','Attendance records'=>'Записи посещаемости',
        'Monitor shared institutional courses, enrolments, scheduled classes and recorded attendance.'=>'Отслеживайте общие курсы, зачисления, расписание и посещаемость.',
        'RECENT REGISTRATIONS'=>'НЕДАВНО СОЗДАННЫЕ УЧЁТНЫЕ ЗАПИСИ','Recently Created Accounts'=>'Недавно созданные учётные записи','View All →'=>'Показать все →',
        'Name'=>'Имя','Role'=>'Роль','Created'=>'Создано','PROJECT MODULES'=>'РАЗДЕЛЫ ПЛАТФОРМЫ','Administration Shortcuts'=>'Быстрый доступ к администрированию',
        'Create student, lecturer and admin accounts'=>'Создание учётных записей студентов, преподавателей и администраторов',
        'Academic Overview'=>'Обзор учебного процесса','Review courses, tasks, timetable and grades'=>'Просмотр курсов, заданий, расписания и оценок',
        'Plan notices for the community'=>'Подготовка объявлений для сообщества','Review platform activity'=>'Просмотр активности платформы',
        'Message any active student, lecturer or administrator'=>'Сообщения студентам, преподавателям и администраторам',
        'Update your profile and sign-in password'=>'Изменение профиля и пароля для входа',
        'LECTURER WORKSPACE'=>'РАБОЧЕЕ ПРОСТРАНСТВО ПРЕПОДАВАТЕЛЯ','Your teaching assignments, upcoming classes and attendance responsibilities.'=>'Ваши курсы, предстоящие занятия и задачи по учёту посещаемости.',
        'Assigned sections'=>'Назначенные группы','Enrolled students'=>'Зачисленные студенты','Upcoming sessions'=>'Предстоящие занятия','Sessions needing attendance'=>'Занятия без отметок посещаемости',
        'Upcoming teaching sessions'=>'Предстоящие занятия','Open timetable →'=>'Открыть расписание →','No upcoming sessions are scheduled for your assigned sections.'=>'Для назначенных вам групп предстоящих занятий нет.',
        'STUDENT WORKSPACE'=>'РАБОЧЕЕ ПРОСТРАНСТВО СТУДЕНТА','Your academic activity, classes and progress at a glance.'=>'Краткий обзор вашей учёбы, занятий и успеваемости.',
        'View courses →'=>'К курсам →','Semester average'=>'Средний балл за семестр','View grades →'=>'К оценкам →','Attendance'=>'Посещаемость','View report →'=>'К отчёту →',
        'Upcoming classes'=>'Предстоящие занятия',
        'ACADEMIC BRIEFING'=>'УЧЕБНАЯ СВОДКА','What needs your attention'=>'Требует внимания','All assignments →'=>'Все задания →',
        'Check the task details and contact your lecturer if you need clarification on next steps.'=>'Проверьте задание и свяжитесь с преподавателем, если нужны разъяснения.',
        'No upcoming dated tasks are recorded. Add official deadlines as your lecturers publish them.'=>'Заданий с указанными сроками пока нет. Добавляйте официальные сроки после публикации преподавателями.',
        'ACADEMIC PERFORMANCE'=>'УЧЕБНЫЕ РЕЗУЛЬТАТЫ','Course results'=>'Результаты по курсам','Open intelligence →'=>'Открыть аналитику →',
        'Record returned assessments under Grades to see course progress here.'=>'Добавьте результаты оценивания в раздел «Оценки», чтобы видеть прогресс по курсам.',
        'My upcoming classes'=>'Мои предстоящие занятия','View timetable →'=>'К расписанию →','No upcoming institutional classes are scheduled for your account yet.'=>'Для вашей учётной записи пока нет занятий в расписании.',
        'Room'=>'Аудитория','Set this week’s focus'=>'Цель на эту неделю','Review courses →'=>'Просмотреть курсы →','Keep deadlines visible'=>'Следите за сроками',
        'Open assignments →'=>'Открыть задания →','Check your records'=>'Проверьте свои записи','Attendance →'=>'Посещаемость →',
        'CAMPUS UPDATES'=>'НОВОСТИ КАМПУСА','Recent announcements'=>'Последние объявления','All updates →'=>'Все обновления →',
        'No new announcements are published.'=>'Новых объявлений нет.','NEXT STEPS'=>'СЛЕДУЮЩИЕ ШАГИ','Student tools'=>'Инструменты студента',
        'Open inbox'=>'Открыть входящие','Plan a study session'=>'Запланировать занятие','Find or start a study group'=>'Найти или создать учебную группу',
        'See study recommendations'=>'Посмотреть рекомендации по учёбе','My courses'=>'Мои курсы','Demo data'=>'Демонстрационные данные',
        'Course workspace →'=>'К курсу →','8 modules'=>'8 модулей','28 resources'=>'28 ресурсов','Fall Semester 2026'=>'Осенний семестр 2026',
        'DEMO ASSIGNMENTS'=>'ДЕМОНСТРАЦИОННЫЕ ЗАДАНИЯ','Assignments & tasks'=>'Задания и задачи','View tasks →'=>'К заданиям →',
        'Open'=>'Открыть','Download PDF brief'=>'Скачать задание в PDF','Upload submission'=>'Загрузить работу','Upload file'=>'Загрузить файл',
        'Your uploaded files'=>'Ваши загруженные файлы','Download'=>'Скачать','Personal tasks'=>'Личные задачи',
        'No personal tasks yet. Add assignments to keep track of deadlines.'=>'Личных задач пока нет. Добавьте задания, чтобы следить за сроками.',
        'Task'=>'Задача','Due'=>'Срок','Status'=>'Статус','FIND WHAT YOU NEED'=>'ПОИСК','Search StudentLife'=>'Поиск в StudentLife',
        'Search your courses, assignments and timetable events.'=>'Ищите курсы, задания и события расписания.','Enter a keyword in the search bar above.'=>'Введите запрос в строке поиска выше.',
        'No matching courses, assignments or timetable events were found.'=>'Курсы, задания и события расписания по запросу не найдены.',
        'Type'=>'Тип','Result'=>'Результат','Details'=>'Подробности','ADMINISTRATION · ACCESS CONTROL'=>'АДМИНИСТРИРОВАНИЕ · ДОСТУП',
        'Create accounts and assign the correct workspace. Only administrators can manage accounts.'=>'Создавайте учётные записи и назначайте рабочие пространства. Управлять учётными записями могут только администраторы.',
        'Create a new account'=>'Создать учётную запись','Admin only'=>'Только администратор','Workspace role'=>'Роль в системе',
        'Create account'=>'Создать учётную запись','All registered accounts'=>'Все учётные записи','accounts'=>'учётных записей',
        'Account'=>'Учётная запись','Role & status'=>'Роль и статус','Administrator actions'=>'Действия администратора',
        'Account status'=>'Статус учётной записи','Active'=>'Активна','Suspended'=>'Приостановлена','Deactivated'=>'Отключена',
        'Email verification'=>'Подтверждение почты','Needs verification'=>'Требуется подтверждение','Mark verified by administrator'=>'Подтвердить от имени администратора',
        'Optional password reset'=>'Сброс пароля (необязательно)','Save account changes'=>'Сохранить изменения учётной записи',
        'Administrator audit trail'=>'Журнал действий администратора','Latest 15 actions'=>'Последние 15 действий','No administrator actions recorded yet.'=>'Действия администратора пока не зарегистрированы.',
        'Action'=>'Действие','Demo data setup'=>'Настройка демонстрационных данных','Seed demo data'=>'Добавить демонстрационные данные',
        'ADMINISTRATION · SHARED ACADEMIC DATA'=>'АДМИНИСТРИРОВАНИЕ · ОБЩИЕ УЧЕБНЫЕ ДАННЫЕ','Academic Management'=>'Управление учебным процессом',
        'Departments'=>'Факультеты','Academic terms'=>'Учебные периоды','Course catalogue'=>'Каталог курсов','Create department'=>'Создать факультет',
        'Save department'=>'Сохранить факультет','Create academic term'=>'Создать учебный период','Save term'=>'Сохранить период',
        'Add course to catalogue'=>'Добавить курс в каталог','Department'=>'Факультет','No department assigned'=>'Факультет не назначен',
        'Description'=>'Описание','Add catalogue course'=>'Добавить курс в каталог','Open a course section'=>'Открыть учебную группу',
        'Academic term'=>'Учебный период','Lecturer'=>'Преподаватель','Not assigned'=>'Не назначен','Create course section'=>'Создать учебную группу',
        'Enrol a student'=>'Зачислить студента','Course section'=>'Учебная группа','Student account'=>'Учётная запись студента','Enrol student'=>'Зачислить студента',
        'Current enrolments'=>'Текущие зачисления','Student registrations across all shared course sections.'=>'Зачисления студентов во все общие учебные группы.',
        'Shared course catalogue'=>'Общий каталог курсов','courses'=>'курсов','Code'=>'Код','Credits'=>'Кредиты',
        'The shared catalogue is empty. Add the first course above.'=>'Общий каталог пуст. Добавьте первый курс выше.',
        'Course sections & lecturer assignments'=>'Учебные группы и назначения преподавателей','sections'=>'групп','Term / Section'=>'Период / группа',
        'Enrolled'=>'Зачислено','Capacity'=>'Вместимость','No course sections have been created yet.'=>'Учебные группы ещё не созданы.',
        'Schedule class sessions'=>'Составить расписание занятий','Save class schedule'=>'Сохранить расписание занятий',
        'ATTENDANCE INSIGHTS'=>'АНАЛИЗ ПОСЕЩАЕМОСТИ','Attendance Reports'=>'Отчёты о посещаемости',
        'Attendance records are visible according to your account role.'=>'Записи посещаемости доступны в соответствии с вашей ролью.',
        'How to read this report'=>'Как читать этот отчёт','Present'=>'Присутствовал','Absent'=>'Отсутствовал','Late'=>'Опоздал',
        'Recorded sessions'=>'Занятия с отметками','No attendance records have been recorded yet.'=>'Записи посещаемости пока отсутствуют.',
        'A live summary of academic activity recorded in StudentLife.'=>'Текущая сводка учебной активности в StudentLife.',
        'Workspace activity by account'=>'Активность в рабочих пространствах','Preview records'=>'Записи предпросмотра',
        'No active accounts were found.'=>'Активные учётные записи не найдены.','Enrolled sections'=>'Группы, в которые зачислен',
        'Write an announcement'=>'Создать объявление','Title'=>'Название','Message'=>'Сообщение','Audience'=>'Аудитория','Everyone'=>'Все',
        'Publish now'=>'Опубликовать','Draft'=>'Черновик','Save announcement'=>'Сохранить объявление','There are no announcements for your account yet.'=>'Для вашей учётной записи пока нет объявлений.',
        'Add a resource'=>'Добавить ресурс','Link (optional)'=>'Ссылка (необязательно)','Add resource'=>'Добавить ресурс',
        'No resources are available yet.'=>'Ресурсы пока недоступны.','For everyone'=>'Для всех','Open resource ↗'=>'Открыть ресурс ↗',
        'Demo resource — no file attached.'=>'Демонстрационный ресурс — файл не прикреплён.','Archive'=>'В архив','Restore'=>'Восстановить',
        'WORKSPACE'=>'РАБОЧЕЕ ПРОСТРАНСТВО','System Settings'=>'Системные настройки','Settings'=>'Настройки',
        'Set the institution details shown across the workspace.'=>'Настройте сведения об учебном заведении, отображаемые в системе.',
        'Choose your workspace language.'=>'Выберите язык интерфейса.','Institution details'=>'Сведения об учебном заведении',
        'Institution name'=>'Название учебного заведения','Academic year'=>'Учебный год','Support email'=>'Электронная почта поддержки',
        'Save settings'=>'Сохранить настройки','Account security'=>'Безопасность учётной записи',
        'StudentLife uses your account email and password. Contact an administrator if you need a password reset.'=>'Для входа используются электронная почта и пароль учётной записи. Для сброса пароля обратитесь к администратору.',
        'Language'=>'Язык','Language selection applies to the current browser session.'=>'Выбранный язык действует только в текущем сеансе браузера.',
        'YOUR ACCOUNT'=>'ВАША УЧЁТНАЯ ЗАПИСЬ','My Profile'=>'Мой профиль','Review your account details and update your display name.'=>'Просматривайте данные учётной записи и изменяйте отображаемое имя.',
        'Display name'=>'Отображаемое имя','Email'=>'Электронная почта','Save profile'=>'Сохранить профиль',
        'Change password'=>'Изменить пароль','Current password'=>'Текущий пароль','New password'=>'Новый пароль','Confirm new password'=>'Подтвердите новый пароль',
        'Update password'=>'Обновить пароль','Academic Progress'=>'Успеваемость','Summary of current courses, assignments and attendance.'=>'Сводка по текущим курсам, заданиям и посещаемости.',
        'Announcements'=>'Объявления','Campus updates and notices for your account.'=>'Новости кампуса и уведомления для вашей учётной записи.',
        'Keep up with course updates'=>'Следите за обновлениями курсов','Documents & Resources'=>'Документы и ресурсы',
        'Shared reading and study links for your courses.'=>'Учебные материалы и ссылки для ваших курсов.','Read an academic article'=>'Как читать академическую статью',
        'Plan an essay'=>'Как спланировать эссе','Use sources carefully'=>'Работайте с источниками внимательно',
        'Create a practice set'=>'Создать тренировочный набор','No conversations yet.'=>'Бесед пока нет.',
        'AI Academic Assistant'=>'ИИ-помощник в учёбе','AI Study Companion'=>'Помощник по учёбе с ИИ',
        'Try asking'=>'Попробуйте спросить','Send question'=>'Отправить вопрос','Your question'=>'Ваш вопрос',
        'Your course and record context'=>'Контекст курсов и учебных записей','Ask the Study Companion'=>'Спросить учебного помощника',
        'AI service is not configured.'=>'Сервис ИИ не настроен.','Provider configured'=>'Поставщик ИИ настроен',
        'Practice a topic'=>'Повторите тему','Plan study time'=>'Запланируйте время для учёбы','Check your records'=>'Проверьте учебные записи',
        'Grades & Transcript'=>'Оценки и выписка','Quizzes & Exams'=>'Тесты и экзамены','Timetable'=>'Расписание','Library'=>'Библиотека',
        'Study Groups'=>'Учебные группы','Applications & Certificates'=>'Заявки и справки','Academic Integrity'=>'Академическая добросовестность',
        'Profile & Settings'=>'Профиль и настройки','Update'=>'Обновить','Save'=>'Сохранить','Cancel'=>'Отмена',
        'No messages yet.'=>'Сообщений пока нет.','Send message'=>'Отправить сообщение','Reply'=>'Ответить','Edit'=>'Изменить','Delete'=>'Удалить',
        'Pending'=>'Ожидает рассмотрения','Approved'=>'Одобрено','Rejected'=>'Отклонено','Processing'=>'В обработке',
        'Very Weak'=>'Очень слабый','Weak'=>'Слабый','Normal'=>'Средний','Strong'=>'Надёжный','Very Strong'=>'Очень надёжный',
        'COURSE TEACHING SUPPORT'=>'ПОДДЕРЖКА ПРЕПОДАВАНИЯ ПО КУРСАМ',
        'Check assigned courses and authorised class attendance, then ask for teaching support.'=>'Проверьте назначенные курсы и подтверждённые данные посещаемости, затем запросите поддержку в преподавании.',
        'Check assigned courses and authorized class attendance, then ask for teaching support.'=>'Проверьте назначенные курсы и подтверждённые данные посещаемости, затем запросите поддержку в преподавании.',
        '4 assigned course groups · 6 enrolled-student attendance summaries · 1 upcoming class session. Course-linked gradebooks and assignment submissions are not stored in this app.'=>'4 назначенные учебные группы · 6 сводок посещаемости студентов · 1 предстоящее занятие. Оценки по курсам и отправленные задания в этом приложении не хранятся.',
        'Ask for announcement or assignment wording. Confirm course dates and assessment instructions before publishing.'=>'Запросите формулировку объявления или задания. Перед публикацией проверьте даты занятий и инструкции по оцениванию.',
        'Summarize attendance in my assigned courses.'=>'Сделайте сводку посещаемости по назначенным мне курсам.',
        'Which enrolled students have repeated recorded absences?'=>'У каких зачисленных студентов неоднократно отмечалось отсутствие?',
        'Draft a clear announcement for my course.'=>'Подготовьте понятный текст объявления для моего курса.',
        'What course data is unavailable?'=>'Какие данные о курсе недоступны?',
        'Ask a question about records available to your role. Answers will cite the supplied context and identify missing data.'=>'Задайте вопрос о записях, доступных вашей роли. В ответе будут указаны использованные данные и недостающая информация.',
        'PROVIDER CONFIGURED'=>'ПОСТАВЩИК НАСТРОЕН',
        'Ask the Teaching Assistant'=>'Спросить помощника преподавателя',
        'Month'=>'Месяц','Day'=>'День','Year'=>'Год',
        'Date of next contact'=>'Дата следующего контакта',
        'Due date'=>'Срок сдачи',
        'Only tasks you add here appear in your list. Confirm official deadlines and requirements with your lecturer.'=>'Здесь отображаются только добавленные вами задачи. Уточняйте официальные сроки и требования у преподавателя.',
        'My classes attendance'=>'Посещаемость на моих занятиях',
        'Send a private message to any active student, lecturer or administrator account and review your replies.'=>'Отправляйте личные сообщения активным учётным записям студентов, преподавателей и администраторов и просматривайте ответы.',
        'Messages stay inside this StudentLife preview. They do not send email or create notifications outside the app.'=>'Сообщения остаются в тестовой версии StudentLife. Они не отправляются по электронной почте и не создают уведомлений за пределами приложения.',
        'Start with the abstract and conclusion. Identify the question, the author’s claim, the evidence and any limits in the argument.'=>'Начните с аннотации и заключения. Определите вопрос, тезис автора, доказательства и ограничения аргументации.',
        'Turn the prompt into a question, build a point-by-point outline and attach a source to each key claim before drafting.'=>'Преобразуйте тему в вопрос, составьте подробный план и подберите источник для каждого основного тезиса перед написанием текста.',
        'Keep full source details as you read. Mark direct quotations clearly and explain how each source supports your own point.'=>'Записывайте полные сведения об источниках во время чтения. Отмечайте прямые цитаты и объясняйте, как каждый источник подтверждает вашу мысль.',
        'Check the room and start time, review the previous topic and bring any reading or materials listed by your lecturer.'=>'Проверьте аудиторию и время начала, повторите предыдущую тему и возьмите материалы, указанные преподавателем.',
        'Sample notice for lecturers: review your assigned groups and class sessions for the current term.'=>'Образец объявления для преподавателей: проверьте назначенные группы и занятия на текущий семестр.',
        'Teacher coordination session'=>'Совещание преподавателей',
        'User & Role Management'=>'Управление пользователями и ролями',
        'Leave blank to keep current password'=>'Оставьте поле пустым, чтобы сохранить текущий пароль',
        'Enter full name'=>'Введите полное имя',
        'verified'=>'подтверждена',
        'Nov 17, 2026'=>'17 ноября 2026 г.','Nov 18, 2026'=>'18 ноября 2026 г.','Nov 19, 2026'=>'19 ноября 2026 г.','Nov 20, 2026'=>'20 ноября 2026 г.','Nov 21, 2026'=>'21 ноября 2026 г.','Nov 22, 2026'=>'22 ноября 2026 г.','Nov 23, 2026'=>'23 ноября 2026 г.','Nov 24, 2026'=>'24 ноября 2026 г.','Nov 25, 2026'=>'25 ноября 2026 г.','Nov 26, 2026'=>'26 ноября 2026 г.','Nov 27, 2026'=>'27 ноября 2026 г.','Nov 28, 2026'=>'28 ноября 2026 г.','Nov 29, 2026'=>'29 ноября 2026 г.','Nov 30, 2026'=>'30 ноября 2026 г.',
        'Active students'=>'Активные студенты',
        'Enrolments'=>'Зачисления',
        '1 open · 1 overdue'=>'1 открытое · 1 просроченное',
        'Email verified'=>'Электронная почта подтверждена',
        'Created'=>'Создано',
        'Choose a new password you do not use on other sites. Administrators can also reset another account’s password under Users & Roles.'=>'Выберите новый пароль, который не используете на других сайтах. Администраторы также могут сбросить пароль другой учётной записи в разделе «Пользователи и роли».',
        'Your email and role identify this account and can’t be changed from this form. Use a display name you recognise on class records.'=>'Электронная почта и роль определяют эту учётную запись и не могут быть изменены в этой форме. Укажите имя, по которому вас будут узнавать в учебных записях.'
    ];
    $extraMore=[
        'No completed demo assessments yet. Your attempts on this device will appear here.'=>'Вы ещё не проходили демонстрационные тесты. Результаты попыток на этом устройстве появятся здесь.',
        'High risk'=>'Высокий риск','Critical risk'=>'Критический риск','Message a student'=>'Написать студенту','Search this conversation'=>'Поиск в этой беседе',
        'Harassment'=>'Оскорбления и преследование','Spam'=>'Спам','Threat'=>'Угрозы','Private information'=>'Личные данные','Other'=>'Другое',
        'Attach an academic file'=>'Прикрепить учебный файл',
        'English'=>'Английский','🇬🇧 English'=>'🇬🇧 Английский','Courses'=>'Курсы','Course'=>'Курс','Topic'=>'Тема','Communication Inbox'=>'Входящие сообщения',
        'Sample course catalogue for the student dashboard. All instructors and addresses below are fictional.'=>'Пример каталога курсов для панели студента. Все преподаватели и адреса вымышлены.',
        'Create departments, academic terms, course catalogue entries, course sections and student enrolments.'=>'Создавайте кафедры, учебные периоды, курсы, учебные группы и записи о зачислении студентов.',
        'Add at least one catalogue course and one academic term first.'=>'Сначала добавьте хотя бы один курс в каталог и один учебный период.',
        'Create a single session or repeat it weekly through the selected end date (maximum 60 sessions).'=>'Создайте одно занятие или повторяйте его еженедельно до выбранной даты (не более 60 занятий).',
        'No course sections have been assigned to your lecturer account yet. Please contact the administrator.'=>'К вашей учётной записи преподавателя пока не привязаны учебные группы. Обратитесь к администратору.',
        'For each reading, note its main claim, the evidence it uses and one point you want to discuss.'=>'Для каждого текста запишите основной тезис, приведённые доказательства и один вопрос для обсуждения.',
        'Add personal courses and record returned marks to build this view.'=>'Добавьте личные курсы и внесённые оценки, чтобы сформировать эту сводку.',
        'Active students with at least one active course enrolment'=>'Активные студенты, зачисленные хотя бы на один курс',
        'Requiring attention'=>'Требуют внимания','Moderate, high or critical attendance signal'=>'Умеренный, высокий или критический риск по посещаемости',
        'Attendance below configured high threshold'=>'Посещаемость ниже установленного порога высокого риска',
        'Attendance below configured critical threshold'=>'Посещаемость ниже установленного порога критического риска',
        'Data limits'=>'Ограничения данных','EARLY WARNING'=>'РАННЕЕ ПРЕДУПРЕЖДЕНИЕ','Students requiring review'=>'Студенты, требующие проверки',
        'Print risk report'=>'Распечатать отчёт о рисках','Risk'=>'Риск','Recorded / scheduled'=>'Отмечено / запланировано','Rules: moderate below'=>'Правила: умеренный риск ниже',
        'CONFIGURATION'=>'НАСТРОЙКА','Attendance thresholds'=>'Пороговые значения посещаемости','Save risk rules'=>'Сохранить правила оценки рисков',
        'DEPARTMENT INTELLIGENCE'=>'АНАЛИТИКА ПО КАФЕДРАМ','Attendance by department'=>'Посещаемость по кафедрам','Marked records'=>'Отмеченные записи',
        'COURSE CONCERNS'=>'РИСКИ ПО КУРСАМ','Attendance by course'=>'Посещаемость по курсам','ATTENDANCE TREND'=>'ДИНАМИКА ПОСЕЩАЕМОСТИ',
        'Recorded attendance over time'=>'Посещаемость за период','Month'=>'Месяц','Marked sessions'=>'Отмеченные занятия','Rate'=>'Показатель',
        'Quizzes & exams'=>'Тесты и экзамены','Documents & resources'=>'Документы и ресурсы','Applications & certificates'=>'Заявки и справки',
        'Learn · Teach · Achieve'=>'Учись · Преподавай · Достигай','Sign out ↗'=>'Выйти ↗','Welcome,'=>'Добро пожаловать,',
        'My Profile & Password'=>'Мой профиль и пароль','Class'=>'Занятие','Date'=>'Дата','Time'=>'Время','Active courses'=>'Активные курсы',
        'Due Nov 23'=>'Срок: 23 ноября','Teaching sections'=>'Учебные группы преподавателя','Personal courses'=>'Личные курсы','Tasks'=>'Задания','Grades'=>'Оценки','Events'=>'События','Course activity'=>'Активность по курсам',
        'No academic course data is available yet.'=>'Данные об учебных курсах пока отсутствуют.','Sessions'=>'Занятия','Lecturers'=>'Преподаватели','Save draft'=>'Сохранить черновик','Published'=>'Опубликовано','Archived'=>'В архиве','For'=>'Для',
        'A summary of your current courses, assignments and attendance.'=>'Сводка по вашим курсам, заданиям и посещаемости.',
        'Attendance present'=>'Присутствовал','High'=>'Высокий',
        'Spend a few minutes organising notes and record questions while the discussion is still fresh.'=>'Уделите несколько минут упорядочиванию заметок и запишите вопросы, пока обсуждение ещё свежо в памяти.',
        'Administrators create one-off or recurring weekly class sessions from Academic Management.'=>'Администраторы создают разовые или еженедельные занятия в разделе «Управление обучением».',
        'Save a PDF, image or calendar file. The latest timetable is cached on this device when opened online.'=>'Сохраните расписание в PDF, как изображение или файл календаря. При открытии онлайн последняя версия сохраняется на этом устройстве.',
        'Send request'=>'Отправить запрос','STUDY MATERIALS'=>'УЧЕБНЫЕ МАТЕРИАЛЫ','Shared learning resources available to students.'=>'Учебные материалы, доступные студентам.',
        'LEARN TOGETHER'=>'УЧИТЕСЬ ВМЕСТЕ','This page brings together current StudentLife records. It does not send push notifications.'=>'На этой странице собраны актуальные данные StudentLife. Push-уведомления не отправляются.',
        'Student access:'=>'Доступно студентам:','Choose every correct option. The answer is correct only when the full set matches.'=>'Выберите все правильные варианты. Ответ засчитывается, только если выбран весь правильный набор.',
        'Enter a brief term or phrase. Demo answers are checked against listed accepted answers.'=>'Введите короткий термин или фразу. В демонстрационной версии ответ сверяется со списком допустимых вариантов.',
        'No image upload or image-question section is used on this page.'=>'На этой странице нет загрузки изображений и вопросов с изображениями.',
        'Written answer is not auto-scored.'=>'Развёрнутый ответ не оценивается автоматически.',
        'No active students are enrolled in open course sections.'=>'В открытые учебные группы пока не зачислены активные студенты.',
        'No department-linked enrolments are available.'=>'Нет зачислений, связанных с кафедрами.','No course-offering records are available.'=>'Нет данных об учебных группах.',
        'Course-linked grades and official assignment submissions are unavailable in this app.'=>'Оценки по курсам и официальные отправленные задания в этом приложении недоступны.',
        'There are no attendance records to chart.'=>'Нет записей посещаемости для построения графика.',
        'AI privacy:'=>'Конфиденциальность ИИ:','Assigned teaching context'=>'Контекст назначенных курсов',
        'Use your actual class schedule and due dates in the context when the AI service is configured.'=>'После настройки ИИ используйте в контексте своё расписание и сроки сдачи заданий.',
        'Use Quizzes & Exams for local revision prompts that work without an AI connection.'=>'Раздел «Тесты и экзамены» содержит задания для самостоятельного повторения без подключения к ИИ.',
        'Course performance'=>'Успеваемость по курсам','Course and attendance summaries are based on sections assigned to your lecturer account.'=>'Сводки по курсам и посещаемости основаны на группах, назначенных вашей учётной записи преподавателя.',
        'Draft teaching materials'=>'Черновики учебных материалов','Student support'=>'Поддержка студентов',
        'Attendance concern lists show only students enrolled in your assigned offerings.'=>'В списке студентов с проблемами посещаемости показаны только учащиеся ваших учебных групп.',
        'ONE ASSISTANT · CHOOSE A STARTING POINT'=>'ОДИН ПОМОЩНИК · ВЫБЕРИТЕ ТЕМУ','Learn a subject'=>'Изучить предмет','Step-by-step explanations and practice checks'=>'Пошаговые объяснения и задания для самопроверки',
        'Prepare for exams'=>'Подготовиться к экзаменам','Practice questions and a revision outline'=>'Тренировочные вопросы и план повторения','Plan my studies'=>'Спланировать учёбу',
        'Use recorded classes and task deadlines'=>'Использовать расписание занятий и сроки заданий','Analyze my grades'=>'Разобрать оценки','Explain only marks recorded in my account'=>'Разбирать только оценки из моей учётной записи',
        'Talk through a challenge'=>'Обсудить сложную ситуацию','Choose a manageable next step at your own pace'=>'Выберите следующий шаг, который вам по силам',
        'Research & writing'=>'Исследования и письмо','Plan and improve your own academic work'=>'Планируйте и улучшайте собственные учебные работы',
        'Translate & explain'=>'Перевод и объяснение','English and Russian academic wording'=>'Академические формулировки на английском и русском',
        'Analyze documents'=>'Анализ документов','Ask questions about your private uploaded materials'=>'Задавайте вопросы по загруженным вами материалам',
        'University guide'=>'Справочник университета','Understand the existing student request form'=>'Информация о действующей форме заявок студентов',
        'Conversation history'=>'История бесед','New →'=>'Новая беседа →','Manage'=>'Управление','Rename'=>'Переименовать','Copy'=>'Копировать','Retry last question'=>'Повторить последний вопрос',
        'All records you are authorized to view'=>'Все записи, доступные вам','No uploaded document'=>'Документ не загружен',
        'The selected document text will be sent to the configured AI provider with your question.'=>'Текст выбранного документа вместе с вашим вопросом будет отправлен настроенному поставщику ИИ.',
        'General help'=>'Общие вопросы','Personal support'=>'Личная поддержка','Exam preparation'=>'Подготовка к экзамену','Study planning'=>'Планирование учёбы',
        'Grades and progress'=>'Оценки и успеваемость','Research and writing'=>'Исследования и письмо','English and Russian'=>'Английский и русский',
        'Shared resources'=>'Общие материалы','Selected document'=>'Выбранный документ','Answer my question'=>'Ответить на мой вопрос','Quick summary'=>'Краткое изложение',
        'Detailed study notes'=>'Подробные учебные заметки','Revision notes'=>'Заметки для повторения','Key definitions'=>'Основные определения','Key arguments'=>'Основные аргументы',
        'Flashcards'=>'Карточки для запоминания','Multiple-choice practice'=>'Тест с вариантами ответа','Essay practice questions'=>'Вопросы для подготовки к эссе',
        'Topic outline'=>'План темы','Glossary'=>'Глоссарий','ACADEMIC INTELLIGENCE'=>'АКАДЕМИЧЕСКАЯ АНАЛИТИКА','Recorded grade review'=>'Анализ внесённых оценок',
        'Marks'=>'Оценки','Evidence note'=>'Примечание с обоснованием','YOUR PRIVATE PREFERENCES'=>'ВАШИ ЛИЧНЫЕ НАСТРОЙКИ','Memory and Personalization'=>'Память и персонализация',
        'Save memory settings'=>'Сохранить настройки памяти','Save a memory'=>'Сохранить заметку в памяти','Academic goals or challenges'=>'Учебные цели или трудности',
        'Learning preferences'=>'Предпочтения в обучении','Personal context'=>'Личная информация','What should the assistant remember?'=>'Что помощнику следует запомнить?',
        'Save memory'=>'Сохранить','Saved memories ('=>'Сохранённые заметки (','Clear memory'=>'Очистить память','No memories saved. Nothing from your conversations is retained as memory.'=>'Заметок пока нет. Содержание ваших бесед не сохраняется в памяти.',
        'Updated'=>'Обновлено','Memory'=>'Память','Save changes'=>'Сохранить изменения','Delete memory'=>'Удалить заметку',
        'PERSONAL ACTION'=>'ЛИЧНЫЕ ЗАДАЧИ','Turn a next step into a task'=>'Добавьте следующий шаг в список задач','View all tasks →'=>'Показать все задачи →',
        'Course (optional)'=>'Курс (необязательно)','No course selected'=>'Курс не выбран','Due date (optional)'=>'Срок (необязательно)','Add task'=>'Добавить задачу',
        'YOUR ACADEMIC IMPROVEMENT'=>'ВАША УЧЕБНАЯ УСПЕВАЕМОСТЬ','Study improvement plans'=>'Планы улучшения успеваемости','Plan title'=>'Название плана',
        'General study plan'=>'Общий учебный план','Review date (optional)'=>'Дата проверки (необязательно)','Reviewed plan'=>'Проверенный план',
        'Save improvement plan'=>'Сохранить план улучшения','Your saved plans'=>'Ваши сохранённые планы','View plan'=>'Открыть план','Review date'=>'Дата проверки',
        'Completed'=>'Завершено','Plan details'=>'Описание плана','Update plan'=>'Обновить план','Delete plan'=>'Удалить план','No improvement plans saved yet.'=>'Планы улучшения пока не сохранены.',
        'PERSONAL DEVELOPMENT'=>'ЛИЧНОЕ РАЗВИТИЕ','Goals and follow-ups'=>'Цели и дальнейшие шаги','Goal area'=>'Область цели','Study and productivity'=>'Учёба и продуктивность',
        'Career development'=>'Развитие карьеры','Personal development'=>'Личное развитие','Next review date (optional)'=>'Дата следующей проверки (необязательно)',
        'Goal title'=>'Название цели','What is one next step or follow-up?'=>'Каков следующий шаг?','Save personal goal'=>'Сохранить личную цель','My goals'=>'Мои цели',
        'View details'=>'Подробнее','In progress'=>'В процессе','Next step or follow-up'=>'Следующий шаг','Next review date'=>'Дата следующей проверки',
        'Update goal'=>'Обновить цель','Delete goal'=>'Удалить цель','No personal goals saved yet.'=>'Личные цели пока не сохранены.',
        'PRIVATE STUDY MATERIALS'=>'ЛИЧНЫЕ УЧЕБНЫЕ МАТЕРИАЛЫ','Upload and ask about a document'=>'Загрузите документ и задайте вопрос',
        'Study document'=>'Учебный документ','Upload private document'=>'Загрузить личный документ','No private documents uploaded.'=>'Личные документы не загружены.',
        'Record an intervention'=>'Записать меры поддержки','Choose a student'=>'Выберите студента','Course section (optional)'=>'Учебная группа (необязательно)',
        'Institutional support'=>'Поддержка учебного заведения','Follow-up action'=>'Последующее действие','Evidence and notes'=>'Подтверждения и заметки','Follow-up date'=>'Дата следующего контакта',
        'Save intervention'=>'Сохранить запись о поддержке','Interventions to monitor'=>'Записи о поддержке для проверки','No interventions have been recorded.'=>'Записи о поддержке отсутствуют.',
        'Closed'=>'Закрыто','Record a student support action'=>'Записать действие по поддержке студента','Enrolled student'=>'Зачисленный студент',
        'Choose an enrolled student'=>'Выберите зачисленного студента','Assigned course section'=>'Назначенная учебная группа','Choose your section'=>'Выберите свою группу',
        'Save support action'=>'Сохранить действие поддержки','My course interventions'=>'Записи о поддержке моих курсов','No support actions are recorded for your courses.'=>'Для ваших курсов действия поддержки не записаны.',
        'Page not found'=>'Страница не найдена',
        'Full name'=>'Полное имя','Temporary password (12+ characters)'=>'Временный пароль (не менее 12 символов)','Department name'=>'Название кафедры',
        'Department code'=>'Код кафедры','Term name'=>'Название учебного периода','Start date'=>'Дата начала','End date'=>'Дата окончания',
        'Course code'=>'Код курса','Course title'=>'Название курса','Section'=>'Группа','Maximum students'=>'Максимальное число студентов',
        'First class date'=>'Дата первого занятия','Repeat weekly until (same date for one-off)'=>'Повторять еженедельно до (для разового занятия укажите ту же дату)',
        'Start time'=>'Время начала','End time'=>'Время окончания','Room / location'=>'Аудитория / место','Class topic'=>'Тема занятия',
        'Course name'=>'Название курса','Assessment name'=>'Название работы','Score (out of 100)'=>'Балл (из 100)',
        'Moderate below (%)'=>'Умеренный риск ниже (%)','High below (%)'=>'Высокий риск ниже (%)','Critical below (%)'=>'Критический риск ниже (%)',
        'Minimum marked records'=>'Минимум отмеченных записей','High risk minimum records'=>'Минимум записей для высокого риска','Critical risk minimum records'=>'Минимум записей для критического риска',
        'Conversation name'=>'Название беседы','Course context'=>'Контекст курса','Private document context'=>'Контекст личного документа','Assistant mode'=>'Режим помощника',
        'Document output'=>'Формат ответа по документу','Category'=>'Категория','Memory'=>'Память','Course (optional)'=>'Курс (необязательно)',
        'Due date (optional)'=>'Срок (необязательно)','Plan title'=>'Название плана','Review date (optional)'=>'Дата проверки (необязательно)',
        'Reviewed plan'=>'Проверенный план','Review date'=>'Дата проверки','Plan details'=>'Описание плана','Goal area'=>'Область цели',
        'Next review date (optional)'=>'Дата следующей проверки (необязательно)','Goal title'=>'Название цели','What is one next step or follow-up?'=>'Каков следующий шаг?',
        'Next step or follow-up'=>'Следующий шаг','Next review date'=>'Дата следующей проверки','Study document'=>'Учебный документ',
        'Course section (optional)'=>'Учебная группа (необязательно)','Follow-up action'=>'Последующее действие','Evidence and notes'=>'Подтверждения и заметки',
        'Follow-up date'=>'Дата следующего контакта','Enrolled student'=>'Зачисленный студент','Assigned course section'=>'Назначенная учебная группа',
        'Attendance marked'=>'Посещаемость отмечена','COMMUNICATION'=>'ОБЩЕНИЕ','LEARNING RESOURCES'=>'УЧЕБНЫЕ МАТЕРИАЛЫ',
        'Language preference'=>'Язык интерфейса','Your language preference is saved to your account.'=>'Язык интерфейса сохранён в вашей учётной записи.',
        'Account basics'=>'Основные сведения об учётной записи','Keep your sign-in private'=>'Защитите данные для входа',
        'Sign out on shared devices and avoid saving your password in a public computer browser.'=>'Выходите из учётной записи на общих устройствах и не сохраняйте пароль в браузере общедоступного компьютера.',
        'Ask about a record'=>'Задайте вопрос об учебной записи','Include the course code and date when reporting a timetable, attendance or grade issue.'=>'Указывайте код курса и дату, если сообщаете о проблеме с расписанием, посещаемостью или оценкой.',
        'Enrolled course sections'=>'Учебные группы, в которые вы зачислены','Tasks complete'=>'Выполненные задачи','Average grade'=>'Средний балл',
        'A weekly study rhythm'=>'План на неделю','At the start of the week, list class times and deadlines.'=>'В начале недели запишите время занятий и сроки сдачи работ.',
        'Schedule focused blocks for reading and assignment work.'=>'Выделите время для чтения и выполнения заданий.',
        'At week’s end, review completed work and carry forward unfinished tasks.'=>'В конце недели проверьте выполненные задания и перенесите незавершённые.',
        'Make progress visible'=>'Отслеживайте прогресс','My Courses →'=>'Мои курсы →','View and manage your course list.'=>'Просматривайте список курсов и управляйте им.',
        'Assignments & Tasks →'=>'Задания и задачи →','Track due dates and completion.'=>'Следите за сроками и выполнением.',
        'Grades & GPA →'=>'Оценки и средний балл →','Review your recorded scores.'=>'Просматривайте внесённые оценки.',
        'My Attendance →'=>'Моя посещаемость →','Review recorded attendance.'=>'Просматривайте записи посещаемости.',
        'LECTURER WORKSPACE · TEACHING'=>'РАБОЧЕЕ ПРОСТРАНСТВО ПРЕПОДАВАТЕЛЯ · ОБУЧЕНИЕ',
        'Your assigned institutional courses, sections and enrolled students.'=>'Назначенные вам курсы, учебные группы и зачисленные студенты.',
        'Scheduled sessions'=>'Запланированные занятия','Assigned course sections'=>'Назначенные учебные группы','Open teaching timetable →'=>'Открыть расписание преподавателя →',
        'STAY ON TOP OF DEADLINES'=>'СЛЕДИТЕ ЗА СРОКАМИ','Capture every piece of work and know what needs attention.'=>'Записывайте задания и определяйте, что требует внимания.',
        'Add an assignment or task'=>'Добавить задание или задачу','Assignment or task'=>'Задание или задача','Due date'=>'Срок сдачи','Priority'=>'Приоритет',
        'Normal'=>'Обычный','Add assignment'=>'Добавить задание','A simple assignment workflow'=>'Как работать над заданием',
        'Read the instructions and underline the deliverable, format and deadline.'=>'Прочитайте инструкции и отметьте результат, формат и срок сдачи.',
        'Collect course readings and write a short outline before drafting.'=>'Соберите материалы курса и составьте краткий план перед написанием.',
        'Leave time to check your argument, citations and submission file.'=>'Оставьте время на проверку аргументации, ссылок и файла перед отправкой.',
        'Your task list'=>'Ваш список задач','No tasks yet. Add your first assignment above.'=>'Задач пока нет. Добавьте первое задание выше.',
        'YOUR STUDY PLAN'=>'ВАШ УЧЕБНЫЙ ПЛАН','Your institutional enrolments and personal course notes.'=>'Ваши зачисления на курсы и личные заметки.',
        'Use each course page well'=>'Используйте страницы курсов','Plan a weekly review'=>'Планируйте еженедельное повторение','Connect reading to class'=>'Связывайте чтение с занятиями',
        'Institutional enrolments'=>'Зачисления на курсы','No institutional course enrolments are recorded for your account.'=>'В вашей учётной записи нет данных о зачислении на курсы.',
        'Personal course notes'=>'Личные заметки по курсам','Add course'=>'Добавить курс','No courses added yet.'=>'Курсы ещё не добавлены.',
        'MEASURE YOUR PROGRESS'=>'ОЦЕНИВАЙТЕ СВОЙ ПРОГРЕСС','Grades & results'=>'Оценки и результаты',
        'Record assessments and follow your academic progress.'=>'Вносите результаты оценивания и отслеживайте успеваемость.',
        'Use feedback to choose your next step'=>'Используйте обратную связь для следующего шага','Keep marks in context'=>'Учитывайте контекст оценок',
        'Record an assessment'=>'Добавить результат оценивания','Save grade'=>'Сохранить оценку','Add a course first.'=>'Сначала добавьте курс.',
        'Assessment record'=>'Запись об оценивании','Average:'=>'Средний балл:','No grades recorded yet.'=>'Оценки пока не внесены.',
        'Assessment'=>'Вид оценивания','Score'=>'Балл','SHARED ACADEMIC SCHEDULE'=>'ОБЩЕЕ УЧЕБНОЕ РАСПИСАНИЕ',
        'Your institutional classes, sessions and attendance.'=>'Занятия, учебные периоды и посещаемость в системе.',
        'Prepare the day before'=>'Подготовьтесь накануне','After class'=>'После занятия','Manage class schedule'=>'Управление расписанием занятий',
        'No institutional class sessions are scheduled for your account yet.'=>'Для вашей учётной записи пока не запланированы занятия.',
        'Save or share timetable'=>'Сохранить расписание или поделиться им','Save as PDF'=>'Сохранить в PDF','Download image'=>'Скачать изображение',
        'Share'=>'Поделиться','Download calendar'=>'Скачать календарь','Class attendance'=>'Посещаемость занятий',
        'Not recorded — choose status'=>'Не отмечено — выберите статус','Lecturer:'=>'Преподаватель:','Attendance:'=>'Посещаемость:',
        'LEARNING INSIGHTS'=>'АНАЛИТИКА ОБУЧЕНИЯ','A view of the grades, attendance and tasks recorded in your StudentLife account.'=>'Оценки, посещаемость и задания, записанные в вашей учётной записи StudentLife.',
        'Recorded average'=>'Средний балл','From scores entered in your account'=>'По оценкам, внесённым в учётную запись',
        'Attendance recorded'=>'Учёт посещаемости','Open tasks'=>'Незакрытые задачи','Results by personal course'=>'Результаты по личным курсам',
        'Open gradebook →'=>'Открыть журнал оценок →','Add personal courses and record returned marks to build this view here.'=>'Добавьте личные курсы и внесите полученные оценки, чтобы увидеть сводку.',
        'ACADEMIC PRACTICE'=>'УЧЕБНАЯ ДОБРОСОВЕСТНОСТЬ','A practical checklist for submitting work that is clearly your own and properly sourced.'=>'Практический список проверки: работа должна быть самостоятельной, а источники — указаны.',
        'Keep source notes'=>'Записывайте сведения об источниках','Paraphrase with care'=>'Перефразируйте внимательно','Show your reasoning'=>'Показывайте ход рассуждений',
        'Before you submit'=>'Перед отправкой','Have I followed the lecturer’s citation and collaboration rules?'=>'Соблюдены ли требования преподавателя к цитированию и совместной работе?',
        'Are direct quotations clearly marked and cited?'=>'Выделены ли прямые цитаты и указаны ли источники?',
        'Can I identify the source for every borrowed idea, statistic or image?'=>'Указан ли источник каждой заимствованной идеи, статистики или изображения?',
        'Have I checked the institution’s policy for AI tools and declared use where required?'=>'Проверены ли правила учебного заведения по использованию ИИ и указано ли его применение, если это требуется?',
        'Your course instructions and institutional policy take priority over this general guide.'=>'Инструкции по курсу и правила учебного заведения имеют приоритет над этими общими рекомендациями.',
        'STUDENT SERVICES'=>'СЕРВИСЫ ДЛЯ СТУДЕНТОВ','Send an application or certificate request to the StudentLife administrator.'=>'Отправьте администратору StudentLife заявление или запрос на справку.',
        'Before requesting a document'=>'Перед запросом документа','For an application'=>'Для заявления','Send a request'=>'Отправить запрос',
        'Request type'=>'Тип запроса','Choose a request'=>'Выберите запрос','Application guidance'=>'Помощь с заявлением',
        'Certificate request'=>'Запрос справки','Transcript request'=>'Запрос выписки с оценками','Other student support'=>'Другая помощь студенту',
        'STUDENT RESOURCE'=>'МАТЕРИАЛ ДЛЯ СТУДЕНТОВ','Create a focused group for a course or join a group already started by a student.'=>'Создайте учебную группу по курсу или присоединитесь к уже существующей.',
        'Start a study group'=>'Создать учебную группу','Group name'=>'Название группы','Study goal'=>'Цель занятий',
        'Create group'=>'Создать группу','No study groups yet. Start one above and invite classmates to join.'=>'Учебных групп пока нет. Создайте группу выше и пригласите однокурсников.',
        'Open study groups'=>'Открытые учебные группы','Joined'=>'Вы состоите в группе','Join group'=>'Присоединиться',
        'YOUR UPDATES'=>'ВАШИ ОБНОВЛЕНИЯ','Recent announcements, due tasks and upcoming classes linked to your account.'=>'Последние объявления, сроки заданий и занятия, связанные с вашей учётной записью.',
        'Tasks coming up'=>'Предстоящие задачи','No open tasks have been added.'=>'Открытых задач пока нет.',
        'No published announcements.'=>'Опубликованных объявлений нет.','No sessions have been published for your enrolled courses.'=>'Для ваших курсов занятия ещё не опубликованы.',
        'STUDY COMPANION'=>'ПОМОЩНИК В УЧЁБЕ','What do you need to understand?'=>'Что вы хотите понять?','Build study plan'=>'Составить план занятий',
        'Use active recall'=>'Используйте активное воспроизведение','Try to explain the topic without notes, then reopen your materials and correct gaps.'=>'Попробуйте объяснить тему без заметок, затем откройте материалы и восполните пробелы.',
        'Finish with a check'=>'Завершите самопроверкой','Write one question you still have and take it to class or your lecturer.'=>'Запишите оставшийся вопрос и задайте его на занятии или преподавателю.',
        'PRACTISE BEFORE AN ASSESSMENT'=>'ПОДГОТОВЬТЕСЬ К ОЦЕНИВАНИЮ','Available demo assessments'=>'Доступные демонстрационные тесты',
        'Across your enrolled courses'=>'По всем курсам, на которые вы зачислены','Question formats'=>'Форматы вопросов',
        'Choice, true/false, multi-select, short answer, matching and written response'=>'Выбор ответа, «верно/неверно», множественный выбор, краткий ответ, сопоставление и развёрнутый ответ',
        'Completed by you'=>'Вы завершили','Saved on this device'=>'Сохранено на этом устройстве','Available'=>'Доступно','My results'=>'Мои результаты',
        'How these question formats work'=>'Как работают форматы вопросов','Single choice'=>'Один вариант ответа','Select one answer from the options.'=>'Выберите один ответ из предложенных.',
        'True or false'=>'Верно или неверно','Choose whether a statement is accurate.'=>'Определите, верно ли утверждение.',
        'Select all that apply'=>'Выберите все подходящие варианты','Short answer'=>'Краткий ответ','Matching'=>'Сопоставление',
        'Match each item with the correct definition.'=>'Сопоставьте каждый пункт с правильным определением.',
        'Written response'=>'Развёрнутый ответ','Your answer'=>'Ваш ответ','Choose a match'=>'Выберите пару','Your response'=>'Ваш ответ',
        'Submit answers'=>'Отправить ответы','Correct'=>'Верно','Review'=>'Проверить','Answer review'=>'Разбор ответов',
        'Close'=>'Закрыть','Start'=>'Начать','Not attempted'=>'Не начато','No completed demo assessments yet.'=>'Вы ещё не проходили демонстрационные тесты.',
        'YOUR NEXT STUDY STEPS'=>'СЛЕДУЮЩИЕ ШАГИ В УЧЁБЕ','Suggestions based on the tasks, scores and attendance recorded in this account.'=>'Рекомендации на основе заданий, оценок и посещаемости в этой учётной записи.',
        'FIRST PRIORITY'=>'В ПЕРВУЮ ОЧЕРЕДЬ','Review overdue tasks'=>'Проверьте просроченные задания','You have'=>'У вас','open task'=>'открытая задача',
        'Plan the next deadline'=>'Спланируйте ближайший срок','COURSE REVIEW'=>'ОБЗОР КУРСОВ','Revisit a course result'=>'Вернитесь к результатам курса',
        'View course results →'=>'Посмотреть результаты по курсам →','Record assessment feedback'=>'Запишите обратную связь по оцениванию',
        'Enter marks and feedback returned by your lecturer so you can spot topics to review.'=>'Внесите оценки и комментарии преподавателя, чтобы определить темы для повторения.',
        'Open grades →'=>'Открыть оценки →','ATTENDANCE'=>'ПОСЕЩАЕМОСТЬ','Check your class records'=>'Проверьте записи о занятиях','Open attendance →'=>'Открыть посещаемость →',
        'INSTITUTIONAL INTELLIGENCE'=>'ИНСТИТУЦИОНАЛЬНАЯ АНАЛИТИКА','Students monitored'=>'Студенты под наблюдением',
        'Compose message'=>'Написать сообщение','Send to'=>'Кому','Choose an active StudentLife account'=>'Выберите активную учётную запись StudentLife',
        'Subject'=>'Тема','Recent messages'=>'Последние сообщения','No messages yet. Use the form to contact a lecturer or administrator.'=>'Сообщений пока нет. Используйте форму, чтобы написать преподавателю или администратору.'
    ];
    $coverage = [
        'Menu'=>'Меню','Close menu'=>'Закрыть меню','Choose language'=>'Выберите язык',
        'Welcome, '=>'Добро пожаловать, ','Your academic activity, classes and progress at a glance.'=>'Краткий обзор вашей учёбы, занятий и успеваемости.',
        'StudentLife is an independent competition prototype, not an official university service. Use fictional demo data only. AI advice is informational and does not replace official academic guidance.'=>'StudentLife — независимый конкурсный прототип, а не официальный сервис университета. Используйте только вымышленные демонстрационные данные. Советы ИИ носят информационный характер и не заменяют официальные рекомендации университета.',
        'Active courses'=>'Активные курсы','term credits'=>'зачётных единиц за семестр','Semester average'=>'Средний балл за семестр',
        'present of'=>'присутствовал из','recorded'=>'учтённых','Upcoming classes'=>'Предстоящие занятия','View courses →'=>'К курсам →',
        'View grades →'=>'К оценкам →','View report →'=>'К отчёту →','Open timetable →'=>'Открыть расписание →',
        'ACADEMIC BRIEFING'=>'УЧЕБНАЯ СВОДКА','What needs your attention'=>'Требует внимания','All assignments →'=>'Все задания →',
        'overdue task'=>'просроченное задание','overdue tasks'=>'просроченных задания','Check the task details and contact your lecturer if you need clarification on next steps.'=>'Проверьте задание и свяжитесь с преподавателем, если нужны разъяснения.',
        'No upcoming dated tasks are recorded. Add official deadlines as your lecturers publish them.'=>'Предстоящие задания со сроками пока не указаны. Добавляйте официальные сроки после их публикации преподавателями.',
        'ACADEMIC PERFORMANCE'=>'УЧЕБНЫЕ РЕЗУЛЬТАТЫ','Course results'=>'Результаты по курсам','Open intelligence →'=>'Открыть аналитику →',
        'Record returned assessments under Grades to see course progress here.'=>'Внесите полученные оценки в раздел «Оценки», чтобы видеть здесь прогресс по курсам.',
        'result'=>'результат','results'=>'результатов','My upcoming classes'=>'Мои предстоящие занятия','View timetable →'=>'Посмотреть расписание →',
        'No upcoming institutional classes are scheduled for your account yet.'=>'Для вашей учётной записи пока не запланированы занятия.',
        'Set this week’s focus'=>'Цель на эту неделю','Check each course for the next topic, write down one question, and choose a study block before the next class.'=>'Посмотрите следующую тему по каждому курсу, запишите один вопрос и выделите время для занятий до следующей пары.',
        'Review courses →'=>'Просмотреть курсы →','Keep deadlines visible'=>'Следите за сроками','Add coursework with its due date, then break larger tasks into reading, outline, draft and final review.'=>'Добавляйте задания со сроками сдачи и делите большие работы на этапы: чтение, план, черновик и итоговая проверка.',
        'Open assignments →'=>'Открыть задания →','Check your records'=>'Проверьте учебные записи','Compare attendance and assessment entries with your notes. Ask the lecturer about a missing or unclear record.'=>'Сверьте посещаемость и результаты оценивания со своими записями. Обратитесь к преподавателю, если запись отсутствует или содержит неточность.',
        'Attendance →'=>'Посещаемость →','CAMPUS UPDATES'=>'НОВОСТИ КАМПУСА','Recent announcements'=>'Последние объявления','All updates →'=>'Все обновления →',
        'NEXT STEPS'=>'СЛЕДУЮЩИЕ ШАГИ','Student tools'=>'Инструменты студента','Open inbox'=>'Открыть входящие','Plan a study session'=>'Запланировать занятие',
        'Find or start a study group'=>'Найти или создать учебную группу','See study recommendations'=>'Посмотреть рекомендации по учёбе',
        'Demo data'=>'Демонстрационные данные','Sample course catalogue for the student dashboard. All instructors and addresses below are fictional.'=>'Пример каталога курсов для панели студента. Все преподаватели и адреса вымышлены.',
        'Foundation'=>'Базовый','Intermediate'=>'Средний','Advanced'=>'Продвинутый','modules'=>'модулей','resources'=>'ресурсов',
        'Fall Semester 2026'=>'Осенний семестр 2026','Autumn 2026'=>'Осень 2026','Spring 2027'=>'Весна 2027',
        'Assignments & tasks'=>'Задания','View tasks →'=>'Все задания →','Course workspace →'=>'К курсам →',
        'No upcoming sessions are scheduled for your assigned sections.'=>'Для назначенных вам учебных групп предстоящие занятия не запланированы.',
        'Assigned sections'=>'Назначенные группы','Enrolled students'=>'Зачисленные студенты','Upcoming sessions'=>'Предстоящие занятия',
        'Sessions needing attendance'=>'Занятия без отметок посещаемости','Upcoming teaching sessions'=>'Предстоящие занятия преподавателя',
        'Class'=>'Занятие','Date'=>'Дата','Time'=>'Время','Students'=>'Студенты','Section'=>'Группа','Room TBA'=>'Аудитория уточняется',
        'STAY ON TOP OF DEADLINES'=>'СЛЕДИТЕ ЗА СРОКАМИ','Capture every piece of work and know what needs attention.'=>'Записывайте все задания и следите за тем, что требует внимания.',
        'Add an assignment or task'=>'Добавить задание','Assignment or task'=>'Задание','Due date'=>'Срок сдачи','Priority'=>'Приоритет',
        'Normal'=>'Обычный','High'=>'Высокий','Add assignment'=>'Добавить задание','A simple assignment workflow'=>'Как работать над заданием',
        'Read the instructions and underline the deliverable, format and deadline.'=>'Прочитайте инструкции и отметьте ожидаемый результат, формат и срок сдачи.',
        'Collect course readings and write a short outline before drafting.'=>'Соберите материалы курса и составьте краткий план перед написанием.',
        'Leave time to check your argument, citations and submission file.'=>'Оставьте время на проверку аргументации, ссылок и файла перед отправкой.',
        'Your task list'=>'Ваш список заданий','No tasks yet. Add your first assignment above.'=>'Заданий пока нет. Добавьте первое задание выше.',
        'Complete'=>'Выполнить','Reopen'=>'Открыть снова','Delete'=>'Удалить','Status'=>'Статус','Action'=>'Действие','Task'=>'Задание','Due'=>'Срок',
        'YOUR STUDY PLAN'=>'ВАШ УЧЕБНЫЙ ПЛАН','Your institutional enrolments and personal course notes.'=>'Ваши зачисления на курсы и личные заметки.',
        'Use each course page well'=>'Эффективно используйте страницы курсов','Plan a weekly review'=>'Планируйте еженедельное повторение',
        'Connect reading to class'=>'Связывайте чтение с занятиями','Institutional enrolments'=>'Зачисления на курсы',
        'No institutional course enrolments are recorded for your account.'=>'В вашей учётной записи нет данных о зачислении на курсы.',
        'Personal course notes'=>'Личные заметки по курсам','Add course'=>'Добавить курс','No courses added yet.'=>'Курсы ещё не добавлены.',
        'MEASURE YOUR PROGRESS'=>'ОЦЕНИВАЙТЕ СВОЙ ПРОГРЕСС','Grades & results'=>'Оценки и результаты',
        'Record assessments and follow your academic progress.'=>'Вносите результаты оценивания и отслеживайте успеваемость.',
        'Use feedback to choose your next step'=>'Используйте обратную связь для следующего шага','Keep marks in context'=>'Учитывайте контекст оценок',
        'Record an assessment'=>'Добавить результат оценивания','Save grade'=>'Сохранить оценку','Add a course first.'=>'Сначала добавьте курс.',
        'Assessment record'=>'Запись об оценивании','Average:'=>'Средний балл:','No grades recorded yet.'=>'Оценки пока не внесены.',
        'Assessment'=>'Вид оценивания','Score'=>'Балл','SHARED ACADEMIC SCHEDULE'=>'ОБЩЕЕ УЧЕБНОЕ РАСПИСАНИЕ',
        'Your institutional classes, sessions and attendance.'=>'Ваши учебные занятия и посещаемость.',
        'Prepare the day before'=>'Подготовьтесь накануне','After class'=>'После занятия','Manage class schedule'=>'Управление расписанием занятий',
        'No institutional class sessions are scheduled for your account yet.'=>'Для вашей учётной записи пока не запланированы занятия.',
        'Save or share timetable'=>'Сохранить расписание или поделиться им','Save as PDF'=>'Сохранить в PDF','Download image'=>'Скачать изображение',
        'Share'=>'Поделиться','Download calendar'=>'Скачать календарь','Class attendance'=>'Посещаемость занятий',
        'Not recorded — choose status'=>'Не отмечено — выберите статус','Lecturer:'=>'Преподаватель:','Attendance:'=>'Посещаемость:',
        'STUDENT SERVICES'=>'СЕРВИСЫ ДЛЯ СТУДЕНТОВ','Send an application or certificate request to the StudentLife administrator.'=>'Отправьте администратору StudentLife заявление или запрос на справку.',
        'Before requesting a document'=>'Перед запросом документа','For an application'=>'Для заявления','Send a request'=>'Отправить запрос',
        'Request type'=>'Тип запроса','Choose a request'=>'Выберите запрос','Application guidance'=>'Помощь с заявлением',
        'Certificate request'=>'Запрос справки','Transcript request'=>'Запрос выписки с оценками','Other student support'=>'Другая помощь студенту',
        'STUDY MATERIALS'=>'УЧЕБНЫЕ МАТЕРИАЛЫ','Shared learning resources available to students.'=>'Общие учебные материалы, доступные студентам.',
        'No library resources have been added yet. Check Documents & Resources or ask your lecturer for course readings.'=>'Учебные материалы пока не добавлены. Проверьте раздел «Документы и ресурсы» или попросите преподавателя предоставить материалы курса.',
        'LEARN TOGETHER'=>'УЧИТЕСЬ ВМЕСТЕ','Create a focused group for a course or join a group already started by a student.'=>'Создайте учебную группу по курсу или присоединитесь к уже существующей.',
        'Start a study group'=>'Создать учебную группу','Group name'=>'Название группы','Study goal'=>'Цель занятий',
        'Create group'=>'Создать группу','No study groups yet. Start one above and invite classmates to join.'=>'Учебных групп пока нет. Создайте группу выше и пригласите однокурсников.',
        'Open study groups'=>'Открытые учебные группы','Joined'=>'Вы состоите в группе','Join group'=>'Присоединиться',
        'YOUR UPDATES'=>'ВАШИ ОБНОВЛЕНИЯ','Recent announcements, due tasks and upcoming classes linked to your account.'=>'Последние объявления, сроки заданий и занятия, связанные с вашей учётной записью.',
        'Tasks coming up'=>'Предстоящие задания','No open tasks have been added.'=>'Открытых заданий пока нет.',
        'No published announcements.'=>'Опубликованных объявлений нет.','No sessions have been published for your enrolled courses.'=>'Для ваших курсов занятия ещё не опубликованы.',
        'STUDY COMPANION'=>'ПОМОЩНИК В УЧЁБЕ','What do you need to understand?'=>'Что вы хотите понять?','Build study plan'=>'Составить план занятий',
        'Use active recall'=>'Используйте активное воспроизведение','Finish with a check'=>'Завершите самопроверкой',
        'PRACTISE BEFORE AN ASSESSMENT'=>'ПОДГОТОВЬТЕСЬ К ОЦЕНИВАНИЮ','Available demo assessments'=>'Доступные демонстрационные тесты',
        'Across your enrolled courses'=>'По всем курсам, на которые вы зачислены','Question formats'=>'Форматы вопросов',
        'Completed by you'=>'Вы завершили','Saved on this device'=>'Сохранено на этом устройстве','Available'=>'Доступно','My results'=>'Мои результаты',
        'How these question formats work'=>'Как работают форматы вопросов','Single choice'=>'Один вариант ответа','True or false'=>'Верно или неверно',
        'Select all that apply'=>'Выберите все подходящие варианты','Short answer'=>'Краткий ответ','Matching'=>'Сопоставление','Written response'=>'Развёрнутый ответ',
        'Your answer'=>'Ваш ответ','Choose a match'=>'Выберите пару','Your response'=>'Ваш ответ','Submit answers'=>'Отправить ответы',
        'Correct'=>'Верно','Review'=>'Проверить','Answer review'=>'Разбор ответов','Close'=>'Закрыть','Start'=>'Начать','Not attempted'=>'Не начато',
        'No completed demo assessments yet.'=>'Вы ещё не проходили демонстрационные тесты.',
        'YOUR NEXT STUDY STEPS'=>'СЛЕДУЮЩИЕ ШАГИ В УЧЁБЕ','Suggestions based on the tasks, scores and attendance recorded in this account.'=>'Рекомендации на основе заданий, оценок и посещаемости в этой учётной записи.',
        'FIRST PRIORITY'=>'В ПЕРВУЮ ОЧЕРЕДЬ','Review overdue tasks'=>'Проверьте просроченные задания','Plan the next deadline'=>'Спланируйте ближайший срок',
        'COURSE REVIEW'=>'ОБЗОР КУРСОВ','Revisit a course result'=>'Вернитесь к результатам курса','View course results →'=>'Посмотреть результаты по курсам →',
        'Record assessment feedback'=>'Запишите обратную связь по оцениванию','Open grades →'=>'Открыть оценки →',
        'INSTITUTIONAL INTELLIGENCE'=>'ИНСТИТУЦИОНАЛЬНАЯ АНАЛИТИКА','Students monitored'=>'Студенты под наблюдением',
        'Compose message'=>'Написать сообщение','Send to'=>'Кому','Choose an active StudentLife account'=>'Выберите активную учётную запись StudentLife',
        'Subject'=>'Тема','Recent messages'=>'Последние сообщения','No messages yet. Use the form to contact a lecturer or administrator.'=>'Сообщений пока нет. Используйте форму, чтобы написать преподавателю или администратору.',
        'My Profile'=>'Мой профиль','Profile updated.'=>'Профиль обновлён.','Save profile'=>'Сохранить профиль','Display name'=>'Отображаемое имя',
        'Change password'=>'Изменить пароль','Current password'=>'Текущий пароль','New password'=>'Новый пароль','Confirm new password'=>'Подтвердите новый пароль',
        'Update password'=>'Обновить пароль','Account basics'=>'Основные сведения об учётной записи','Keep your sign-in private'=>'Защитите данные для входа',
        'System Settings'=>'Системные настройки','Institution details'=>'Сведения об учебном заведении','Institution name'=>'Название учебного заведения',
        'Academic year'=>'Учебный год','Support email'=>'Электронная почта службы поддержки','Save settings'=>'Сохранить настройки',
        'Save changes'=>'Сохранить изменения','Save memory settings'=>'Сохранить настройки памяти','Save memory'=>'Сохранить воспоминание',
        'Memory and Personalization'=>'Память и персонализация','Saved memories'=>'Сохранённые воспоминания','Clear memory'=>'Очистить память',
        'Delete memory'=>'Удалить воспоминание','Personal context'=>'Личный контекст','Learning preferences'=>'Предпочтения в обучении',
        'Academic goals or challenges'=>'Учебные цели и трудности','Study and productivity'=>'Учёба и продуктивность',
        'Career development'=>'Развитие карьеры','Personal development'=>'Личное развитие','Goals and follow-ups'=>'Цели и дальнейшие шаги',
        'Save personal goal'=>'Сохранить личную цель','Save improvement plan'=>'Сохранить план развития','Update plan'=>'Обновить план',
        'Update goal'=>'Обновить цель','Delete plan'=>'Удалить план','Delete goal'=>'Удалить цель','View plan'=>'Посмотреть план',
        'View details'=>'Посмотреть подробности','Upload private document'=>'Загрузить личный документ','Delete this document from your private storage?'=>'Удалить этот документ из личного хранилища?',
        'Private document uploaded. Select it as the conversation context before asking questions.'=>'Личный документ загружен. Выберите его как контекст беседы перед тем, как задавать вопросы.',
        'No private documents uploaded.'=>'Личные документы не загружены.','PRIVATE STUDY MATERIALS'=>'ЛИЧНЫЕ УЧЕБНЫЕ МАТЕРИАЛЫ',
        'Turn a next step into a task'=>'Превратите следующий шаг в задание','Add task'=>'Добавить задание',
        'Study improvement plans'=>'Планы улучшения успеваемости','Your saved plans'=>'Ваши сохранённые планы','No improvement plans saved yet.'=>'Планы улучшения пока не сохранены.',
        'PERSONAL DEVELOPMENT'=>'ЛИЧНОЕ РАЗВИТИЕ','My goals'=>'Мои цели','No personal goals saved yet.'=>'Личные цели пока не сохранены.',
        'Record an intervention'=>'Зафиксировать меру поддержки','Interventions to monitor'=>'Меры поддержки на контроле',
        'Record a student support action'=>'Зафиксировать действие по поддержке студента','My course interventions'=>'Меры поддержки по моим курсам',
        'Choose a student'=>'Выберите студента','Choose an enrolled student'=>'Выберите зачисленного студента','Course section (optional)'=>'Учебная группа (необязательно)',
        'Institutional support'=>'Поддержка учебного заведения','Follow-up action'=>'Дальнейшее действие','Evidence and notes'=>'Подтверждения и заметки',
        'Follow-up date'=>'Дата следующего контакта','Save intervention'=>'Сохранить меру поддержки','Save support action'=>'Сохранить действие по поддержке',
        'No interventions have been recorded.'=>'Меры поддержки пока не зафиксированы.','Open'=>'Открыто','In progress'=>'В процессе','Closed'=>'Закрыто',
        'Update'=>'Обновить','Choose your section'=>'Выберите свою учебную группу','Enrolled student'=>'Зачисленный студент','Assigned course section'=>'Назначенная учебная группа',
        'Attendance marked'=>'Посещаемость отмечена','LEARNING RESOURCES'=>'УЧЕБНЫЕ МАТЕРИАЛЫ','COMMUNICATION'=>'ОБЩЕНИЕ',
        '[DEMO]'=>'[ДЕМО]','DEMO'=>'ДЕМО','Foundation'=>'Базовый уровень','Intermediate'=>'Средний уровень','Advanced'=>'Продвинутый уровень',
        'High priority'=>'Высокий приоритет','Normal priority'=>'Обычный приоритет','Low priority'=>'Низкий приоритет',
        'Due Nov 23, 2026'=>'Срок сдачи: 23 ноября 2026 г.','Due Nov 24, 2026'=>'Срок сдачи: 24 ноября 2026 г.',
        'No file chosen'=>'Файл не выбран','File upload'=>'Загрузка файла','Upload file'=>'Загрузить файл',
        // Demo course titles, instructors, descriptions, assignments and announcements.
        'Welcome, Stanley 👋'=>'Добро пожаловать, Стэнли 👋','Stanley'=>'Стэнли','Patience'=>'Пейшенс',
        'Welcome,'=>'Добро пожаловать,',
        '10 term credits'=>'10 зачётных единиц за семестр','1 present of 1 recorded'=>'Присутствовал на 1 из 1 занятия',
        '1 overdue task'=>'1 просроченное задание','3 open · 1 overdue'=>'3 открытых · 1 просроченное',
        'Economics · Demo Notes · 2 results'=>'Экономика · Демонстрационные оценки · 2 результата',
        'International Relations · Demo Notes · 2 results'=>'Международные отношения · Демонстрационные оценки · 2 результата',
        'IR101 · Introduction to International Relations'=>'IR101 · Введение в международные отношения',
        'Room 204'=>'Аудитория 204','Check each course for the next topic, write down one question, and choose a study block before the next class.'=>'Посмотрите следующую тему по каждому курсу, запишите один вопрос и выделите время для занятий до следующей пары.',
        'Add coursework with its due date, then break larger tasks into reading, outline, draft and final review.'=>'Добавляйте задания со сроками сдачи и делите большие работы на этапы: чтение, план, черновик и итоговая проверка.',
        'Compare attendance and assessment entries with your notes. Ask the lecturer about a missing or unclear record.'=>'Сверьте посещаемость и результаты оценивания со своими записями. Обратитесь к преподавателю, если запись отсутствует или содержит неточность.',
        'Testing the App'=>'Тестирование приложения','This is a test message'=>'Это тестовое сообщение',
        'Autumn study plan'=>'План занятий на осень','Sample notice for students: review your enrolled course timetable and keep assignment due dates up to date.'=>'Объявление для студентов: проверьте расписание курсов, на которые вы зачислены, и обновите сроки сдачи заданий.',
        'Welcome to StudentLife'=>'Добро пожаловать в StudentLife','This is a sample campus notice. Administrators can publish current dates, campus updates and student support information here.'=>'Это пример объявления кампуса. Администраторы могут публиковать здесь актуальные даты, новости кампуса и информацию о поддержке студентов.',
        'Academic English for International Studies'=>'Академический английский для международных исследований',
        'Multilateral Diplomacy and Conference Craft'=>'Многосторонняя дипломатия и искусство ведения конференций',
        'Diplomatic Practice and Negotiation'=>'Дипломатическая практика и переговоры',
        'Empires, Trade and the Making of the Global Economy'=>'Империи, торговля и формирование мировой экономики',
        'The World in the Twentieth Century'=>'Мир в XX веке',
        'Arms Control and Non-Proliferation'=>'Контроль над вооружениями и нераспространение',
        'International Security Studies'=>'Исследования международной безопасности',
        'Russian for Professional Diplomacy'=>'Русский язык для профессиональной дипломатии',
        'Eurasia and the Post-Soviet Space'=>'Евразия и постсоветское пространство',
        'Theories of International Relations'=>'Теории международных отношений',
        'Dr. Sofia Karimova'=>'Д-р София Каримова','Dr. Elena Petrova'=>'Д-р Елена Петрова',
        'Dr. Andrei Volkov'=>'Д-р Андрей Волков','Dr. Ivan Petrov'=>'Д-р Иван Петров',
        'Dr. Marina Kravtsova'=>'Д-р Марина Кравцова','Dr. Alexei Orlov'=>'Д-р Алексей Орлов',
        'Prof. Dmitry Lebedev'=>'Проф. Дмитрий Лебедев','Dr. Vera Smirnova'=>'Д-р Вера Смирнова',
        'Prof. Olga Timofeeva'=>'Проф. Ольга Тимофеева',
        'Academic reading, writing and speaking for students of international affairs, from argument structure and citation to seminar presentation in an academic register.'=>'Академическое чтение, письмо и устная речь для студентов-международников: структура аргументации, цитирование и выступления на семинарах в академическом стиле.',
        'How multilateral conferences produce texts: agenda setting, drafting groups, coalitions, chairing and the management of diplomacy inside institutional settings.'=>'Как на многосторонних конференциях создаются итоговые документы: формирование повестки, работа редакционных групп, коалиции, председательство и дипломатия в рамках международных организаций.',
        'The craft of diplomacy: how missions work, how negotiators build and close agreements, and how protocol and communication shape outcomes.'=>'Искусство дипломатии: работа дипломатических миссий, подготовка и заключение соглашений, а также влияние протокола и коммуникации на результаты переговоров.',
        'The economic history of empire from 1500 to 1900, tracing how coercion, finance and industrial production produced an interconnected but deeply unequal world economy.'=>'Экономическая история империй с 1500 по 1900 год: как принуждение, финансы и промышленное производство создали взаимосвязанную, но глубоко неравную мировую экономику.',
        'A global history of the twentieth century from the collapse of old empires to the end of the Cold War, with attention to war, ideology and decolonisation.'=>'Глобальная история XX века — от распада старых империй до окончания холодной войны, с особым вниманием к войнам, идеологиям и деколонизации.',
        'The nuclear non-proliferation regime and its instruments: IAEA safeguards, test bans, chemical and biological conventions, verification and treaty negotiation.'=>'Режим ядерного нераспространения и его инструменты: гарантии МАГАТЭ, запреты на испытания, конвенции о химическом и биологическом оружии, механизмы проверки и переговоры по договорам.',
        'Core concepts of security from deterrence and alliances to terrorism, cyber and energy security, with a focus on how threats are constructed and securitised.'=>'Основные понятия безопасности: от сдерживания и союзов до терроризма, кибербезопасности и энергетической безопасности; особое внимание уделяется формированию и секьюритизации угроз.',
        'Applied Russian for diplomatic work: formal register, correspondence, meeting note-taking, treaty vocabulary and interpreting practice at intermediate level.'=>'Практический русский язык для дипломатической работы: официальный стиль, переписка, ведение записей на встречах, договорная терминология и практика устного перевода на среднем уровне.',
        'An advanced regional studies course on politics, security and political economy across the post-Soviet space, contested borders and energy geopolitics.'=>'Углублённый курс регионоведения о политике, безопасности и политической экономике постсоветского пространства, спорных границах и геополитике энергетики.',
        'A systematic introduction to the competing theoretical traditions that structure the study of world politics, from realism and liberalism to constructivism and critical approaches.'=>'Систематическое введение в основные теоретические направления изучения мировой политики: от реализма и либерализма до конструктивизма и критических подходов.',
        '[DEMO] Review IR101 lecture notes'=>'[ДЕМО] Повторить конспект лекции IR101',
        '[DEMO] Prepare economics problem set'=>'[ДЕМО] Подготовить набор задач по экономике',
        '[DEMO] Draft international law response'=>'[ДЕМО] Подготовить черновик ответа по международному праву',
        'Policy brief: Managing regional water security'=>'Аналитическая записка: управление региональной водной безопасностью',
        'Data exercise: Inflation and food prices'=>'Практическая работа с данными: инфляция и цены на продукты',
        'Introduction to International Relations'=>'Введение в международные отношения','Principles of Economics'=>'Основы экономики',
        'Due Nov 23, 2026'=>'Срок сдачи: 23 ноября 2026 г.','Due Nov 24, 2026'=>'Срок сдачи: 24 ноября 2026 г.',
        'No file chosen'=>'Файл не выбран','Choose File'=>'Выбрать файл','Upload submission'=>'Загрузить работу',
        'Download each sample brief as a PDF. Upload your response as a PDF or image (JPG, PNG, WEBP or GIF), up to 8 MB. Your files are private to your account.'=>'Скачайте каждое демонстрационное задание в формате PDF. Загрузите ответ в формате PDF или изображения (JPG, PNG, WEBP или GIF) размером до 8 МБ. Ваши файлы доступны только в вашей учётной записи.',
        'Write a concise policy brief that defines a regional water-security problem, compares two policy options, and recommends one course of action. Support the recommendation with at least three credible sources. Include a short executive summary and a references section.'=>'Подготовьте краткую аналитическую записку, в которой определите проблему региональной водной безопасности, сравните два варианта политики и предложите один вариант действий. Обоснуйте рекомендацию как минимум тремя надёжными источниками. Включите краткое резюме и список литературы.',
        'Use a public economic dataset to describe recent food-price inflation in one country. Include a small table or chart, explain two possible causes, and distinguish observed data from your interpretation. Cite the dataset and any additional sources.'=>'Используйте открытый экономический набор данных, чтобы описать недавнюю инфляцию цен на продукты в одной стране. Добавьте небольшую таблицу или диаграмму, объясните две возможные причины и отделите наблюдаемые данные от собственной интерпретации. Укажите источник набора данных и другие использованные материалы.',
        '4 cr'=>'4 зачётные единицы','6 cr'=>'6 зачётных единиц',
    ];
    $extraMore = array_merge($extraMore ?? [], $coverage);
    /* STUDENTLIFE_RUSSIAN_DEMO_NAMES_V2 */
    /* STUDENTLIFE_RUSSIAN_COVERAGE_V1 */
    $extra=array_merge($extra,$extraMore);
    $map=array_merge($map,$extra);return $map;
}

function sl_i18n_text(string $text, array $map): string
{
    if(isset($map[$text]))return $map[$text];
    // Translate known interface phrases inside mixed labels such as course codes + level,
    // dates + status, and demo titles + metadata. User-authored content remains excluded
    // by the HTML translator's protected content containers.
    static $phrasePattern=null;
    if($phrasePattern===null){
        $keys=array_keys($map);
        usort($keys,static fn($a,$b)=>strlen($b)<=>strlen($a));
        $phrasePattern='/(?<![\\p{L}\\p{N}])(?:'.implode('|',array_map(static fn($key)=>preg_quote($key,'/'),$keys)).')(?![\\p{L}\\p{N}])/u';
    }
    $replaced=preg_replace_callback($phrasePattern,static fn($m)=>$map[$m[0]]??$m[0],$text);
    if(is_string($replaced))$text=$replaced;
    if(preg_match('/^\\d{4}-\\d{2}-\\d{2}$/',$text))return sl_format_date($text,'ru');
    $units=[
        'student'=>['студент','студента','студентов'],'lecturer'=>['преподаватель','преподавателя','преподавателей'],
        'admin'=>['администратор','администратора','администраторов'],'course'=>['курс','курса','курсов'],
        'credit'=>['зачётная единица','зачётные единицы','зачётных единиц'],'module'=>['модуль','модуля','модулей'],
        'resource'=>['ресурс','ресурса','ресурсов'],'question'=>['вопрос','вопроса','вопросов'],
        'minute'=>['минута','минуты','минут'],'unread'=>['непрочитанное сообщение','непрочитанных сообщения','непрочитанных сообщений'],
        'active enrolment'=>['активное зачисление','активных зачисления','активных зачислений']
    ];
    foreach($units as $english=>$forms){
        $text=preg_replace_callback('/\\b(\\d+) '.preg_quote($english,'/').'s?\\b/i',function($m)use($forms){$n=(int)$m[1];return $m[1].' '.sl_plural_ru($n,$forms[0],$forms[1],$forms[2]);},$text)??$text;
    }
    if(preg_match('/^Demo result: (\\d+) \/ (\\d+) auto-scored questions \\((\\d+)%\\)\\.$/',$text,$m))return 'Результат демонстрационного теста: '.$m[1].' из '.$m[2].' вопросов оценено автоматически ('.$m[3].'%).';
    $prefixes=[
        'Search results for “'=>'Результаты поиска: «',
        'Review your answer against: '=>'Сверьте ответ с критериями: ',
        'Your lowest recorded course average is'=>'Самый низкий средний балл по вашим курсам:',
        'Demo result: '=>'Результат демонстрационного теста: ',
    ];
    foreach($prefixes as $from=>$to){if(str_starts_with($text,$from)){$text=$to.substr($text,strlen($from));break;}}
    if(str_starts_with($text,'Результаты поиска: «')&&str_ends_with($text,'”'))$text=substr($text,0,-strlen('”')).'»';
    return $text;
}

function sl_i18n_translate_html(string $html): string
{
    if(($GLOBALS['sl_language']??'en')!=='ru')return $html;
    $map=sl_i18n_phrase_map();$parts=preg_split('/(<[^>]*>)/s',$html,-1,PREG_SPLIT_DELIM_CAPTURE);if(!is_array($parts))return $html;
    $stack=[];$void=['area'=>1,'base'=>1,'br'=>1,'col'=>1,'embed'=>1,'hr'=>1,'img'=>1,'input'=>1,'link'=>1,'meta'=>1,'param'=>1,'source'=>1,'track'=>1,'wbr'=>1];
    foreach($parts as &$part){
        if($part==='')continue;
        if($part[0]==='<'){
            if(preg_match('/^<\\s*\\/([a-zA-Z0-9]+)/',$part,$closing)){
                for($i=count($stack)-1;$i>=0;$i--){
                    if($stack[$i]['name']===strtolower($closing[1])){$stack=array_slice($stack,0,$i);break;}
                }
                continue;
            }
            if(!preg_match('/^<([a-zA-Z0-9]+)/',$part,$tag))continue;
            $name=strtolower($tag[1]);$blocked=in_array($name,['script','style','textarea','pre','code'],true);
            $classes='';if(preg_match('/\\bclass=["\\\']([^"\\\']*)["\\\']/',$part,$cm))$classes=$cm[1];
            $blocked=$blocked||preg_match('/(?:^|\\s)(?:sc-message-body|ai-message-content|ai-bubble|message-item|resource-description|resource-content|user-content|student-name)(?:\\s|$)/',$classes)===1;
            $isVoid=isset($void[$name])||preg_match('/\\/\\s*>$/',$part)===1;
            if(!$isVoid)$stack[]=['name'=>$name,'blocked'=>$blocked];
            if(!$blocked){
                // Translate visible and accessible interface attributes as well as text nodes.
                $part=preg_replace_callback('/\\b(placeholder|aria-label|aria-description|title|alt)=["\\\']([^"\\\']*)["\\\']/i',function($m)use($map){$v=html_entity_decode($m[2],ENT_QUOTES|ENT_HTML5,'UTF-8');$translated=$map[$v]??$v;return $m[1].'="'.htmlspecialchars($translated,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8').'"';},$part)??$part;
                // Button-like input values are interface labels; ordinary input values may be user data.
                $isButtonValue=$name==='button'||($name==='input'&&preg_match('/\\btype=["\\\'](?:submit|button|reset)["\\\']/i',$part)===1);
                if($isButtonValue){
                    $part=preg_replace_callback('/\\bvalue=["\\\']([^"\\\']*)["\\\']/i',function($m)use($map){$v=html_entity_decode($m[1],ENT_QUOTES|ENT_HTML5,'UTF-8');$translated=$map[$v]??$v;return 'value="'.htmlspecialchars($translated,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8').'"';},$part)??$part;
                }
            }
        }else{
            $blocked=false;foreach($stack as $entry)if($entry['blocked']){$blocked=true;break;}
            if($blocked)continue;
            $decoded=html_entity_decode(trim($part),ENT_QUOTES|ENT_HTML5,'UTF-8');$translated=sl_i18n_text($decoded,$map);
            if($translated!==$decoded)$part=preg_replace_callback('/^(\\s*)(.*?)(\\s*)$/s',function($m)use($translated){return $m[1].htmlspecialchars($translated,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8').$m[3];},$part)??$part;
        }
    }unset($part);
    return implode('',$parts);
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


/** Translate static interface copy at render time after page templates are composed. */
if (!headers_sent() && ob_get_level() === 0) {
    ob_start('sl_i18n_translate_html');
}
