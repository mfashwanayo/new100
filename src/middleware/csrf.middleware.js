const crypto=require("crypto");
function attachCsrf(req,res,next){
 if(!req.session.csrfToken) req.session.csrfToken=crypto.randomBytes(32).toString("hex");
 res.locals.csrfToken=req.session.csrfToken; next();
}
function verifyCsrf(req,res,next){
 if(!req.body || req.body._csrf!==req.session.csrfToken) return res.status(403).send("Invalid form token. Refresh and try again.");
 next();
}
module.exports={attachCsrf,verifyCsrf};
