const db=require("../../config/database");
async function dashboard(teacherId){
 const [assignments]=await db.query(`
  SELECT ta.id,sc.class_name,sc.level,sc.academic_year,s.subject_name,s.subject_code
  FROM teacher_assignments ta
  JOIN school_classes sc ON sc.id=ta.class_id
  JOIN subjects s ON s.id=ta.subject_id
  WHERE ta.teacher_user_id=? AND ta.is_active=1 ORDER BY sc.class_name,s.subject_name
 `,[teacherId]);
 const [[attendance]] = await db.query("SELECT COUNT(*) AS total FROM attendance_records WHERE marked_by=? AND attendance_date=CURDATE()",[teacherId]);
 const [[assessments]] = await db.query("SELECT COUNT(*) AS total FROM assessments WHERE created_by=?",[teacherId]);
 const [students]=await db.query(`
  SELECT DISTINCT u.id,u.full_name,sp.admission_number,sc.class_name,s.subject_name
  FROM teacher_assignments ta
  JOIN school_classes sc ON sc.id=ta.class_id
  JOIN subjects s ON s.id=ta.subject_id
  JOIN student_profiles sp ON sp.class_id=sc.id
  JOIN users u ON u.id=sp.user_id AND u.status='active'
  WHERE ta.teacher_user_id=? AND ta.is_active=1
  ORDER BY sc.class_name,u.full_name LIMIT 100
 `,[teacherId]);
 return {assignments,students,todayAttendance:Number(attendance.total),assessments:Number(assessments.total)};
}
module.exports={dashboard};
