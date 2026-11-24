# UTUNYANGE Stage 3 — Administrator and Teacher Dashboards

## Before installing
Stage 3 extends the Stage 2 authentication project. Keep your existing `.env` file and make a backup of the project and database first. Do not replace the Stage 2 authentication files.

## Install
1. Extract this ZIP into `C:\\xampp2\\htdocs\\UTUNYANGEbyGPT`.
2. Merge folders and allow the Stage 3 files to be added. Replace `src/routes/web.routes.js` when prompted.
3. Start MySQL in XAMPP and open phpMyAdmin.
4. Select the `utunyange_school` database and import `database/migrations/003_stage3_school_operations.sql`.
5. In PowerShell:
   ```powershell
   cd C:\\xampp2\\htdocs\\UTUNYANGEbyGPT
   npm run dev
   ```
6. Sign in using your existing administrator account at `http://localhost:3000/login`.

## Included
- Admin dashboard statistics and account listing.
- Admin creation of student, teacher, parent, staff and admin accounts.
- Student admission number and teacher employee number profile creation.
- Class and subject creation.
- Teacher-to-class/subject assignments.
- Parent-to-student linking.
- Teacher dashboard with assigned classes, subjects and student roster.
- Database foundations for attendance and assessments/results.

## Important
- New users receive a temporary password set by the administrator. Share it securely and arrange a password-change workflow before real deployment.
- The teacher dashboard currently displays assignments and student rosters. Attendance entry, grade entry, assignment publishing and learning-resource workflows are not yet active.
- Stage 3 does not yet provide editing/deactivation screens, parent portal child views, student class placement, password reset or production deployment hardening.
- Use unique emails, usernames and admission numbers. Passwords must be at least 12 characters.
- This is a development stage. Do not expose it publicly or use real student data until the remaining security, privacy, backup and operational controls are completed.
