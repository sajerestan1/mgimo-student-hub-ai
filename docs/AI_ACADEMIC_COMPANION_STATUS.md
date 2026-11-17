# StudentLife AI Academic Companion audit and implementation

Audit date: 2026-11-17  
Application reviewed: standalone PHP/MySQL app in `public/`  
Feature branch: `codex/ai-academic-companion`

## Existing behavior found

- `public/index.php?page=ai_study` is the student Study Companion. Lecturer and administrator AI workspaces use the same provider service and separate role-scoped context.
- `public/academic-intelligence.php` reads OpenAI-compatible endpoint, key, and model from hosting environment settings or a protected PHP file above the preview document root. It sends HTTPS chat-completion requests from the server.
- The preview provider was exercised by the user and returned model-generated answers. Configuration status by itself only means the three values are present; it is not a live health check.
- Conversations and messages are stored in `ai_conversations` and `ai_messages`. The app checks authenticated user ownership and workspace role before reading or continuing a conversation.
- Student AI context includes enrolled shared courses, that student's personal tasks and grades, their recorded attendance and upcoming timetable, plus published announcements and shared resources. Personal grade entries are labeled as unofficial.
- Lecturer context is restricted to assigned offerings and related attendance. Administrator risk data uses rule-based attendance records and includes limitations.
- The existing PHP app also has tasks, courses, grades, timetable, local quiz scaffolds, shared resource links, internal application/request messages, announcements, and notifications. These are separate PHP/MySQL routes and are not the React/Base44 source in `src/`.
- Authentication uses server sessions; POST actions use CSRF validation; database writes use prepared statements; displayed text is escaped. Existing course, task, and grade data is not migrated or reclassified.

## Implemented on this feature branch

- One assistant now has selectable modes for general help, tutoring, exam practice, study planning, performance review, research and writing, English/Russian assistance, shared resources, and the university request guide.
- Student quick actions populate the same assistant composer. Suggested questions are shown only when corresponding task, timetable, grade, or announcement records exist.
- Mode instructions tell the assistant to use the supplied records, state missing information, avoid invented dates and citations, and label practice work as unofficial.
- The planner mode uses recorded class sessions and tasks. It must ask for the student's availability before allocating time blocks.
- Students can add a personal task from the AI page only after reviewing it and checking an explicit confirmation. This writes to the existing `tasks` table and verifies any selected course against the student's enrolments.
- Conversations remember their selected support mode. Owners can rename or delete their own conversations; backend handlers check owner and role.
- AI questions are limited to eight requests per minute per authenticated account. Provider failures offer a retry for the last question.
- AI messages render safe Markdown for paragraphs, headings, lists, code and tables; response text is HTML-escaped before formatting. A copy button is available for assistant replies.
- The AI page links to existing tasks, timetable, quizzes, grades, shared resources, and application request pages.
- An additive migration adds `support_mode` to `ai_conversations`; no existing conversations are deleted.
- The shared footer states that StudentLife is an independent competition prototype and not an official university service.

## Known boundaries

- There is no private student document upload or PDF/DOCX/PPTX text extraction in the PHP app. The resource page stores shared links and descriptions only. The AI is explicitly told not to claim it read an unavailable file.
- The Applications & Certificates page sends an internal request to an administrator. It does not maintain application status, issue certificates, or expose policy documents to the AI. The assistant can guide users to that page but must not claim to submit, approve, or check a request.
- Exam dates and institution grading rules are not present in the AI context. The assistant must not invent them or calculate an official GPA.
- Existing quiz scaffolds generate local reflection prompts. AI-generated mock exams and saved practice results are not implemented. Practice marks must not be written as official grades.
- AI mode selection does not create new role permissions. Student, lecturer, and administrator data retrieval remains governed by the existing backend scope.
- No production deployment is included. Feature branch changes are not automatically uploaded to the preview or production host.

## Automated verification

The existing MariaDB integration suite is extended to cover AI mode persistence, conversation rename/delete ownership, confirmed task creation, rejection of a task for an un-enrolled course, and separation between the two CI student accounts.

Status: pending GitHub Actions run for this feature branch. Do not treat these checks as passed until the workflow reports success. The tests use the disposable CI database and fictional `studentlife.test` accounts.

## Deployment and remaining work

- Branch isolation: `codex/ai-academic-companion`, based on the preview branch.
- Preview status: not deployed from this feature branch.
- Production status: untouched.
- After CI passes, the feature can be reviewed and merged to `codex/studentlife-preview` for the existing isolated preview workflow. Live preview login, provider behavior, and a 360px mobile review still need to be checked after deployment.
- Document analysis, saved mock-exam results, complete language localization, and application status integration remain future work because the PHP database and routes do not currently support them.
