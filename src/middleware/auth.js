const { verifyAccessToken } = require("../utils/tokens");

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!token) return res.status(401).json({ error: "Access token required" });
  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch (_err) {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  return next();
}

module.exports = { requireAuth, requireAdmin };
