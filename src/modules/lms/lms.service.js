// Stage 5 LMS service — lessons, assignments, submissions, grading
const db = require("../../config/database");

// ─── TEACHER helpers ─────────────────────────────────────────────────────────

async function teacherAssignments(teacherId) {
  const [rows] = await db.query(
    `SELECT ta.class_id, ta.subject_id, sc.class_name, s.subject_name
     FROM teacher_assignments ta
     JOIN school_classes sc ON sc.id = ta.class_id
     JOIN subjects s ON s.id = ta.subject_id
     WHERE ta.teacher_user_id = ? AND ta.is_active = 1
     ORDER BY sc.class_name, s.subject_name`,
    [teacherId]
  );
  return rows;
}

async function assertTeacherOwns(teacherId, classId, subjectId) {
  const [[r]] = await db.query(
    "SELECT id FROM teacher_assignments WHERE teacher_user_id=? AND class_id=? AND subject_id=? AND is_active=1 LIMIT 1",
    [teacherId, classId, subjectId]
  );
  if (!r) throw new Error("You are not assigned to this class and subject.");
}

// ─── LESSONS ─────────────────────────────────────────────────────────────────

async function listLessonsTeacher(teacherId) {
  const [rows] = await db.query(
    `SELECT l.id, l.title, l.lesson_date, l.is_published, sc.class_name, s.subject_name
     FROM lessons l
     JOIN school_classes sc ON sc.id = l.class_id
     JOIN subjects s ON s.id = l.subject_id
     WHERE l.teacher_user_id = ?
     ORDER BY l.created_at DESC LIMIT 60`,
    [teacherId]
  );
  return rows;
}

async function createLesson(teacherId, data) {
  const classId   = Number(data.class_id);
  const subjectId = Number(data.subject_id);
  const title     = String(data.title  || "").trim();
  const body      = String(data.body   || "").trim();
  const date      = data.lesson_date   || null;
  if (!Number.isInteger(classId) || !Number.isInteger(subjectId) || !title)
    throw new Error("Enter lesson title and choose class/subject.");
  await assertTeacherOwns(teacherId, classId, subjectId);
  const [r] = await db.query(
    "INSERT INTO lessons(class_id,subject_id,teacher_user_id,title,body,lesson_date) VALUES(?,?,?,?,?,?)",
    [classId, subjectId, teacherId, title, body || null, date]
  );
  return r.insertId;
}

async function publishLesson(teacherId, lessonId) {
  const id = Number(lessonId);
  const [[l]] = await db.query(
    "SELECT id,class_id FROM lessons WHERE id=? AND teacher_user_id=?",
    [id, teacherId]
  );
  if (!l) throw new Error("Lesson not found or not created by you.");
  await db.query(
    "UPDATE lessons SET is_published=1, published_at=NOW() WHERE id=?",
    [id]
  );
  // notify all students in that class
  const [students] = await db.query(
    "SELECT user_id FROM student_profiles WHERE class_id=?",
    [l.class_id]
  );
  for (const s of students) {
    await db.query(
      "INSERT INTO user_notifications(user_id,title,message,notification_type,related_id) VALUES(?,?,?,?,?)",
      [s.user_id, "New lesson available", "A new lesson has been published for your class.", "lesson", id]
    );
  }
}

// ─── ASSIGNMENTS ─────────────────────────────────────────────────────────────

async function listAssignmentsTeacher(teacherId) {
  const [rows] = await db.query(
    `SELECT a.id, a.title, a.due_date, a.max_score, a.is_published, sc.class_name, s.subject_name
     FROM assignments a
     JOIN school_classes sc ON sc.id = a.class_id
     JOIN subjects s ON s.id = a.subject_id
     WHERE a.teacher_user_id = ?
     ORDER BY a.created_at DESC LIMIT 60`,
    [teacherId]
  );
  return rows;
}

async function createAssignment(teacherId, data) {
  const classId      = Number(data.class_id);
  const subjectId    = Number(data.subject_id);
  const title        = String(data.title        || "").trim();
  const instructions = String(data.instructions || "").trim();
  const dueDate      = String(data.due_date     || "").trim();
  const maxScore     = Number(data.max_score || 100);
  if (!Number.isInteger(classId) || !Number.isInteger(subjectId) || !title || !dueDate)
    throw new Error("Enter assignment title, due date and choose class/subject.");
  if (!Number.isFinite(maxScore) || maxScore <= 0)
    throw new Error("Enter a valid maximum score.");
  await assertTeacherOwns(teacherId, classId, subjectId);
  const [r] = await db.query(
    "INSERT INTO assignments(class_id,subject_id,teacher_user_id,title,instructions,due_date,max_score) VALUES(?,?,?,?,?,?,?)",
    [classId, subjectId, teacherId, title, instructions || null, dueDate, maxScore]
  );
  return r.insertId;
}

