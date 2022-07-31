const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/", (req, res) => {
  return res.render("login");
});
router.post("/", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByCredentials(email, password);
  if (!user) {
    return res
      .status(404)
      .json({ status: "404", error: "Invalid credentials" });
  }
  req.session.user = user;
  return res.render("chatbox", { user });
});

module.exports = router;
