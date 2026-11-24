const db = require("../../config/database");
const bcrypt = require("bcryptjs");

async function dashboardStats() {
  const [rows] = await db.query(`
    SELECT r.name AS role, COUNT(u.id) AS total
    FROM roles r LEFT JOIN users u ON u.role_id=r.id AND u.status='active'
    GROUP BY r.id, r.name
  `);
  const stats = Object.fromEntries(rows.map(x => [x.role, Number(x.total)]));
  const [[classes]] = await db.query("SELECT COUNT(*) AS total FROM school_classes WHERE is_active=1");
  const [[subjects]] = await db.query("SELECT COUNT(*) AS total FROM subjects WHERE is_active=1");
  return { ...stats, classes: Number(classes.total), subjects: Number(subjects.total) };
}

async function listUsers() {
  const [rows] = await db.query(`
    SELECT u.id,u.full_name,u.username,u.email,u.phone,u.status,r.name AS role
    FROM users u JOIN roles r ON r.id=u.role_id ORDER BY u.created_at DESC LIMIT 100
  `);
  return rows;
}

async function createUser(data, creatorId) {
  const name = String(data.full_name || "").trim();
  const email = String(data.email || "").trim().toLowerCase();
  const phone = String(data.phone || "").trim() || null;
  const role = String(data.role || "");
  const password = String(data.password || "");
  const allowed = ["admin","teacher","student","parent","staff","dos","accountant","head_teacher","deputy_head","librarian","secretary"];
  if (!name || name.length > 160) throw new Error("Enter a valid full name (maximum 160 characters).");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  if (!allowed.includes(role)) throw new Error("Choose a valid account role.");
  if (password.length < 12) throw new Error("Temporary password must contain at least 12 characters.");
  const username = String(data.username || email.split("@")[0]).trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,80}$/.test(username)) throw new Error("Username must be 3–80 characters (letters, numbers, dot, underscore or hyphen).");
  const hash = await bcrypt.hash(password, 12);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[roleRow]] = await conn.query("SELECT id FROM roles WHERE name=?", [role]);
    const [result] = await conn.query(
      "INSERT INTO users(role_id,full_name,username,email,phone,password_hash,status,must_change_password) VALUES(?,?,?,?,?,?, 'active',1)",
      [roleRow.id,name,username,email,phone,hash]
    );
    if (role === "student") {
      const admission = String(data.admission_number || "").trim();
      if (!admission) throw new Error("Admission number is required for a student.");
      await conn.query("INSERT INTO student_profiles(user_id,admission_number) VALUES(?,?)",[result.insertId,admission]);
    } else if (role === "teacher") {
      await conn.query("INSERT INTO teacher_profiles(user_id,employee_number,qualification) VALUES(?,?,?)",
        [result.insertId,String(data.employee_number||"").trim()||null,String(data.qualification||"").trim()||null]);
    } else if (role === "parent") {
      await conn.query("INSERT INTO parent_profiles(user_id) VALUES(?)",[result.insertId]);
    }
    await conn.query(
      "INSERT INTO audit_logs(user_id,action,entity_type,entity_id,details) VALUES(?,?,?,?,JSON_OBJECT('role',?,'email',?))",
      [creatorId,"user.created","users",result.insertId,role,email]
    );
    await conn.commit();
    return result.insertId;
  } catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}

