const r = require("express").Router();
const c = require("./controller");
r.get("/", c.page);
module.exports = r;