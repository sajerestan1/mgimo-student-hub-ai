# StudentLife AI Learning Centre

Reviewed 2026-11-22. This feature uses the existing PHP/MySQL application in `public/`. The React/Base44 source is a separate app and was not changed.

## Current implementation

- The student navigation entry is **AI Tools** and opens **AI Learning Centre**. The nine cards use the requested feature names, icons, AI badges, descriptions and routes.
- Homework help, study companion and plagiarism review use the persistent AI conversation backend. Plagiarism feedback is advisory; no external similarity database or percentage is claimed.
- AI Study Planner and AI Study Roadmap use enrolled-course context, private uploaded materials and recorded data where available. Personal exam dates and study availability remain student-entered.
- AI Exam Preparation stores generated practice and attempts separately from official grades. Objective answers are scored; written responses are for self-review.
- AI Lecture Summariser supports only formats the host can extract. TXT, DOCX and PPTX use application code; PDF and legacy DOC/PPT depend on server tools. Unsupported formats are not advertised. Scanned-PDF OCR is unavailable.
- AI Chat uses owner-scoped conversations and messages, course context, optional private documents and existing provider configuration.
- My AI Library links saved notes, documents, roadmaps and practice sets. AI Study Reminders are derived from each student’s own roadmap tasks and student-entered examination dates, using the existing records.
- AI Settings provides opt-in, category-based memory controls. The Grade Evaluator calculates estimates on the server from the signed-in student’s own marks and entered assessment weights; estimates are not official grades.
- All three existing roles and their current permissions remain in place. No duplicate AI tables, provider APIs, paid services or external notification services were added.

## Provider and privacy

The application reuses the configured OpenAI-compatible HTTPS provider. An administrator configures the endpoint, model and key in the existing settings flow or protected server configuration. Credentials stay outside public web files and the database. When no provider is configured, AI generation reports that clearly and does not save fabricated output.

Student documents are validated, extracted and stored privately outside the public directory where the host permits it. Conversations, generated content, roadmaps, practice attempts and memories are checked against the authenticated owner. Requests use the existing session authentication, CSRF checks and prepared SQL statements.

## Verification status

The acceptance suite includes role and ownership checks, route and label checks, Russian labels, document extraction fixtures, roadmap and practice persistence, provider-unavailable behavior, and the AI Grade Evaluator. The current follow-up adds checks for all nine feature routes, server-side grade calculation and access control, library/settings visibility, and private roadmap reminders.

In the local workspace, Node parsed all four inline JavaScript blocks and `git diff --check` passed. PHP and Python runtimes are unavailable here, so PHP lint, the Python acceptance suite and MariaDB integration checks must run in GitHub Actions before deployment. A prior Actions run does not verify these newer changes. Mobile and role-based visual checks also need a browser session on the Preview app.

Preview changes belong on `codex/studentlife-preview`; production remains separate. The deployment workflow runs integration checks before publishing Preview. No changes in this work target `main` or production.
