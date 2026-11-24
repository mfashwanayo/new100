const db = require("../../config/database");

// Teacher: list students in their classes (for report targeting) + parents
async function teacherTargets(teacherId) {
  const [students] = await db.query(
    `SELECT DISTINCT u.id, u.full_name, sp.admission_number, sc.class_name
     FROM teacher_assignments ta
     JOIN school_classes sc ON sc.id = ta.class_id
     JOIN student_profiles sp ON sp.class_id = sc.id
     JOIN users u ON u.id = sp.user_id AND u.status='active'
     WHERE ta.teacher_user_id=? AND ta.is_active=1
     ORDER BY sc.class_name, u.full_name LIMIT 200`, [teacherId]);
  const [parents] = await db.query(
    `SELECT DISTINCT ps.student_user_id, pu.id AS parent_id, pu.full_name AS parent_name
     FROM parent_student ps JOIN users pu ON pu.id = ps.parent_user_id AND pu.status='active'`);
  return { students, parents };
}

async function createReport(teacherId, data) {
  const studentId = Number(data.student_user_id);
  const title = String(data.title || "").trim();
  const body = String(data.body || "").trim();
  const reportDate = String(data.report_date || "").trim();
  if (!Number.isInteger(studentId) || !title || !body || !reportDate)
    throw new Error("Select a student and enter a title, report text and date.");
  // verify teacher teaches this student's class
  const [[ok]] = await db.query(
    `SELECT 1 FROM teacher_assignments ta
     JOIN student_profiles sp ON sp.class_id = ta.class_id
     WHERE ta.teacher_user_id=? AND ta.is_active=1 AND sp.user_id=? LIMIT 1`,
    [teacherId, studentId]);
  if (!ok) throw new Error("You do not teach this student.");
  // find linked parent (first)
  const [[parent]] = await db.query(
    "SELECT parent_user_id FROM parent_student WHERE student_user_id=? ORDER BY id LIMIT 1", [studentId]);
  const [r] = await db.query(
    `INSERT INTO teacher_reports(teacher_user_id,student_user_id,parent_user_id,title,body,report_date)
     VALUES(?,?,?,?,?,?)`,
    [teacherId, studentId, parent ? parent.parent_user_id : null, title, body, reportDate]);
  // notify parent
  if (parent) {
    await db.query(
      `INSERT INTO user_notifications(user_id,title,message,notification_type,related_id) VALUES(?,?,?,?,?)`,
      [parent.parent_user_id, "New school report",
       `A report "${title}" has been shared about your child.`, "report", r.insertId]);
  }
  return r.insertId;
}

async function listTeacherReports(teacherId) {
  const [rows] = await db.query(
    `SELECT tr.id, tr.title, tr.body, tr.report_date, u.full_name AS student_name,
            pu.full_name AS parent_name
     FROM teacher_reports tr
     JOIN users u ON u.id = tr.student_user_id
     LEFT JOIN users pu ON pu.id = tr.parent_user_id
     WHERE tr.teacher_user_id=?
     ORDER BY tr.report_date DESC, tr.created_at DESC LIMIT 100`, [teacherId]);
  return rows;
}

// Parent: reports about their children
async function parentReports(parentId) {
  const [rows] = await db.query(
    `SELECT tr.id, tr.title, tr.body, tr.report_date, u.full_name AS student_name,
            tu.full_name AS teacher_name
     FROM teacher_reports tr
     JOIN parent_student ps ON ps.student_user_id = tr.student_user_id AND ps.parent_user_id=?
     JOIN users u ON u.id = tr.student_user_id
     LEFT JOIN users tu ON tu.id = tr.teacher_user_id
     ORDER BY tr.report_date DESC, tr.created_at DESC LIMIT 100`, [parentId]);
  return rows;
}

module.exports = { teacherTargets, createReport, listTeacherReports, parentReports };