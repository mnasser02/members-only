require("dotenv").config();
const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const Message = require("../models/message");
const emailValidator = require("deep-email-validator");
async function isEmailValid(email) {
  return emailValidator.validate(email);
}

exports.sign_up_get = (req, res) => {
  res.render("sign_up_form", { title: "Sign Up" });
};
exports.sign_up_post = [
  body("first_name", "First name must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("last_name", "Family name must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("password", "Password must be specified").isLength({ min: 1 }),
  body("password", "Password must contain at least 8 characters").isLength({
    min: 8,
  }),
  body("confirm-pass", "Passwords didn't match").custom(
    (value, { req }) => value === req.body.password
  ),
  body("email", "Enter a valid email address").custom(
    async (email, { req }) => {
      const { valid, reason, validators } = await isEmailValid(email);
      if (!valid) throw new Error();
    }
  ),
  body("email", "An account with the email provided already exists").custom(
    async (email) => {
      const notUnique = await User.findOne({ email: email });
      if (notUnique) throw new Error();
    }
  ),
  (req, res, next) => {
    let errors = validationResult(req);
    let user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      password: req.body.password,
      email: req.body.email,
      _id: req.body._id,
      admin: req.body.admin_pass === process.env.ADMIN_PASS,
    });
    if (!errors.isEmpty()) {
      res.render("sign_up_form", {
        title: "Sign Up",
        user,
        errors: errors.array(),
      });
    } else {
      bcrypt.hash(user.password, 10, (err, hashedPassword) => {
        if (err) return next(err);
        user.password = hashedPassword;
        user.save((err) => {
          if (err) return next(err);
          res.redirect("/");
        });
      });
    }
  },
];

exports.log_in = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/",
});
exports.log_out = (req, res) => {
  req.app.locals.member = false;
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

exports.join_get = (req, res) => {
  Message.find({})
    .populate("user")
    .exec((err, msgs) => {
      if (err) return next(err);
      res.render("index", { title: "Private Message-Board", msgs, join: true });
    });
};
exports.join_post = [
  body("join_pass").equals(process.env.JOIN_PASS),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.redirect("/");
    else {
      req.app.locals.member = true;
      res.redirect("/");
    }
  },
];
