const router=require("express").Router();
const controller=require("./controller");
const {verifyCsrf}=require("../../middleware/csrf.middleware");
const {loginLimiter}=require("../../services/security.service");
router.post("/login",loginLimiter,verifyCsrf,controller.login);
router.post("/logout",verifyCsrf,controller.logout);
module.exports=router;
