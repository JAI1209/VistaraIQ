const jwt = require("jsonwebtoken");
const User = require("../models/user");

const ACCESS_SECRET = process.env.JWT_SECRET || "";

async function authMiddleware(req, res, next) {
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findById(decoded.sub).select("_id name email role isVerified");

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = { authMiddleware };
