const r = require("express").Router();
const c = require("./controller");
const { verifyCsrf } = require("../../middleware/csrf.middleware");
r.get("/", c.page);
r.post("/", verifyCsrf, c.send);
module.exports = r;