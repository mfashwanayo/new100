const db=require("../../config/database");
async function dashboard(id){
 const [[profile]]=await db.query(`SELECT u.full_name,u.email,u.phone,sp.admission_number,sp.date_of_birth,sp.gender,sp.address,sc.class_name,sc.level,sc.academic_year
 FROM users u JOIN student_profiles sp ON sp.user_id=u.id LEFT JOIN school_classes sc ON sc.id=sp.class_id WHERE u.id=?`,[id]);
 if(!profile) throw Error("Student profile is not available. Contact the administrator.");
 const [timetable]=await db.query(`SELECT te.day_of_week,te.start_time,te.end_time,te.room,s.subject_name,u.full_name teacher_name
 FROM timetable_entries te JOIN subjects s ON s.id=te.subject_id JOIN users u ON u.id=te.teacher_user_id
 WHERE te.class_id=(SELECT class_id FROM student_profiles WHERE user_id=?) AND te.is_active=1
 ORDER BY FIELD(te.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'),te.start_time`,[id]);
 const [attendance]=await db.query("SELECT attendance_date,status,notes FROM attendance_records WHERE student_user_id=? ORDER BY attendance_date DESC LIMIT 30",[id]);
 const [results]=await db.query(`SELECT a.title,a.assessment_date,a.total_marks,ar.marks_obtained,s.subject_name
 FROM assessment_results ar JOIN assessments a ON a.id=ar.assessment_id JOIN subjects s ON s.id=a.subject_id
 JOIN assessment_publications ap ON ap.assessment_id=a.id AND ap.is_published=1 WHERE ar.student_user_id=? ORDER BY a.assessment_date DESC,a.id DESC`,[id]);
 const [announcements]=await db.query("SELECT title,body,published_at FROM school_announcements WHERE published_at IS NOT NULL AND audience IN ('all','student') ORDER BY published_at DESC LIMIT 10",[ ]);
 const [notifications]=await db.query("SELECT title,message,created_at FROM user_notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 10",[id]);
 return {profile,timetable,attendance,results,announcements,notifications};
}
module.exports={dashboard};
