const router = require("express").Router();
const c = require("./lms.controller");
const { verifyCsrf } = require("../../middleware/csrf.middleware");

router.get("/lms", c.teacherLmsPage);
router.post("/lms/lessons",           verifyCsrf, c.createLesson);
router.post("/lms/lessons/publish",   verifyCsrf, c.publishLesson);
router.post("/lms/assignments",       verifyCsrf, c.createAssignment);
router.post("/lms/assignments/publish", verifyCsrf, c.publishAssignment);
router.get("/lms/assignments/:id/submissions", c.viewSubmissions);
router.post("/lms/grade",             verifyCsrf, c.gradeSubmission);

module.exports = router;
