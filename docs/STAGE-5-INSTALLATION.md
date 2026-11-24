# UTUNYANGE Stage 5 — LMS Installation Guide

## What Stage 5 adds

| Feature | Details |
|---|---|
| **Lessons** | Teachers create, write and publish lessons per class/subject |
| **Assignments** | Teachers post assignments with due dates and max scores |
| **Submissions** | Students submit written answers online |
| **Grading** | Teachers grade submissions with score + feedback |
| **Notifications** | Students notified when lessons/assignments are published; notified when graded |

---

## Prerequisites

- Stage 1–4 installed and working
- MySQL running in XAMPP
- Node.js installed

---

## Installation steps

### 1. Import the database migration

1. Open **phpMyAdmin** → select `utunyange_school`
2. Click **Import**
3. Import this file:
   ```
   database/migrations/005_stage5_lms.sql
   ```

### 2. Confirm `.env` exists

The file `C:\xampp2\htdocs\UTUNYANGEbyGPT\.env` has been created for you.  
Edit `SESSION_SECRET` and `ADMIN_PASSWORD` if needed.

### 3. Start the server

```powershell
cd C:\xampp2\htdocs\UTUNYANGEbyGPT
npm run dev
```

---

## Dashboard URLs

| Dashboard | URL |
|---|---|
| Administrator | http://localhost:3000/dashboard/admin |
| Admin tools (timetable / announcements) | http://localhost:3000/dashboard/admin/stage4-tools |
| Teacher | http://localhost:3000/dashboard/teacher |
| Teacher LMS | http://localhost:3000/dashboard/teacher/lms |
| Student | http://localhost:3000/dashboard/student |
| Student LMS | http://localhost:3000/dashboard/student/lms |
| Parent | http://localhost:3000/dashboard/parent |

---

## Testing workflow

1. Admin creates a teacher + student account
2. Admin assigns the teacher to a class/subject
3. Admin places the student in that class
4. Teacher logs in → goes to **Lessons & Assignments**
5. Teacher creates a lesson → publishes it → student sees it
6. Teacher creates an assignment → publishes it → student gets notified
7. Student logs in → goes to **My Lessons & Assignments** → submits answer
8. Teacher views submissions → grades them
9. Student sees their score and feedback

---

## Stage 6 — School Fees & Payments (next)

Stage 6 will add: invoices, payment tracking, fee balances visible in the parent dashboard.
