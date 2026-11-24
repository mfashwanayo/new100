const svc = require("../admin/service");

async function page(req, res, next) {
  try {
    const data = await svc.staffDashboard(req.session.user.id, req.session.user.role);
    res.render("staff/role-dashboard", {
      title: "Staff dashboard",
      user: req.session.user,
      ...data,
      notice: req.query.notice || null
    });
  } catch (e) { next(e); }
}

module.exports = { page };