async function createClass(name, level, academicYear) {
  const [r] = await db.query("INSERT INTO school_classes(class_name,level,academic_year) VALUES(?,?,?)",
    [String(name||"").trim(),String(level||"").trim()||null,String(academicYear||"").trim()||null]);
  return r.insertId;
}
async function createSubject(name, code) {
  const [r] = await db.query("INSERT INTO subjects(subject_name,subject_code) VALUES(?,?)",
    [String(name||"").trim(),String(code||"").trim()||null]);
  return r.insertId;
}
async function assignTeacher(data, actorId) {
  const teacherId = Number(data.teacher_id), classId = Number(data.class_id), subjectId = Number(data.subject_id);
  if (![teacherId,classId,subjectId].every(Number.isInteger)) throw new Error("Select a teacher, class and subject.");
  const [[teacher]] = await db.query("SELECT u.id FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=? AND r.name='teacher' AND u.status='active'",[teacherId]);
  if (!teacher) throw new Error("Selected teacher account was not found.");
  await db.query("INSERT INTO teacher_assignments(teacher_user_id,class_id,subject_id,assigned_by) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE is_active=1,assigned_by=VALUES(assigned_by)",
    [teacherId,classId,subjectId,actorId]);
}
async function assignStudentClass(data) {
 const studentId=Number(data.student_id), classId=Number(data.class_id);
 if (![studentId,classId].every(Number.isInteger)) throw new Error("Select a student and class.");
 const [result]=await db.query("UPDATE student_profiles SET class_id=? WHERE user_id=?",[classId,studentId]);
 if (!result.affectedRows) throw new Error("Student profile was not found.");
}
async function linkParent(data, actorId) {
  const parentId=Number(data.parent_id), studentId=Number(data.student_id);
  if (![parentId,studentId].every(Number.isInteger)) throw new Error("Select a parent and student.");
  const [[p]] = await db.query("SELECT u.id FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=? AND r.name='parent' AND u.status='active'",[parentId]);
  const [[s]] = await db.query("SELECT user_id FROM student_profiles WHERE user_id=?",[studentId]);
  if (!p || !s) throw new Error("The selected parent or student profile was not found.");
  await db.query("INSERT INTO parent_student(parent_user_id,student_user_id,relationship,linked_by) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE relationship=VALUES(relationship)",
    [parentId,studentId,String(data.relationship||"Parent").trim(),actorId]);
}
async function lists() {
  const [[teachers]] = await db.query("SELECT COUNT(*) AS n FROM users u JOIN roles r ON r.id=u.role_id WHERE r.name='teacher' AND u.status='active'");
  const [[students]] = await db.query("SELECT COUNT(*) AS n FROM users u JOIN roles r ON r.id=u.role_id WHERE r.name='student' AND u.status='active'");
  const [classes] = await db.query("SELECT id,class_name FROM school_classes WHERE is_active=1 ORDER BY class_name");
  const [subjects] = await db.query("SELECT id,subject_name FROM subjects WHERE is_active=1 ORDER BY subject_name");
  const [parents] = await db.query("SELECT u.id,u.full_name FROM users u JOIN roles r ON r.id=u.role_id WHERE r.name='parent' AND u.status='active' ORDER BY u.full_name");
  const [studentsList] = await db.query("SELECT u.id,u.full_name,sp.admission_number FROM users u JOIN student_profiles sp ON sp.user_id=u.id WHERE u.status='active' ORDER BY u.full_name");
  const [teachersList] = await db.query("SELECT u.id,u.full_name FROM users u JOIN roles r ON r.id=u.role_id WHERE r.name='teacher' AND u.status='active' ORDER BY u.full_name");
  return {teacherCount:Number(teachers.n),studentCount:Number(students.n),classes,subjects,parents,studentsList,teachersList};
}

const STAFF_ROLES = [
  ["dos","Director of Studies"],
  ["accountant","Accountant / Bursar"],
  ["head_teacher","Head Teacher / Master"],
  ["deputy_head","Deputy Head Teacher"],
  ["librarian","Librarian"],
  ["secretary","School Secretary"]
];

async function staffDashboard(userId, roleName){
  const [[me]] = await db.query("SELECT u.full_name,r.display_name FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=?",[userId]);
  const [announcements] = await db.query("SELECT title,body,published_at FROM school_announcements WHERE published_at IS NOT NULL AND audience IN ('all','staff') ORDER BY published_at DESC LIMIT 10");
  const [notifications] = await db.query("SELECT title,message,created_at FROM user_notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 10",[userId]);
  const [chatCount] = await db.query("SELECT COUNT(*) AS n FROM chat_messages WHERE receiver_id=? AND is_read=0",[userId]);
  return {me, roleName, roleLabel:(STAFF_ROLES.find(r=>r[0]===roleName)||[])[1]||"Staff", announcements, notifications, unreadChat:Number(chatCount[0].n)};
}

module.exports={dashboardStats,listUsers,createUser,createClass,createSubject,assignTeacher,assignStudentClass,linkParent,lists,staffDashboard,STAFF_ROLES};
