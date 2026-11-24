const svc=require("./stage4.service");
async function page(req,res,next){try{
 const base=await require("./service").dashboard(req.session.user.id);
 const extra=await svc.data(req.session.user.id);
 res.render("teacher/dashboard",{title:"Teacher dashboard",user:req.session.user,...base,...extra,notice:req.query.notice||null});
}catch(e){next(e);}}
module.exports={page};
