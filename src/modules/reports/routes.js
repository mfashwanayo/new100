const r = require("express").Router();
const c = require("./controller");
const { verifyCsrf } = require("../../middleware/csrf.middleware");

// Teacher routes (mounted at /dashboard/teacher/reports)
r.get("/", c.teacherPage);
r.post("/", verifyCsrf, c.teacherCreate);

module.exports = r;