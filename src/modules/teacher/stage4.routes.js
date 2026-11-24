const r=require("express").Router(),c=require("./stage4.controller");
const {verifyCsrf}=require("../../middleware/csrf.middleware");
r.post("/attendance",verifyCsrf,c.attendance);
r.post("/assessments",verifyCsrf,c.assessment);
r.post("/marks",verifyCsrf,c.mark);
r.post("/publish-results",verifyCsrf,c.publish);
module.exports=r;
