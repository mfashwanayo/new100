const rateLimit=require("express-rate-limit");
exports.loginLimiter=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:"draft-7",legacyHeaders:false,message:"Too many login attempts. Wait 15 minutes and try again."});
