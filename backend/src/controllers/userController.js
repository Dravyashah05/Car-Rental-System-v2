const User = require("../models/User");

const normalizeRole = (role) => (role === "driver" ? "owner" : role);

const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    const normalized = users.map((user) => ({
      ...user.toObject(),
      role: normalizeRole(user.role)
    }));
    res.json(normalized);
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

    res.json({
      ...user.toObject(),
      role: normalizeRole(user.role)
    });
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["user", "owner", "admin", "driver"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const resolvedRole = role === "driver" ? "owner" : role;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: resolvedRole },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      ...user.toObject(),
      role: normalizeRole(user.role)
    });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, updateUser, updateUserRole, deleteUser };
