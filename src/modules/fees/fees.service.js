// Stage 6 — School Fees & Payments service
const db = require("../../config/database");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function invoiceNumber() {
  const d = new Date();
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,"0");
  const r = Math.floor(Math.random()*90000)+10000;
  return `INV-${y}${m}-${r}`;
}

// ─── ADMIN: fee structures ────────────────────────────────────────────────────

async function listFeeStructures() {
  const [rows] = await db.query(
    `SELECT fs.id, fs.name, fs.description, fs.amount, fs.academic_year, fs.term,
            fs.applies_to, fs.is_active, sc.class_name
     FROM fee_structures fs
     LEFT JOIN school_classes sc ON sc.id = fs.class_id
     ORDER BY fs.academic_year DESC, fs.created_at DESC`
  );
  return rows;
}

async function createFeeStructure(data, creatorId) {
  const name  = String(data.name   || "").trim();
  const desc  = String(data.description || "").trim();
  const amount = Number(data.amount);
  const year  = String(data.academic_year || "").trim();
  const term  = String(data.term  || "Annual");
  const appTo = String(data.applies_to || "all");
  const classId = data.class_id ? Number(data.class_id) : null;
  const validTerms = ["Term 1","Term 2","Term 3","Annual"];
  if (!name || !year || !Number.isFinite(amount) || amount <= 0)
    throw new Error("Enter fee name, academic year and a valid amount.");
  if (!validTerms.includes(term)) throw new Error("Choose a valid term.");
  if (!["all","class"].includes(appTo)) throw new Error("Invalid applies_to value.");
  if (appTo === "class" && !classId) throw new Error("Choose a class for class-specific fees.");
  await db.query(
    "INSERT INTO fee_structures(name,description,amount,academic_year,term,applies_to,class_id,created_by) VALUES(?,?,?,?,?,?,?,?)",
    [name, desc||null, amount, year, term, appTo, classId, creatorId]
  );
}

// ─── ADMIN: invoices ──────────────────────────────────────────────────────────

async function listInvoices(filters = {}) {
  let where = "1=1", params = [];
  if (filters.student_id) { where += " AND si.student_user_id=?"; params.push(Number(filters.student_id)); }
  if (filters.status)     { where += " AND si.status=?";           params.push(filters.status); }
  const [rows] = await db.query(
    `SELECT si.id, si.invoice_number, si.amount_due, si.amount_paid,
            si.due_date, si.status, si.created_at,
            u.full_name student_name, sp.admission_number,
            sc.class_name, fs.name fee_name, fs.term
     FROM student_invoices si
     JOIN users u ON u.id = si.student_user_id
     JOIN student_profiles sp ON sp.user_id = si.student_user_id
     LEFT JOIN school_classes sc ON sc.id = sp.class_id
     JOIN fee_structures fs ON fs.id = si.fee_structure_id
     WHERE ${where}
     ORDER BY si.created_at DESC LIMIT 150`,
    params
  );
  return rows;
}

async function createInvoice(data, creatorId) {
  const studentId = Number(data.student_id);
  const feeId     = Number(data.fee_structure_id);
  const dueDate   = String(data.due_date || "").trim();
  const notes     = String(data.notes    || "").trim();
  if (!Number.isInteger(studentId) || !Number.isInteger(feeId) || !dueDate)
    throw new Error("Select a student, fee structure and due date.");
  const [[fee]] = await db.query("SELECT id,amount FROM fee_structures WHERE id=? AND is_active=1", [feeId]);
  if (!fee) throw new Error("Fee structure not found or inactive.");
  const [[sp]] = await db.query("SELECT user_id FROM student_profiles WHERE user_id=?", [studentId]);
  if (!sp) throw new Error("Student profile not found.");
  const invNo = invoiceNumber();
  await db.query(
    "INSERT INTO student_invoices(student_user_id,fee_structure_id,invoice_number,amount_due,due_date,notes,created_by) VALUES(?,?,?,?,?,?,?)",
    [studentId, feeId, invNo, fee.amount, dueDate, notes||null, creatorId]
  );
  // notify student
  await db.query(
    "INSERT INTO user_notifications(user_id,title,message,notification_type) VALUES(?,?,?,?)",
    [studentId, "New fee invoice", `Invoice ${invNo} has been issued. Amount due: ${fee.amount}. Due: ${dueDate}.`, "fee"]
  );
}

// ─── ADMIN: record payment ────────────────────────────────────────────────────

