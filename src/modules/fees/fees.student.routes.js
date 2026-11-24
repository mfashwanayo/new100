const router = require("express").Router();
const c = require("./fees.controller");

router.get("/fees", c.studentFeesPage);

module.exports = router;
