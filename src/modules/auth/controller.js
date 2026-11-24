const service=require("./service");
async function login(req,res,next){
 try{
  const identifier=String(req.body.identifier||"").trim();
  const password=String(req.body.password||"");
  if(!identifier||!password) return res.status(422).render("auth/login",{title:"Sign in",error:"Enter your username/email and password.",loggedOut:false});
  const user=await service.findUser(identifier);
  const valid=user && await service.checkPassword(password,user.password_hash);
  if(!valid||user.status!=="active") return res.status(401).render("auth/login",{title:"Sign in",error:"Login details are incorrect or the account is inactive.",loggedOut:false});
  await new Promise((resolve,reject)=>req.session.regenerate(err=>err?reject(err):resolve()));
  req.session.user={id:user.id,name:user.full_name,email:user.email,username:user.username,role:user.role};
  await new Promise((resolve,reject)=>req.session.save(err=>err?reject(err):resolve()));
  const target={super_admin:"/dashboard/admin",admin:"/dashboard/admin",teacher:"/dashboard/teacher",student:"/dashboard/student",parent:"/dashboard/parent",staff:"/dashboard/staff",dos:"/dashboard/dos",accountant:"/dashboard/accountant",head_teacher:"/dashboard/head_teacher",deputy_head:"/dashboard/deputy_head",librarian:"/dashboard/librarian",secretary:"/dashboard/secretary"};
  res.redirect(target[user.role]||"/dashboard");
 }catch(e){next(e);}
}
function logout(req,res,next){
 req.session.destroy(err=>{if(err)return next(err);res.clearCookie("utunyange.sid");res.redirect("/login?loggedOut=1");});
}
module.exports={login,logout};
