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
            'communication.page_title'=>'Центр общения','communication.kicker'=>'ОБЩЕНИЕ СТУДЕНТОВ','communication.subtitle'=>'Общайтесь в чатах курсов и учебных групп, а также отправляйте личные сообщения студентам.',
            'communication.new_chat'=>'Новый чат со студентом…','communication.open'=>'Открыть','communication.groups_link'=>'Создать учебную группу или присоединиться','communication.search'=>'Поиск','communication.search_placeholder'=>'Поиск в чате',
            'communication.conversations'=>'Ваши чаты','communication.no_chats'=>'Чаты курсов появятся здесь после зачисления в активную учебную группу.',
            'communication.choose_chat'=>'Выберите чат','communication.choose_chat_help'=>'Откройте чат курса, начните личную переписку или присоединитесь к учебной группе.',
            'communication.back'=>'← К чатам','communication.chat'=>'чат','communication.mute'=>'Отключить звук','communication.unmute'=>'Включить звук','communication.search_results'=>'Результаты поиска «{query}» · найдено: {count}',
            'communication.earlier'=>'Загрузить предыдущие сообщения','communication.no_matches'=>'Сообщений по вашему запросу нет.','communication.start'=>'Сообщений пока нет. Начните общение.',
            'communication.removed'=>'Сообщение удалено','communication.edit'=>'Сохранить','communication.remove'=>'Удалить сообщение','communication.report'=>'Пожаловаться',
            'communication.type_message'=>'Введите сообщение…','communication.attach'=>'Прикрепить файл','communication.attach_help'=>'Можно прикрепить PDF, TXT, DOCX, PPTX, PNG, JPG или WebP (до 10 МБ).',
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
        'Upcoming classes'=>'Предстоящие занятия','prepare("SELECT COUNT(*) FROM tasks WHERE user_id=? AND status'=>'',
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
        'Very Weak'=>'Очень слабый','Weak'=>'Слабый','Normal'=>'Средний','Strong'=>'Надёжный','Very Strong'=>'Очень надёжный'
    ];
    $map=array_merge($map,$extra);return $map;
}

function sl_i18n_translate_html(string $html): string
{
    if(($GLOBALS['sl_language']??'en')!=='ru')return $html;
    $map=sl_i18n_phrase_map();$parts=preg_split('/(<[^>]*>)/s',$html,-1,PREG_SPLIT_DELIM_CAPTURE);if(!is_array($parts))return $html;
    $stack=[];$void=['area'=>1,'base'=>1,'br'=>1,'col'=>1,'embed'=>1,'hr'=>1,'img'=>1,'input'=>1,'link'=>1,'meta'=>1,'param'=>1,'source'=>1,'track'=>1,'wbr'=>1];
    foreach($parts as &$part){
        if($part==='')continue;
        if($part[0]==='<'){
            if(preg_match('/^<\\s*\\//',$part)){if($stack)array_pop($stack);continue;}
            if(!preg_match('/^<([a-zA-Z0-9]+)/',$part,$tag))continue;
            $name=strtolower($tag[1]);$blocked=in_array($name,['script','style','textarea'],true);
            $classes='';if(preg_match('/\\bclass=["\\\']([^"\\\']*)["\\\']/',$part,$cm))$classes=$cm[1];
            $blocked=$blocked||preg_match('/(?:^|\\s)(?:sc-message-body|ai-message-content|ai-bubble|message-item|notice-card|course-description|resource-description)(?:\\s|$)/',$classes)===1;
            if(!$blocked&&!in_array($name,['input','img','br','hr','meta','link'],true)){
                $stack[]=['blocked'=>false];
            }elseif(!in_array($name,['input','img','br','hr','meta','link'],true))$stack[]=['blocked'=>true];
            if(!$blocked){
                $part=preg_replace_callback('/\\b(placeholder|aria-label|title)=["\\\']([^"\\\']*)["\\\']/i',function($m)use($map){$v=html_entity_decode($m[2],ENT_QUOTES|ENT_HTML5,'UTF-8');return $m[1].'="'.$map[$v]??$m[2].'"';},$part)??$part;
            }
        }else{
            $blocked=false;foreach($stack as $entry)if($entry['blocked']){$blocked=true;break;}
            if($blocked)continue;
            $decoded=html_entity_decode(trim($part),ENT_QUOTES|ENT_HTML5,'UTF-8');
            if(isset($map[$decoded]))$part=preg_replace('/^\\s*.*?\\s*$/s',function()use($part,$decoded,$map){preg_match('/^\\s*/',$part,$lead);preg_match('/\\s*$/',$part,$trail);return ($lead[0]??'').htmlspecialchars($map[$decoded],ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8').($trail[0]??'');},$part)??$part;
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
