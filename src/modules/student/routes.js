const r=require("express").Router(),c=require("./controller");r.get("/",c.page);module.exports=r;
