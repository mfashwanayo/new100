// Stage 6 — Fees & Payments controller
const svc = require("./fees.service");

const redirect = (path) => async (fn, req, res, next) => {
  try { await fn; res.redirect(path + "?notice=" + encodeURIComponent("Saved successfully.")); }
  catch(e) { res.redirect(path + "?error=" + encodeURIComponent(e.message)); }
};

// ─── Admin: fees management page ─────────────────────────────────────────────
async function adminFeesPage(req, res, next) {
  try {
    const [structures, invoices, stats] = await Promise.all([
      svc.listFeeStructures(),
      svc.listInvoices(),
      svc.feeStats(),
    ]);
    const db = require("../../config/database");
    const [students] = await db.query(
      `SELECT u.id, u.full_name, sp.admission_number
       FROM users u JOIN student_profiles sp ON sp.user_id=u.id
       WHERE u.status='active' ORDER BY u.full_name`
    );
    const [classes] = await db.query(
      "SELECT id, class_name FROM school_classes WHERE is_active=1 ORDER BY class_name"
    );
    res.render("fees/admin", {
      title: "Fees & Payments",
      user: req.session.user,
      structures, invoices, stats, students, classes,
      notice: req.query.notice || null,
      error:  req.query.error  || null,
    });
  } catch(e) { next(e); }
}

// ─── Admin actions ────────────────────────────────────────────────────────────
async function createFeeStructure(req, res, next) {
  try {
    await svc.createFeeStructure(req.body, req.session.user.id);
    res.redirect("/dashboard/admin/fees?notice=" + encodeURIComponent("Fee structure created."));
  } catch(e) {
    res.redirect("/dashboard/admin/fees?error=" + encodeURIComponent(e.message));
  }
}

async function createInvoice(req, res, next) {
  try {
    await svc.createInvoice(req.body, req.session.user.id);
    res.redirect("/dashboard/admin/fees?notice=" + encodeURIComponent("Invoice created and student notified."));
  } catch(e) {
    res.redirect("/dashboard/admin/fees?error=" + encodeURIComponent(e.message));
  }
}

async function recordPayment(req, res, next) {
  try {
    await svc.recordPayment(req.body, req.session.user.id);
    res.redirect("/dashboard/admin/fees?notice=" + encodeURIComponent("Payment recorded successfully."));
  } catch(e) {
    res.redirect("/dashboard/admin/fees?error=" + encodeURIComponent(e.message));
  }
}

// ─── Student: my fees page ───────────────────────────────────────────────────
async function studentFeesPage(req, res, next) {
  try {
    const data = await svc.studentFees(req.session.user.id);
    res.render("fees/student", {
      title: "My Fees & Payments",
      user: req.session.user,
      ...data,
      notice: req.query.notice || null,
    });
  } catch(e) { next(e); }
}

// ─── Parent: children fees page ──────────────────────────────────────────────
async function parentFeesPage(req, res, next) {
  try {
    const childrenFees = await svc.parentFees(req.session.user.id);
    res.render("fees/parent", {
      title: "School Fees",
      user: req.session.user,
      childrenFees,
      notice: req.query.notice || null,
    });
  } catch(e) { next(e); }
}

module.exports = {
  adminFeesPage, createFeeStructure, createInvoice, recordPayment,
  studentFeesPage, parentFeesPage,
};
