const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signAccessToken } = require("../utils/tokens");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (password.length < 6) return res.status(400).json({ error: "Password must contain at least 6 characters" });
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email: normalizedEmail, passwordHash });
    return res.status(201).json({ id: user._id, email: user.email, role: user.role });
  } catch (err) { return next(err); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    return res.json({ accessToken: signAccessToken(user) });
  } catch (err) { return next(err); }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ id: user._id, email: user.email, role: user.role });
  } catch (err) { return next(err); }
});

module.exports = router;
