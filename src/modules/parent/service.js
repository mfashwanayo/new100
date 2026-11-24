const db=require("../../config/database");
async function dashboard(id){
 const [children]=await db.query(`SELECT u.id,u.full_name,sp.admission_number,sc.class_name,sc.level
 FROM parent_student ps JOIN users u ON u.id=ps.student_user_id JOIN student_profiles sp ON sp.user_id=u.id
 LEFT JOIN school_classes sc ON sc.id=sp.class_id WHERE ps.parent_user_id=? AND u.status='active' ORDER BY u.full_name`,[id]);
 const ids=children.map(x=>x.id);let attendance=[],results=[];
 if(ids.length){const q=ids.map(()=>"?").join(",");
 [attendance]=await db.query(`SELECT ar.student_user_id,u.full_name,ar.attendance_date,ar.status FROM attendance_records ar JOIN users u ON u.id=ar.student_user_id WHERE ar.student_user_id IN (${q}) ORDER BY ar.attendance_date DESC LIMIT 50`,ids);
 [results]=await db.query(`SELECT ar.student_user_id,u.full_name,a.title,a.assessment_date,a.total_marks,ar.marks_obtained,s.subject_name
 FROM assessment_results ar JOIN users u ON u.id=ar.student_user_id JOIN assessments a ON a.id=ar.assessment_id JOIN subjects s ON s.id=a.subject_id
 JOIN assessment_publications ap ON ap.assessment_id=a.id AND ap.is_published=1 WHERE ar.student_user_id IN (${q}) ORDER BY a.assessment_date DESC LIMIT 50`,ids);}
 const [announcements]=await db.query("SELECT title,body,published_at FROM school_announcements WHERE published_at IS NOT NULL AND audience IN ('all','parent') ORDER BY published_at DESC LIMIT 10");
 const [notifications]=await db.query("SELECT title,message,created_at FROM user_notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 15",[id]);
 return {children,attendance,results,announcements,notifications};
}
module.exports={dashboard};
