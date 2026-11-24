const svc = require("./book.service");

async function page(req, res, next) {
  try {
    const books = await svc.studentBooks(req.session.user.id);
    res.render("books/student", {
      title: "Books & materials",
      user: req.session.user,
      books,
      notice: req.query.notice || null
    });
  } catch (e) { next(e); }
}

module.exports = { page };