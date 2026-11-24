# UTUNYANGE Stage 4 installation

1. Back up the complete project and database.
2. Extract this ZIP into `C:\\xampp2\\htdocs\\UTUNYANGEbyGPT`, merging folders. Keep `.env` and Stage 2 authentication files.
3. In phpMyAdmin select `utunyange_school` and import `database/migrations/004_stage4.sql`.
4. In PowerShell run:
   ```powershell
   cd C:\\xampp2\\htdocs\\UTUNYANGEbyGPT
   npm run dev
   ```
5. Log in and open the correct portal:
   - `/dashboard/admin` — existing admin
   - `/dashboard/admin/stage4-tools` — timetable and announcements
   - `/dashboard/teacher` — attendance and assessment workflows
   - `/dashboard/student` — student portal
   - `/dashboard/parent` — parent portal

## Required setup
- Use Stage 3 admin tools to create student, teacher and parent accounts.
- Assign students to classes, assign teachers to those classes/subjects, and link each parent to their child.
- Use the admin Stage 4 tools page to add timetable entries and publish announcements.
- Teachers can record attendance, create assessments, enter marks and publish results.
- Parent notification records are created when a child is marked absent or late. Student notification records are created when results are published.

## Limitations / safety
- Fee balances are not displayed yet; Finance & Payments is planned for Stage 6.
- Formal report cards, configurable grade bands, messaging/contact workflows and editing/deleting historical records remain future work.
- Test using dummy accounts and data first. This is a development build, not a production deployment. Complete security/privacy review and backups before using real student data.
