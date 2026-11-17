# StudentLife — Administrator Workspace: Phase 1

## Scope

Phase 1 establishes the administrator control plane for the standalone PHP 8 + MySQL cPanel application in `public/`. It is intentionally separate from the React/Base44 application source in `src/`.

## Implemented

- Administrator-only navigation and dashboard.
- Live aggregate counts for users, students, lecturers, administrators, courses, tasks, timetable entries and grades.
- Administrator-created accounts with validated email, supported role and a minimum 12-character password.
- Account register with role and status controls.
- Account states: active, suspended and deactivated.
- Administrator password reset by setting a new temporary password; the password is stored only as a PHP password hash.
- Protection against changing the current administrator's own role/status.
- Protection against demoting or suspending the last active administrator.
- Account status, email verification and role are refreshed from the database on every request, so account changes take effect in existing sessions.
- Repeated failed sign-ins are limited by email and IP over a 15-minute window; only keyed hashes are stored.
- CSRF validation on POST actions, prepared SQL statements, escaped output and session ID regeneration at login.
- Administrator audit trail for account creation and account updates.
- Automatic, additive database migration for the role/status columns and audit table. Existing academic records are not rewritten.

## Current limitations (not represented as completed)

- Academic Management currently provides aggregate counts and a roadmap; it does not yet provide cross-account course allocation, class rosters, timetable editing or grade management.
- Announcements, Documents & Resources, Reports & Analytics and System Settings are roadmap placeholders in the PHP MVP.
- Administrator invitations attempt delivery through PHP `mail()`; successful delivery depends on the host's mail transport. Self-service password recovery, MFA, general email notifications and fine-grained faculty/department permissions are not available.
- Student and lecturer academic records are still personal-account records in this MVP; a shared institutional academic data model is a later phase.
- The React/Base44 code under `src/` is a separate application layer with its own features and deployment lifecycle. Do not assume a feature in that layer is active in the PHP cPanel MVP.

## Verification

The production GitHub Actions workflow now runs PHP syntax checks against `public/index.php` and `public/install.php` before the frontend build and deployment.

A successful workflow run confirms the checks/build/deployment steps reported by GitHub; it does not replace a live login and role-permission test on cPanel.

## Manual acceptance checks

1. Sign in as an administrator and open User & Role Management.
2. Create a student and a lecturer account; confirm both appear in the account register.
3. Change a test account's role and status; confirm the new values persist after refresh.
4. Suspend a test account and confirm it cannot sign in or continue an existing session.
5. Reset a test account password and confirm the new password works while the previous one no longer works.
6. Confirm the current administrator cannot change their own role/status.
7. Confirm the last active administrator cannot be demoted or suspended.
8. Confirm account creation and updates appear in the audit trail.
9. Sign in as a student/lecturer and confirm administrator pages are inaccessible.

## Next phase

Build the shared institutional academic data model and administrator CRUD for academic structure, course offerings, enrolments, class sessions/timetable and academic records. Then connect announcements, shared documents and reports to those shared records.


## Phase 2A/2B — Shared academic foundation (implementation milestone)

The standalone PHP/MySQL application now includes additive migrations for:
- Departments
- Academic terms
- Shared academic course catalogue
- Course offerings/sections with optional lecturer assignment and capacity
- Student enrolments in shared course offerings

The Administrator > Academic Management page now supports creating departments, terms, catalogue courses, course sections, assigning active lecturer accounts, and enrolling active student accounts. It displays catalogue, section, and enrolment summaries.

Legacy per-user `courses`, `tasks`, `grades`, and `events` tables are retained and are not automatically merged into the new institutional catalogue. This avoids silently reclassifying personal records as official institutional data.

### Current Phase 2 scope boundary
- The shared foundation is implemented, but class-session scheduling, attendance, institutional assessments/grade entry, programme structures, bulk imports, edit/archive controls and student/lecturer workspace integration remain future work.
- Enrolment capacity is checked on submission; the database unique key prevents duplicate student enrolment in the same section.
- This milestone requires PHP syntax/workflow validation and live cPanel smoke tests before being treated as production-verified.


## Automated academic acceptance tests

A GitHub Actions integration-test job now provisions a disposable MariaDB database, seeds dedicated administrator/lecturer/student test accounts, runs the PHP app locally, and executes black-box acceptance tests against its sign-in and Academic Management flows.

Coverage includes department, term, course and offering creation; lecturer-role validation; course-credit validation; student enrolment; duplicate enrolment protection; section capacity; and administrator-only academic actions. The staging publish job depends on this test job, so a failing test blocks the Academic staging upload.

Test code:
- `tests/studentlife/seed.php`
- `tests/studentlife/acceptance.py`
- `.github/workflows/deploy-academic-staging.yml`

These checks run only against the temporary CI database. They do not create, modify or delete records in the live StudentLife database. A successful CI run is not a substitute for the first live cPanel smoke test.


## Phase 2C — Class scheduling, timetables and attendance

Implemented in the standalone PHP/MySQL application:
- `class_sessions` stores dated class sessions linked to course offerings, including start/end times, room, topic and creator.
- `attendance_records` stores one attendance status per student per session, with a unique session/student key and the staff member who recorded it.
- Administrators can create a one-off session or a weekly recurring series from Academic Management. Recurring creation is capped at 60 sessions per submission.
- Students see sessions for course offerings in which they are actively enrolled.
- Lecturers see sessions assigned to them and can mark enrolled students Present, Absent or Late. Attendance updates are recorded against the lecturer account.
- Administrators can view the institutional attendance register; lecturers see records for their assigned offerings; students see only their own attendance records.
- Attendance entry is staff-only. Student self-check-in is not enabled.
- Existing personal timetable events remain unchanged and separate from institutional class sessions.

The schema upgrades are additive and create the two new tables if absent. The feature does not migrate or delete existing personal events, grades, courses or tasks.

### Phase 2C verification scope
The CI acceptance suite now covers recurring weekly session creation, lecturer timetable access, lecturer attendance marking, student timetable visibility, student-only attendance reports and student restrictions on attendance actions. Live cPanel verification is still required after the gated Academic staging deployment.


## Account verification and demo data update

New administrator-created accounts are created in a pending state with email verification disabled. A single-use, 24-hour verification token is stored as a SHA-256 hash; the raw token is emailed as a verification link. An administrator can also mark an account verified from User & Role Management when mail delivery is unavailable. Sign-in requires valid credentials, the selected role, an active account and a verified email. Existing accounts are preserved as verified during the additive migration so current administrators and existing users are not locked out.

Email delivery uses PHP `mail()` and the hosting server's configured mail transport. If the host cannot deliver mail, an administrator can verify the account from User & Role Management. Configure the server mail transport and optional `mail_from` value in the private `config.php` to enable emailed links. Do not paste mail or database passwords into GitHub or chat.

The Academic Management page includes an administrator-only, repeatable demo-data seeder. It creates sample departments, terms, catalogue courses, sections, enrolments and class sessions using the first active lecturer and first active student account. It does not delete existing data and avoids duplicate records. Demo records are ordinary shared academic records and should be removed manually only after a database backup and administrator review.

Public self-registration is not enabled in this PHP MVP. Account creation remains administrator-controlled; the invited user verifies email and then signs in with the temporary password. A dedicated self-registration and password-reset workflow remains future work.
