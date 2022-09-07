const Message = require("../models/message");
const User = require("../models/user");

exports.msg_create_get = (req, res) => {
  res.render("msg_create", { title: "Create message" });
};
exports.msg_create_post = (req, res, next) => {
  const msg = new Message({
    title: req.body.title,
    content: req.body.content,
    user: req.params.id,
  });
  msg.save((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};
exports.msg_delete = (req, res) => {
  Message.findByIdAndRemove(req.params.id).exec((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};
