const jwt = require("jsonwebtoken");

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
};
