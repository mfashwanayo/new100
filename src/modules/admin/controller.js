const service=require("./service");
async function page(req,res,next){
  try{
    const [stats,users,lists]=await Promise.all([service.dashboardStats(),service.listUsers(),service.lists()]);
    res.render("admin/dashboard",{title:"Administrator dashboard",user:req.session.user,stats,users,lists,notice:req.query.notice||null,error:null});
  }catch(e){next(e);}
}
function action(fn,success){
 return async(req,res,next)=>{
  try{await fn(req);res.redirect("/dashboard/admin?notice="+encodeURIComponent(success));}
  catch(e){
    try{
      const [stats,users,lists]=await Promise.all([service.dashboardStats(),service.listUsers(),service.lists()]);
      res.status(422).render("admin/dashboard",{title:"Administrator dashboard",user:req.session.user,stats,users,lists,notice:null,error:e.code==="ER_DUP_ENTRY"?"That username, email or admission number already exists.":e.message});
    }catch(inner){next(inner);}
  }
 };
}
const createUser=action(req=>service.createUser(req.body,req.session.user.id),"Account created successfully.");
const createClass=action(req=>service.createClass(req.body.class_name,req.body.level,req.body.academic_year),"Class created successfully.");
const createSubject=action(req=>service.createSubject(req.body.subject_name,req.body.subject_code),"Subject created successfully.");
const assignTeacher=action(req=>service.assignTeacher(req.body,req.session.user.id),"Teacher assignment saved.");
const linkParent=action(req=>service.linkParent(req.body,req.session.user.id),"Parent linked to student.");
const assignStudentClass=action(req=>service.assignStudentClass(req.body),"Student class placement saved.");
module.exports={page,createUser,createClass,createSubject,assignTeacher,linkParent,assignStudentClass};
