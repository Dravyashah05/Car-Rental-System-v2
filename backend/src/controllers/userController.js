const User = require("../models/User");

const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, avatar, age, gender } = req.body;

    const updates = {};
    if (typeof name === "string") updates.name = name.trim();
    if (typeof email === "string") updates.email = email.trim().toLowerCase();
    if (typeof phone === "string") updates.phone = phone.trim();
    if (typeof avatar === "string") updates.avatar = avatar.trim();
    if (typeof age === "number") updates.age = age;
    if (age === null) updates.age = undefined;
    if (typeof gender === "string" || gender === null) updates.gender = gender || undefined;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["user", "driver", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, updateUser, updateUserRole };
