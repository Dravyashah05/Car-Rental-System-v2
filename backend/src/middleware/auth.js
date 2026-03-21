const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const authorize = (...roles) => (req, res, next) => {
  const role = req.user?.role || "user";
  const allowed = new Set();

  roles.forEach((allowedRole) => {
    if (allowedRole === "owner") {
      allowed.add("owner");
      allowed.add("driver");
    } else if (allowedRole === "driver") {
      allowed.add("driver");
      allowed.add("owner");
    } else {
      allowed.add(allowedRole);
    }
  });

  if (!req.user || !allowed.has(role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

module.exports = { authenticate, authorize };