async function recordPayment(data, receiverId) {
  const invoiceId = Number(data.invoice_id);
  const amount    = Number(data.amount);
  const method    = String(data.payment_method || "cash");
  const ref       = String(data.reference_number || "").trim();
  const paidAt    = String(data.paid_at || new Date().toISOString().slice(0,10));
  const notes     = String(data.notes   || "").trim();
  const methods   = ["cash","bank_transfer","mobile_money","cheque","other"];
  if (!Number.isInteger(invoiceId) || !Number.isFinite(amount) || amount <= 0)
    throw new Error("Enter a valid invoice and payment amount.");
  if (!methods.includes(method)) throw new Error("Invalid payment method.");
  const [[inv]] = await db.query(
    "SELECT id,student_user_id,amount_due,amount_paid,status FROM student_invoices WHERE id=?",
    [invoiceId]
  );
  if (!inv) throw new Error("Invoice not found.");
  if (inv.status === "cancelled") throw new Error("Cannot record payment on a cancelled invoice.");
  const newPaid = Number(inv.amount_paid) + amount;
  if (newPaid > Number(inv.amount_due) + 0.001)
    throw new Error(`Payment exceeds outstanding balance. Max allowed: ${(Number(inv.amount_due) - Number(inv.amount_paid)).toFixed(2)}`);
  const newStatus = newPaid >= Number(inv.amount_due) - 0.001 ? "paid"
                  : newPaid > 0 ? "partial" : "unpaid";
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      "INSERT INTO fee_payments(invoice_id,student_user_id,amount,payment_method,reference_number,paid_at,received_by,notes) VALUES(?,?,?,?,?,?,?,?)",
      [invoiceId, inv.student_user_id, amount, method, ref||null, paidAt, receiverId, notes||null]
    );
    await conn.query(
      "UPDATE student_invoices SET amount_paid=?, status=?, updated_at=NOW() WHERE id=?",
      [newPaid, newStatus, invoiceId]
    );
    await conn.commit();
    // notify parent
    const [parents] = await conn.query("SELECT parent_user_id FROM parent_student WHERE student_user_id=?", [inv.student_user_id]);
    for (const p of parents) {
      await conn.query(
        "INSERT INTO user_notifications(user_id,title,message,notification_type,related_id) VALUES(?,?,?,?,?)",
        [p.parent_user_id, "Payment received", `Payment of ${amount} received. Invoice status: ${newStatus}.`, "fee", invoiceId]
      );
    }
  } catch(e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}

// ─── ADMIN: fee summary stats ─────────────────────────────────────────────────

async function feeStats() {
  const [[totals]] = await db.query(
    `SELECT
       COUNT(*) total_invoices,
       SUM(amount_due)  total_billed,
       SUM(amount_paid) total_collected,
       SUM(amount_due - amount_paid) total_outstanding,
       SUM(CASE WHEN status='paid'    THEN 1 ELSE 0 END) paid_count,
       SUM(CASE WHEN status='partial' THEN 1 ELSE 0 END) partial_count,
       SUM(CASE WHEN status='unpaid'  THEN 1 ELSE 0 END) unpaid_count
     FROM student_invoices WHERE status != 'cancelled'`
  );
  return totals;
}

// ─── STUDENT: my fees ─────────────────────────────────────────────────────────

async function studentFees(studentId) {
  const [invoices] = await db.query(
    `SELECT si.id, si.invoice_number, si.amount_due, si.amount_paid,
            si.due_date, si.status, si.created_at,
            fs.name fee_name, fs.term, fs.academic_year
     FROM student_invoices si
     JOIN fee_structures fs ON fs.id = si.fee_structure_id
     WHERE si.student_user_id = ?
     ORDER BY si.due_date DESC`,
    [studentId]
  );
  const [payments] = await db.query(
    `SELECT fp.amount, fp.payment_method, fp.paid_at, fp.reference_number,
            si.invoice_number
     FROM fee_payments fp
     JOIN student_invoices si ON si.id = fp.invoice_id
     WHERE fp.student_user_id = ?
     ORDER BY fp.paid_at DESC LIMIT 30`,
    [studentId]
  );
  const outstanding = invoices.reduce((s,i) => s + (Number(i.amount_due) - Number(i.amount_paid)), 0);
  const totalBilled = invoices.reduce((s,i) => s + Number(i.amount_due), 0);
  const totalPaid   = invoices.reduce((s,i) => s + Number(i.amount_paid), 0);
  return { invoices, payments, outstanding, totalBilled, totalPaid };
}

// ─── PARENT: children fees ────────────────────────────────────────────────────

async function parentFees(parentId) {
  const [children] = await db.query(
    `SELECT u.id, u.full_name, sp.admission_number, sc.class_name
     FROM parent_student ps
     JOIN users u ON u.id = ps.student_user_id
     JOIN student_profiles sp ON sp.user_id = u.id
     LEFT JOIN school_classes sc ON sc.id = sp.class_id
     WHERE ps.parent_user_id = ? AND u.status='active'`,
    [parentId]
  );
  const result = [];
  for (const child of children) {
    const [invoices] = await db.query(
      `SELECT si.invoice_number, si.amount_due, si.amount_paid,
              si.due_date, si.status, fs.name fee_name
       FROM student_invoices si
       JOIN fee_structures fs ON fs.id = si.fee_structure_id
       WHERE si.student_user_id = ?
       ORDER BY si.due_date DESC LIMIT 20`,
      [child.id]
    );
    const outstanding = invoices.reduce((s,i) => s + (Number(i.amount_due) - Number(i.amount_paid)), 0);
    result.push({ ...child, invoices, outstanding });
  }
  return result;
}

module.exports = {
  listFeeStructures, createFeeStructure,
  listInvoices, createInvoice,
  recordPayment, feeStats,
  studentFees, parentFees,
};
