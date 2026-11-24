const service=require("./service");
async function page(req,res,next){
 try{
  const data=await service.dashboard(req.session.user.id);
  res.render("teacher/dashboard",{title:"Teacher dashboard",user:req.session.user,...data});
 }catch(e){next(e);}
}
module.exports={page};
