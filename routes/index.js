const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const msgController = require("../controllers/msgController");
const Message = require("../models/message");

/* GET home page. */
router.get("/", function (req, res, next) {
  Message.find({})
    .populate("user")
    .exec((err, msgs) => {
      if (err) return next(err);
      res.render("index", { title: "Private Message-Board", msgs });
    });
});
router.get("/sign-up", userController.sign_up_get);
router.post("/sign-up", userController.sign_up_post);
router.post("/log-in", userController.log_in);
router.get("/log-out", userController.log_out);
router.get("/join", userController.join_get);
router.post("/join/:id", userController.join_post);

router.get("/create", msgController.msg_create_get);
router.post("/create/:id", msgController.msg_create_post);
router.get("/delete/:id", msgController.msg_delete);
module.exports = router;
