const s=require("./service");
async function page(req,res,next){try{res.render("parent/dashboard",{title:"Parent dashboard",user:req.session.user,...await s.dashboard(req.session.user.id)});}catch(e){next(e);}}
module.exports={page};
