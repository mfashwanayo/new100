const svc=require("./stage4.service");
const run=fn=>async(req,res,next)=>{try{await fn(req);res.redirect("/dashboard/teacher?notice="+encodeURIComponent("Changes saved."));}catch(e){next(e);}};
module.exports={
 attendance:run(req=>svc.attendance(req.session.user.id,req.body)),
 assessment:run(req=>svc.assessment(req.session.user.id,req.body)),
 mark:run(req=>svc.mark(req.session.user.id,req.body)),
 publish:run(req=>svc.publish(req.session.user.id,req.body.assessment_id))
};
