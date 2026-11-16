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
- Account status is checked on every request, so a suspended/deactivated user cannot continue using an existing session.
- CSRF validation on POST actions, prepared SQL statements, escaped output and session ID regeneration at login.
- Administrator audit trail for account creation and account updates.
- Automatic, additive database migration for the role/status columns and audit table. Existing academic records are not rewritten.

## Current limitations (not represented as completed)

- Academic Management currently provides aggregate counts and a roadmap; it does not yet provide cross-account course allocation, class rosters, timetable editing or grade management.
- Announcements, Documents & Resources, Reports & Analytics and System Settings are roadmap placeholders in the PHP MVP.
- The PHP MVP does not yet provide invitation emails, self-service password recovery, MFA, email notifications or fine-grained faculty/department permissions.
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