async function publishAssignment(teacherId, assignId) {
  const id = Number(assignId);
  const [[a]] = await db.query(
    "SELECT id,class_id,title FROM assignments WHERE id=? AND teacher_user_id=?",
    [id, teacherId]
  );
  if (!a) throw new Error("Assignment not found or not created by you.");
  await db.query(
    "UPDATE assignments SET is_published=1, published_at=NOW() WHERE id=?",
    [id]
  );
  const [students] = await db.query(
    "SELECT user_id FROM student_profiles WHERE class_id=?",
    [a.class_id]
  );
  for (const s of students) {
    await db.query(
      "INSERT INTO user_notifications(user_id,title,message,notification_type,related_id) VALUES(?,?,?,?,?)",
      [s.user_id, "New assignment", `Assignment "${a.title}" has been posted. Check the due date.`, "assignment", id]
    );
  }
}

async function listSubmissions(teacherId, assignId) {
  const id = Number(assignId);
  const [[a]] = await db.query(
    "SELECT id,title FROM assignments WHERE id=? AND teacher_user_id=?",
    [id, teacherId]
  );
  if (!a) throw new Error("Assignment not found or not created by you.");
  const [subs] = await db.query(
    `SELECT asub.id, u.full_name, asub.answer_text, asub.submitted_at,
            asub.score, asub.feedback, asub.graded_at
     FROM assignment_submissions asub
     JOIN users u ON u.id = asub.student_user_id
     WHERE asub.assignment_id = ?
     ORDER BY asub.submitted_at DESC`,
    [id]
  );
  return { assignment: a, submissions: subs };
}

async function gradeSubmission(teacherId, data) {
  const submId   = Number(data.submission_id);
  const score    = Number(data.score);
  const feedback = String(data.feedback || "").trim();
  if (!Number.isInteger(submId) || !Number.isFinite(score) || score < 0)
    throw new Error("Enter a valid submission ID and score.");
  // confirm teacher owns the assignment
  const [[sub]] = await db.query(
    `SELECT asub.id, asub.student_user_id, a.max_score
     FROM assignment_submissions asub
     JOIN assignments a ON a.id = asub.assignment_id
     WHERE asub.id=? AND a.teacher_user_id=?`,
    [submId, teacherId]
  );
  if (!sub) throw new Error("Submission not found or not yours to grade.");
  if (score > Number(sub.max_score)) throw new Error("Score cannot exceed the maximum.");
  await db.query(
    "UPDATE assignment_submissions SET score=?, feedback=?, graded_at=NOW(), graded_by=? WHERE id=?",
    [score, feedback || null, teacherId, submId]
  );
  await db.query(
    "INSERT INTO user_notifications(user_id,title,message,notification_type,related_id) VALUES(?,?,?,?,?)",
    [sub.student_user_id, "Assignment graded", `Your submission has been graded. Score: ${score}.`, "assignment", submId]
  );
}

// ─── STUDENT helpers ─────────────────────────────────────────────────────────

async function studentLmsData(studentId) {
  // find the student's class
  const [[sp]] = await db.query("SELECT class_id FROM student_profiles WHERE user_id=?", [studentId]);
  if (!sp) return { lessons: [], assignments: [], mySubmissions: [] };
  const classId = sp.class_id;

  const [lessons] = await db.query(
    `SELECT l.id, l.title, l.body, l.lesson_date, s.subject_name, u.full_name teacher_name
     FROM lessons l
     JOIN subjects s ON s.id = l.subject_id
     JOIN users u ON u.id = l.teacher_user_id
     WHERE l.class_id=? AND l.is_published=1
     ORDER BY l.lesson_date DESC, l.created_at DESC LIMIT 30`,
    [classId]
  );

  const [assignments] = await db.query(
    `SELECT a.id, a.title, a.instructions, a.due_date, a.max_score, s.subject_name,
            asub.score, asub.feedback, asub.submitted_at, asub.graded_at
     FROM assignments a
     JOIN subjects s ON s.id = a.subject_id
     LEFT JOIN assignment_submissions asub
       ON asub.assignment_id = a.id AND asub.student_user_id = ?
     WHERE a.class_id=? AND a.is_published=1
     ORDER BY a.due_date ASC`,
    [studentId, classId]
  );

  return { lessons, assignments };
}

async function submitAssignment(studentId, data) {
  const assignId   = Number(data.assignment_id);
  const answerText = String(data.answer_text || "").trim();
  if (!Number.isInteger(assignId) || !answerText)
    throw new Error("Select an assignment and write your answer.");
  const [[a]] = await db.query(
    "SELECT id,class_id FROM assignments WHERE id=? AND is_published=1",
    [assignId]
  );
  if (!a) throw new Error("Assignment not found.");
  const [[sp]] = await db.query(
    "SELECT user_id FROM student_profiles WHERE user_id=? AND class_id=?",
    [studentId, a.class_id]
  );
  if (!sp) throw new Error("You are not in the class this assignment belongs to.");
  await db.query(
    `INSERT INTO assignment_submissions(assignment_id,student_user_id,answer_text)
     VALUES(?,?,?)
     ON DUPLICATE KEY UPDATE answer_text=VALUES(answer_text), submitted_at=NOW()`,
    [assignId, studentId, answerText]
  );
}

module.exports = {
  teacherAssignments,
  listLessonsTeacher,
  createLesson,
  publishLesson,
  listAssignmentsTeacher,
  createAssignment,
  publishAssignment,
  listSubmissions,
  gradeSubmission,
  studentLmsData,
  submitAssignment,
};
