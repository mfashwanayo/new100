const r=require("express").Router(),c=require("./stage4.controller");
const {verifyCsrf}=require("../../middleware/csrf.middleware");
r.get("/stage4-tools",c.toolsPage);
r.post("/announcements",verifyCsrf,c.announcement);
r.post("/timetable",verifyCsrf,c.timetable);
r.post("/books",verifyCsrf,c.book);
module.exports=r;
