const db=require("../../config/database");
async function toolsPage(req,res,next){try{
 const [classes]=await db.query("SELECT id,class_name FROM school_classes WHERE is_active=1 ORDER BY class_name");
 const [subjects]=await db.query("SELECT id,subject_name FROM subjects WHERE is_active=1 ORDER BY subject_name");
 const [teachers]=await db.query("SELECT u.id,u.full_name FROM users u JOIN teacher_profiles tp ON tp.user_id=u.id WHERE u.status='active' ORDER BY u.full_name");
 res.render("admin/stage4-tools",{title:"Academic setup",user:req.session.user,classes,subjects,teachers,notice:req.query.notice||null});
}catch(e){next(e);}}
async function announcement(req,res,next){try{
 const title=String(req.body.title||"").trim(),body=String(req.body.body||"").trim(),audience=String(req.body.audience||"");
 if(!title||!body||!["all","student","parent","teacher","staff"].includes(audience))throw Error("Enter announcement title, message and valid audience.");
 await db.query("INSERT INTO school_announcements(title,body,audience,created_by,published_at) VALUES(?,?,?,?,NOW())",[title,body,audience,req.session.user.id]);
 res.redirect("/dashboard/admin/stage4-tools?notice="+encodeURIComponent("Announcement published."));
}catch(e){next(e);}}
async function timetable(req,res,next){try{
 const c=Number(req.body.class_id),s=Number(req.body.subject_id),t=Number(req.body.teacher_id);
 const day=String(req.body.day_of_week||""),start=String(req.body.start_time||""),end=String(req.body.end_time||"");
 if(![c,s,t].every(Number.isInteger)||!["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].includes(day)||!start||!end||start>=end)throw Error("Complete all timetable fields with a valid time range.");
 const [[assigned]]=await db.query("SELECT id FROM teacher_assignments WHERE teacher_user_id=? AND class_id=? AND subject_id=? AND is_active=1",[t,c,s]);
 if(!assigned)throw Error("Assign this teacher to the class and subject before adding the timetable.");
 await db.query("INSERT INTO timetable_entries(class_id,subject_id,teacher_user_id,day_of_week,start_time,end_time,room) VALUES(?,?,?,?,?,?,?)",[c,s,t,day,start,end,String(req.body.room||"").trim()||null]);
 res.redirect("/dashboard/admin/stage4-tools?notice="+encodeURIComponent("Timetable entry saved."));
}catch(e){next(e);}}
async function book(req,res,next){try{
 const title=String(req.body.title||"").trim();
 if(!title)throw Error("Enter a book title.");
 const subjectId=Number(req.body.subject_id)||null;
 const classId=Number(req.body.class_id)||null;
 await db.query(
  "INSERT INTO books(title,author,subject_id,class_id,description,cover_url,file_path,created_by) VALUES(?,?,?,?,?,?,?,?)",
  [title,String(req.body.author||"").trim()||null,subjectId,classId,String(req.body.description||"").trim()||null,String(req.body.cover_url||"").trim()||null,String(req.body.file_path||"").trim()||null,req.session.user.id]);
 res.redirect("/dashboard/admin/stage4-tools?notice="+encodeURIComponent("Book added."));
}catch(e){next(e);}}
module.exports={toolsPage,announcement,timetable,book};
