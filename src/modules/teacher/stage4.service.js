const db=require("../../config/database");
async function data(id){
 const [assignments]=await db.query(`SELECT ta.class_id,ta.subject_id,sc.class_name,sc.level,sc.academic_year,s.subject_name
 FROM teacher_assignments ta JOIN school_classes sc ON sc.id=ta.class_id JOIN subjects s ON s.id=ta.subject_id
 WHERE ta.teacher_user_id=? AND ta.is_active=1 ORDER BY sc.class_name,s.subject_name`,[id]);
 const [students]=await db.query(`SELECT DISTINCT u.id,u.full_name,sp.admission_number,sp.class_id,sc.class_name
 FROM student_profiles sp JOIN users u ON u.id=sp.user_id JOIN school_classes sc ON sc.id=sp.class_id
 WHERE u.status='active' AND sp.class_id IN (SELECT class_id FROM teacher_assignments WHERE teacher_user_id=? AND is_active=1)
 ORDER BY sc.class_name,u.full_name`,[id]);
 const [assessments]=await db.query(`SELECT a.id,a.title,a.total_marks,a.class_id,sc.class_name,s.subject_name,
 COALESCE(ap.is_published,0) is_published FROM assessments a JOIN school_classes sc ON sc.id=a.class_id
 JOIN subjects s ON s.id=a.subject_id LEFT JOIN assessment_publications ap ON ap.assessment_id=a.id
 WHERE a.created_by=? ORDER BY a.created_at DESC LIMIT 40`,[id]);
 const [attendance]=await db.query(`SELECT ar.attendance_date,ar.status,u.full_name,sc.class_name FROM attendance_records ar
 JOIN users u ON u.id=ar.student_user_id JOIN school_classes sc ON sc.id=ar.class_id
 WHERE ar.marked_by=? ORDER BY ar.attendance_date DESC LIMIT 30`,[id]);
 const [[today]]=await db.query("SELECT COUNT(*) total FROM attendance_records WHERE marked_by=? AND attendance_date=CURDATE()",[id]);
 return {assignments,students,assessments,attendance,todayAttendance:Number(today.total)};
}
async function assigned(id,classId,subjectId){
 const [[r]]=await db.query("SELECT id FROM teacher_assignments WHERE teacher_user_id=? AND class_id=? AND (? IS NULL OR subject_id=?) AND is_active=1 LIMIT 1",[id,classId,subjectId,subjectId]);
 return !!r;
}
async function attendance(id,d){
 const c=Number(d.class_id),s=d.subject_id?Number(d.subject_id):null,student=Number(d.student_id),status=String(d.status||"");
 if(![c,student].every(Number.isInteger)||!["present","absent","late","excused"].includes(status)) throw Error("Select a valid class, student and attendance status.");
 if(!await assigned(id,c,s)) throw Error("You are not assigned to this class/subject.");
 const [[p]]=await db.query("SELECT user_id FROM student_profiles WHERE user_id=? AND class_id=?",[student,c]);
 if(!p) throw Error("Student does not belong to your assigned class.");
 const date=d.attendance_date||new Date().toISOString().slice(0,10);
 await db.query(`INSERT INTO attendance_records(student_user_id,class_id,subject_id,attendance_date,status,marked_by,notes)
 VALUES(?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE status=VALUES(status),notes=VALUES(notes),marked_by=VALUES(marked_by)`,
 [student,c,s,date,status,id,String(d.notes||"").trim()||null]);
 if(["absent","late"].includes(status)){
  const [parents]=await db.query("SELECT parent_user_id FROM parent_student WHERE student_user_id=?",[student]);
  for(const p of parents) await db.query("INSERT INTO user_notifications(user_id,title,message,notification_type,related_id) VALUES(?,?,?,?,?)",
   [p.parent_user_id,"Attendance update",`A ${status} attendance entry was recorded for your child.`,"attendance",student]);
 }
}
async function assessment(id,d){
 const c=Number(d.class_id),s=Number(d.subject_id),total=Number(d.total_marks),title=String(d.title||"").trim();
 if(!Number.isInteger(c)||!Number.isInteger(s)||!title||!Number.isFinite(total)||total<=0) throw Error("Enter assessment title, class, subject and a valid total mark.");
 if(!await assigned(id,c,s)) throw Error("You are not assigned to this class and subject.");
 const [r]=await db.query("INSERT INTO assessments(title,class_id,subject_id,assessment_date,total_marks,created_by) VALUES(?,?,?,?,?,?)",
 [title,c,s,d.assessment_date||null,total,id]);
 await db.query("INSERT INTO assessment_publications(assessment_id,is_published) VALUES(?,0)",[r.insertId]);
}
async function mark(id,d){
 const aId=Number(d.assessment_id),student=Number(d.student_id),marks=Number(d.marks_obtained);
 if(!Number.isInteger(aId)||!Number.isInteger(student)||!Number.isFinite(marks)||marks<0) throw Error("Enter valid marks and student.");
 const [[a]]=await db.query("SELECT id,class_id,total_marks FROM assessments WHERE id=? AND created_by=?",[aId,id]);
 if(!a) throw Error("Assessment not found or not created by you.");
 if(marks>Number(a.total_marks)) throw Error("Marks cannot exceed the total.");
 const [[pub]]=await db.query("SELECT is_published FROM assessment_publications WHERE assessment_id=?",[aId]);
 if(pub?.is_published) throw Error("Published results are locked. Contact the administrator for corrections.");
 const [[p]]=await db.query("SELECT user_id FROM student_profiles WHERE user_id=? AND class_id=?",[student,a.class_id]);
 if(!p) throw Error("Student is not in this assessment class.");
 await db.query("INSERT INTO assessment_results(assessment_id,student_user_id,marks_obtained) VALUES(?,?,?) ON DUPLICATE KEY UPDATE marks_obtained=VALUES(marks_obtained)",[aId,student,marks]);
}
async function publish(id,aId){
 const [[a]]=await db.query("SELECT id,class_id FROM assessments WHERE id=? AND created_by=?",[Number(aId),id]);
 if(!a) throw Error("Assessment not found or not created by you.");
 await db.query("INSERT INTO assessment_publications(assessment_id,is_published,published_by,published_at) VALUES(?,1,?,NOW()) ON DUPLICATE KEY UPDATE is_published=1,published_by=VALUES(published_by),published_at=NOW()",[a.id,id]);
 const [kids]=await db.query("SELECT user_id FROM student_profiles WHERE class_id=?",[a.class_id]);
 for(const k of kids) await db.query("INSERT INTO user_notifications(user_id,title,message,notification_type,related_id) VALUES(?,?,?,?,?)",[k.user_id,"Results published","New assessment results are available in your student portal.","results",a.id]);
}
module.exports={data,attendance,assessment,mark,publish};
