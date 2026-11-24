# UTUNYANGE Stage 2 installation

1. Back up your existing project folder.
2. Extract this ZIP into `C:\xampp2\htdocs\UTUNYANGEbyGPT` and merge folders.
3. Keep your current `.env`; add the variables below to it (do not overwrite secrets).
4. Import `database/schema/utunyange.sql` using phpMyAdmin.
5. From PowerShell in the project root run `npm install`, `npm run seed:admin`, then `npm run dev`.
6. Visit `http://localhost:3000/login`.

Add these settings to `.env` and change the sample values:
```
NODE_ENV=development
PORT=3000
APP_NAME=UTUNYANGE
DB_HOST=localhost
DB_PORT=3306
DB_NAME=utunyange_school
DB_USER=root
DB_PASSWORD=
SESSION_SECRET=replace_with_a_random_secret_at_least_32_characters
ADMIN_NAME=UTUNYANGE Administrator
ADMIN_EMAIL=admin@utunyange.rw
ADMIN_PASSWORD=ChooseAUniquePassword123!
```
The admin seeder requires an initial password of at least 12 characters. Do not commit or share `.env`.

Roles: super_admin, admin, teacher, student, parent, staff. Public self-registration is intentionally disabled; account creation should be controlled by administrators.

This stage provides database connectivity, persistent MySQL sessions, password hashing, login/logout, CSRF form tokens, login rate limiting and role-protected dashboard entry points. Dashboard content is a starter scaffold; school operations, account management, password reset, MFA and production hardening remain future work. Use HTTPS and complete security/privacy review before entering real learner data.

## Create additional test accounts
Edit the `NEW_USER_*` variables in `.env`, then run `npm run create:user`.
Use one of these roles: `admin`, `teacher`, `student`, `parent`, or `staff`.
The command creates one account and refuses duplicate email/username values. Repeat with
different values for each account. Remove or change these temporary variables after use.
