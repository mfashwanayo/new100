const r = require("express").Router();
const c = require("./controller");
// Parent view (mounted at /dashboard/parent/reports)
r.get("/", c.parentPage);
module.exports = r;