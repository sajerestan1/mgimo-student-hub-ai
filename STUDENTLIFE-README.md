# StudentLife — standalone academic companion

A lightweight, independent PHP 8 + MySQL student planner designed for standard cPanel hosting. It does not call Base44 and has no paid API dependency.

## MVP features
- Email/password sign-in with PHP password hashing and role-aware workspaces
- Administrator dashboard with live platform-wide activity counts
- Administrator-created student, lecturer and administrator accounts
- Role and account-status management (active, suspended and deactivated)
- Administrator-set temporary password reset, protected against changing the current administrator's role/status
- Last-active-administrator protection and an administrator audit trail
- Per-account courses, assignments/tasks, grades and timetable events
- Dashboard totals and grade average calculated from the user's own entries
- Prepared SQL statements, CSRF tokens, escaped output, session ID rotation and per-request account-status checks
- Responsive desktop/mobile interface
- One-time installer that creates MySQL tables and the first account

## Deploy on cPanel
1. In cPanel > MySQL Database Wizard, create a database and database user. Add the user to the database with **ALL PRIVILEGES**. Copy the full prefixed database name and username.
2. Push/deploy this repository through GitHub Actions. The files in `public/` are copied by Vite to `dist/` and uploaded to the domain document root.
3. Open `https://academic.buildforge.com.ng/install.php`. Usually the database host is `localhost`. Enter the full cPanel database name and username, database password, and create an administrator account with a unique password of at least 12 characters.
4. Sign in after the installer redirects you.
5. **Immediately delete `install.php` from the domain document root using cPanel File Manager.** Keep `config.php`; `.htaccess` denies web access to it.

## Current limitations and safety
- This is an early MVP, not a production-ready university information system. The administrator control plane now supports account creation, role/status management, administrator-set password resets and audit history. Academic Management is currently an aggregate read-only overview; course allocation, class rosters, institutional timetable editing, official GPA calculations, announcements, shared documents, reporting exports and system settings remain future work.
- There is no self-service email password recovery, invitation workflow, MFA, automated email reminders or fine-grained faculty/department permission model yet.
- Student and lecturer academic records are still stored as personal-account records. A shared institutional academic data model is required before cross-account academic administration can be enabled.
- Do not enter sensitive student records, passport details, health data or official university records. Use sample/demo data for presentations until access controls, backups, privacy notice, HTTPS enforcement and a security review are complete.
- Enable HTTPS and configure regular MySQL backups in cPanel.

## Requirements
PHP 8+, PDO MySQL extension, MySQL 5.7+/MariaDB 10.3+, Apache with .htaccess enabled.
