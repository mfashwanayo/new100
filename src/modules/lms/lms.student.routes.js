const router = require("express").Router();
const c = require("./lms.controller");
const { verifyCsrf } = require("../../middleware/csrf.middleware");

router.get("/lms",         c.studentLmsPage);
router.post("/lms/submit", verifyCsrf, c.submitAssignment);

module.exports = router;
