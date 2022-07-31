const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/", (req, res) => {
  return res.render("chatbox");
});

module.exports = router;
