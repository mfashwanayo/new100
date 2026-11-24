const db = require("../../config/database");

async function studentBooks(studentId) {
  const [[sp]] = await db.query("SELECT class_id FROM student_profiles WHERE user_id=?", [studentId]);
  const classId = sp ? sp.class_id : null;
  const [books] = await db.query(
    `SELECT b.id, b.title, b.author, b.description, b.cover_url, b.file_path,
            s.subject_name, sc.class_name
     FROM books b
     LEFT JOIN subjects s ON s.id = b.subject_id
     LEFT JOIN school_classes sc ON sc.id = b.class_id
     WHERE b.is_active=1 AND (b.class_id IS NULL OR b.class_id=? OR b.class_id=(SELECT class_id FROM student_profiles WHERE user_id=?))
     ORDER BY b.created_at DESC LIMIT 100`,
    [classId, studentId]);
  return books;
}

module.exports = { studentBooks };