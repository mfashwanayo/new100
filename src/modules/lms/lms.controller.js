// Stage 5 LMS controller
const svc = require("./lms.service");

// ─── Teacher: render LMS page ─────────────────────────────────────────────────
async function teacherLmsPage(req, res, next) {
  try {
    const id = req.session.user.id;
    const [myAssignments, lessons, assignments] = await Promise.all([
      svc.teacherAssignments(id),
      svc.listLessonsTeacher(id),
      svc.listAssignmentsTeacher(id),
    ]);
    res.render("lms/teacher", {
      title: "Learning Management",
      user: req.session.user,
      myAssignments,
      lessons,
      assignments,
      notice: req.query.notice || null,
      error:  req.query.error  || null,
    });
  } catch (e) { next(e); }
}

// ─── Generic redirect-on-success wrapper ──────────────────────────────────────
const run = (fn, redirectTo) => async (req, res, next) => {
  try {
    await fn(req);
    res.redirect(redirectTo + "?notice=" + encodeURIComponent("Saved successfully."));
  } catch (e) {
    res.redirect(redirectTo + "?error=" + encodeURIComponent(e.message));
  }
};

// ─── Teacher actions ──────────────────────────────────────────────────────────
const createLesson      = run(req => svc.createLesson(req.session.user.id, req.body),      "/dashboard/teacher/lms");
const publishLesson     = run(req => svc.publishLesson(req.session.user.id, req.body.lesson_id), "/dashboard/teacher/lms");
const createAssignment  = run(req => svc.createAssignment(req.session.user.id, req.body),  "/dashboard/teacher/lms");
const publishAssignment = run(req => svc.publishAssignment(req.session.user.id, req.body.assignment_id), "/dashboard/teacher/lms");
const gradeSubmission   = run(req => svc.gradeSubmission(req.session.user.id, req.body),   "/dashboard/teacher/lms");

// ─── View submissions ─────────────────────────────────────────────────────────
async function viewSubmissions(req, res, next) {
  try {
    const data = await svc.listSubmissions(req.session.user.id, req.params.id);
    res.render("lms/submissions", {
      title: "Submissions — " + data.assignment.title,
      user: req.session.user,
      ...data,
      notice: req.query.notice || null,
    });
  } catch (e) { next(e); }
}

// ─── Student LMS page ─────────────────────────────────────────────────────────
async function studentLmsPage(req, res, next) {
  try {
    const data = await svc.studentLmsData(req.session.user.id);
    res.render("lms/student", {
      title: "My Lessons & Assignments",
      user: req.session.user,
      ...data,
      notice: req.query.notice || null,
      error:  req.query.error  || null,
    });
  } catch (e) { next(e); }
}

// ─── Student submit assignment ────────────────────────────────────────────────
const submitAssignment = run(req => svc.submitAssignment(req.session.user.id, req.body), "/dashboard/student/lms");

module.exports = {
  teacherLmsPage,
  createLesson,
  publishLesson,
  createAssignment,
  publishAssignment,
  gradeSubmission,
  viewSubmissions,
  studentLmsPage,
  submitAssignment,
};
