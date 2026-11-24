const svc = require("./chat.service");

async function page(req, res, next) {
  try {
    const me = req.session.user;
    const contacts = await svc.contacts(me.id, me.role);
    const otherId = Number(req.query.with) || (contacts[0] && contacts[0].id) || null;
    let messages = [];
    if (otherId) {
      await svc.markRead(me.id, otherId);
      messages = await svc.messages(me.id, otherId);
    }
    res.render("chat/index", {
      title: "Messages",
      user: me,
      contacts,
      otherId,
      messages,
      notice: req.query.notice || null,
      error: null
    });
  } catch (e) { next(e); }
}

async function send(req, res, next) {
  try {
    await svc.send(req.session.user.id, req.body);
    const other = Number(req.body.receiver_id);
    res.redirect(`/dashboard/${req.session.user.role}/chat?with=${other}&notice=${encodeURIComponent("Message sent.")}`);
  } catch (e) {
    const other = Number(req.body.receiver_id);
    res.redirect(`/dashboard/${req.session.user.role}/chat?with=${other}&notice=${encodeURIComponent(e.message)}`);
  }
}

module.exports = { page, send };