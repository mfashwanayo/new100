const svc = require("./report.service");

async function teacherPage(req, res, next) {
  try {
    const [{ students, parents }, reports] = await Promise.all([
      svc.teacherTargets(req.session.user.id),
      svc.listTeacherReports(req.session.user.id)
    ]);
    res.render("reports/teacher", {
      title: "Reports",
      user: req.session.user,
      students, parents, reports,
      notice: req.query.notice || null,
      error: null
    });
  } catch (e) { next(e); }
}

async function teacherCreate(req, res, next) {
  try {
    await svc.createReport(req.session.user.id, req.body);
    res.redirect("/dashboard/teacher/reports?notice=" + encodeURIComponent("Report shared with the parent."));
  } catch (e) {
    res.redirect("/dashboard/teacher/reports?notice=" + encodeURIComponent(e.message));
  }
}

async function parentPage(req, res, next) {
  try {
    const reports = await svc.parentReports(req.session.user.id);
    res.render("reports/parent", {
      title: "School reports",
      user: req.session.user,
      reports,
      notice: req.query.notice || null
    });
  } catch (e) { next(e); }
}

module.exports = { teacherPage, teacherCreate, parentPage };