const router = require("express").Router();
const c = require("./fees.controller");

router.get("/fees", c.parentFeesPage);

module.exports = router;
