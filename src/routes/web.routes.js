const router=require("express").Router();
const auth=require("../modules/auth/routes"),admin=require("../modules/admin/routes");
const admin4=require("../modules/admin/stage4.routes"),teacher=require("../modules/teacher/routes");
const teacher4=require("../modules/teacher/stage4.routes"),student=require("../modules/student/routes"),parent=require("../modules/parent/routes");
const lmsTeacher=require("../modules/lms/lms.teacher.routes"),lmsStudent=require("../modules/lms/lms.student.routes");
const staff=require("../modules/staff/routes");
const chat=require("../modules/chat/routes");
const reports=require("../modules/reports/routes");
const parentReports=require("../modules/reports/parent.routes");
const books=require("../modules/books/routes");
const {requireAuth,requireRole}=require("../middleware/auth.middleware");
[
 ["/","public/home","Welcome","home"],["/about","public/about","About UTUNYANGE","about"],
 ["/admissions","public/admissions","Admissions","admissions"],["/academics","public/academics","Academics","academics"],
 ["/news","public/news","News & Events","news"],["/contact","public/contact","Contact Us","contact"]
].forEach(([url,view,title,active])=>router.get(url,(req,res)=>res.render(view,{title,active})));
router.get("/login",(req,res)=>req.session.user?res.redirect("/dashboard"):res.render("auth/login",{title:"Sign in",error:null,loggedOut:req.query.loggedOut==="1"}));
router.use("/auth",auth);
router.get("/dashboard",requireAuth,(req,res)=>{const role=req.session.user.role;const target={super_admin:"admin",admin:"admin",teacher:"teacher",student:"student",parent:"parent"}[role];res.redirect(target?`/dashboard/${target}`:role==="staff"||["dos","accountant","head_teacher","deputy_head","librarian","secretary"].includes(role)?`/dashboard/${role}`:"/login");});
router.use("/dashboard/admin",requireAuth,requireRole("admin","super_admin"),admin);
router.use("/dashboard/admin",requireAuth,requireRole("admin","super_admin"),admin4);
router.use("/dashboard/teacher",requireAuth,requireRole("teacher"),teacher);
router.use("/dashboard/teacher",requireAuth,requireRole("teacher"),teacher4);
router.use("/dashboard/teacher",requireAuth,requireRole("teacher"),lmsTeacher);
router.use("/dashboard/teacher/reports",requireAuth,requireRole("teacher"),reports);
router.use("/dashboard/teacher/chat",requireAuth,requireRole("teacher"),chat);
router.use("/dashboard/student",requireAuth,requireRole("student"),student);
router.use("/dashboard/student",requireAuth,requireRole("student"),lmsStudent);
router.use("/dashboard/student/books",requireAuth,requireRole("student"),books);
router.use("/dashboard/student/chat",requireAuth,requireRole("student"),chat);
router.use("/dashboard/parent",requireAuth,requireRole("parent"),parent);
router.use("/dashboard/parent/reports",requireAuth,requireRole("parent"),parentReports);
router.use("/dashboard/parent/chat",requireAuth,requireRole("parent"),chat);
router.use("/dashboard/staff",requireAuth,requireRole("staff","dos","accountant","head_teacher","deputy_head","librarian","secretary"),staff);
router.use("/dashboard/dos",requireAuth,requireRole("dos"),staff);
router.use("/dashboard/accountant",requireAuth,requireRole("accountant"),staff);
router.use("/dashboard/head_teacher",requireAuth,requireRole("head_teacher"),staff);
router.use("/dashboard/deputy_head",requireAuth,requireRole("deputy_head"),staff);
router.use("/dashboard/librarian",requireAuth,requireRole("librarian"),staff);
router.use("/dashboard/secretary",requireAuth,requireRole("secretary"),staff);
router.use("/dashboard/dos/chat",requireAuth,requireRole("dos"),chat);
router.use("/dashboard/accountant/chat",requireAuth,requireRole("accountant"),chat);
router.use("/dashboard/head_teacher/chat",requireAuth,requireRole("head_teacher"),chat);
router.use("/dashboard/deputy_head/chat",requireAuth,requireRole("deputy_head"),chat);
router.use("/dashboard/librarian/chat",requireAuth,requireRole("librarian"),chat);
router.use("/dashboard/secretary/chat",requireAuth,requireRole("secretary"),chat);
router.use("/dashboard/staff/chat",requireAuth,requireRole("staff"),chat);
module.exports=router;