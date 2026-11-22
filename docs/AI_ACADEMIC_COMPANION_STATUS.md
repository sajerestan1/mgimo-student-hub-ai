# StudentLife AI Academic Companion audit and implementation

Audit date: 2026-11-22
Application reviewed: standalone PHP/MySQL app in `public/`
Working copy: local Preview workspace; these changes are not pushed

## Current AI Learning Centre status (2026-11-22)

Phases 1–6 have been implemented in the local Preview working tree. The Preview website has not been updated with these local changes. The deployment workflow must package `public/ai-learning-features.php` with the PHP entry point; this dependency is now included in its syntax checks and staging/Preview payloads.

Students have an AI Learning Centre with nine labeled tools. The AI Study Planner and AI Study Roadmap use owner-scoped roadmap/task tables and available academic context. AI Exam Preparation stores generated practice sets and attempts separately from official grades, supports timed mock exams and revision mode, and checks answers in practice mode. AI Chat uses the existing conversation/message tables and supports changing the private document context on a saved conversation. English and Russian interface strings are provided through the existing translation system.

AI generation still requires the administrator-configured HTTPS provider. If it is unavailable, generation stays disabled or returns a clear error. No paid provider was added. Essay, oral and case-study responses are not automatically scored; the interface provides suggested answers and explanations for self-review.

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
- Students can upload TXT, selectable-text PDF, DOCX, and PPTX files (10 MB per file, 25 MB per account). MIME and file signatures are checked; extracted text is stored in the database, and original files are stored with private permissions outside the public directory. Documents can be selected as context for a conversation, and owners can delete them. The assistant is told to treat document text as untrusted data.
- Conversations remember their selected support mode. Owners can rename or delete their own conversations; backend handlers check owner and role.
- AI questions are limited to eight requests per minute per authenticated account. Provider failures offer a retry for the last question.
- AI messages render safe Markdown for paragraphs, headings, lists, code and tables; response text is HTML-escaped before formatting. A copy button is available for assistant replies.
- The AI page links to existing tasks, timetable, quizzes, grades, shared resources, and application request pages.
- An additive migration adds `support_mode` to `ai_conversations`; no existing conversations are deleted.
- The shared footer states that StudentLife is an independent competition prototype and not an official university service.

## Known boundaries

- PDF text extraction requires the host's `pdftotext` binary and Office extraction requires PHP ZipArchive and DOM. If those are unavailable, the app refuses the upload with a clear error. Scanned-image OCR and reliable page-number citations are unavailable. The existing Documents & Resources page still stores shared links and descriptions only.
- The Applications & Certificates page sends an internal request to an administrator. It does not maintain application status, issue certificates, or expose policy documents to the AI. The assistant can guide users to that page but must not claim to submit, approve, or check a request.
- Official examination dates and institution grading rules are not present in the academic database. Students provide an exam date for a personal roadmap; it is labeled as student-supplied and never changes university records. The assistant must not invent dates or calculate an official GPA.
- AI practice question sets and attempts are stored in dedicated tables and never written to official grades. Objective questions are automatically scored; written answers require student self-review.
- AI mode selection does not create new role permissions. Student, lecturer, and administrator data retrieval remains governed by the existing backend scope.
- Feature branches run CI only. Merging into `codex/studentlife-preview` triggers the isolated preview deployment; Academic staging and production remain separate.

## Automated verification

The MariaDB integration suite covers AI mode persistence, conversation rename/delete ownership, confirmed task creation, rejection of a task for an un-enrolled course, private document storage, document deletion ownership, and separation between the two CI student accounts. It now also checks Learning Centre routing and labels, Russian labels, dynamic extraction for supported TXT, DOCX, PPTX and PDF formats, PPTX slide order, owner-scoped roadmap and exam-set reads, task progress updates, immediate practice feedback, attempt scoring/persistence, and no-provider behavior.

Historical status: GitHub Actions run 88 completed successfully on 2026-11-17. The new local changes have not yet run through PHP lint or the MariaDB acceptance suite. JavaScript syntax, static route/ownership checks, and `git diff --check` passed locally. This workspace has no PHP runtime, so runtime verification must happen in the repository workflow before Preview publication. Tests use fictional `studentlife.test` accounts and do not contact the configured external AI provider.

## Deployment and remaining work

- The currently deployed Preview is the earlier release. It does not include the Phase 1–6 local changes yet.
- Production remains untouched. No changes were pushed or deployed as part of this work.
- Before Preview publication, run the GitHub workflow and visually check student, lecturer and administrator roles, English/Russian switching, document extraction for every format the host advertises, and the 360px mobile layout.
- OCR for scanned PDFs, automatic grading of written exam responses, and application status integration remain outside the implemented scope.
