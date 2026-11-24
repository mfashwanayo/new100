const router = require("express").Router();
const c = require("./fees.controller");
const { verifyCsrf } = require("../../middleware/csrf.middleware");

router.get("/fees",                      c.adminFeesPage);
router.post("/fees/structures",          verifyCsrf, c.createFeeStructure);
router.post("/fees/invoices",            verifyCsrf, c.createInvoice);
router.post("/fees/payments",            verifyCsrf, c.recordPayment);

module.exports = router;
