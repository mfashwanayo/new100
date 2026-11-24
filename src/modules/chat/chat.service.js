const db = require("../../config/database");

// List users a given user can chat with (parents <-> teachers, plus staff/admin)
async function contacts(userId, role) {
  let rows = [];
  if (role === "parent") {
    // teachers of the parent's children + school staff/admin
    const [teachers] = await db.query(
      `SELECT DISTINCT u.id, u.full_name, r.name AS role
       FROM parent_student ps
       JOIN student_profiles sp ON sp.user_id = ps.student_user_id
       JOIN teacher_assignments ta ON ta.class_id = sp.class_id AND ta.is_active=1
       JOIN users u ON u.id = ta.teacher_user_id AND u.status='active'
       JOIN roles r ON r.id = u.role_id
       WHERE ps.parent_user_id = ?
       ORDER BY u.full_name`, [userId]);
    const [staff] = await db.query(
      `SELECT u.id,u.full_name,r.name AS role FROM users u JOIN roles r ON r.id=u.role_id
       WHERE r.name IN ('admin','head_teacher','dos','deputy_head','secretary','staff') AND u.status='active' ORDER BY u.full_name`);
    rows = [...teachers, ...staff];
  } else if (role === "teacher") {
    // parents of students in the teacher's classes
    const [parents] = await db.query(
      `SELECT DISTINCT u.id, u.full_name, 'parent' AS role
       FROM teacher_assignments ta
       JOIN student_profiles sp ON sp.class_id = ta.class_id
       JOIN parent_student ps ON ps.student_user_id = sp.user_id
       JOIN users u ON u.id = ps.parent_user_id AND u.status='active'
       WHERE ta.teacher_user_id = ? AND ta.is_active=1
       ORDER BY u.full_name`, [userId]);
    rows = parents;
  } else {
    // staff/admin/student: list parents + teachers
    const [parents] = await db.query(
      `SELECT u.id,u.full_name,'parent' AS role FROM users u JOIN roles r ON r.id=u.role_id WHERE r.name='parent' AND u.status='active' ORDER BY u.full_name`);
    const [teachers] = await db.query(
      `SELECT u.id,u.full_name,'teacher' AS role FROM users u JOIN roles r ON r.id=u.role_id WHERE r.name='teacher' AND u.status='active' ORDER BY u.full_name`);
    rows = [...parents, ...teachers];
  }
  // dedupe by id
  const seen = new Set();
  return rows.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
}

async function messages(userId, otherId) {
  const [rows] = await db.query(
    `SELECT id,sender_id,receiver_id,body,is_read,created_at
     FROM chat_messages
     WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)
     ORDER BY created_at ASC LIMIT 200`,
    [userId, otherId, otherId, userId]);
  return rows;
}

async function send(userId, data) {
  const receiverId = Number(data.receiver_id);
  const body = String(data.body || "").trim();
  if (!Number.isInteger(receiverId) || !body) throw new Error("Choose a recipient and write a message.");
  if (receiverId === userId) throw new Error("You cannot message yourself.");
  const [[recv]] = await db.query("SELECT id FROM users WHERE id=? AND status='active'", [receiverId]);
  if (!recv) throw new Error("Recipient not found.");
  const [r] = await db.query(
    "INSERT INTO chat_messages(sender_id,receiver_id,body) VALUES(?,?,?)",
    [userId, receiverId, body]);
  return r.insertId;
}

async function markRead(userId, otherId) {
  await db.query(
    "UPDATE chat_messages SET is_read=1 WHERE receiver_id=? AND sender_id=? AND is_read=0",
    [userId, otherId]);
}

async function unreadCount(userId) {
  const [[r]] = await db.query("SELECT COUNT(*) AS n FROM chat_messages WHERE receiver_id=? AND is_read=0", [userId]);
  return Number(r.n);
}

module.exports = { contacts, messages, send, markRead, unreadCount };