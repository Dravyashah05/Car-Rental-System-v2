const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

const getMasterAdminConfig = () => ({
  name: process.env.MASTER_ADMIN_NAME || "Master Admin",
  email: (process.env.MASTER_ADMIN_EMAIL || "admin@cityride.com").toLowerCase().trim(),
  password: process.env.MASTER_ADMIN_PASSWORD || "Admin@12345"
});

const normalizeRole = (role) => (role === "driver" ? "owner" : role);

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  age: user.age,
  gender: user.gender,
  role: normalizeRole(user.role)
});

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, avatar, age, gender, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }
  const normalizedRole = role === "driver" ? "owner" : role;
  const user = await User.create({
    name,
    email,
    phone,
    password,
    avatar,
    age,
    gender,
    role: normalizedRole
  });
  const token = signToken(user._id);
  res.status(201).json({
    user: toPublicUser(user),
    token
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail });

  // Bootstrap access: allow a master credential login only when no admin exists yet.
  if (!user) {
    const adminCount = await User.countDocuments({ role: "admin" });
    const master = getMasterAdminConfig();
    if (adminCount === 0 && normalizedEmail === master.email && String(password) === master.password) {
      user = await User.create({
        name: master.name,
        email: master.email,
        password: master.password,
        role: "admin"
      });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = signToken(user._id);
  res.json({
    user: toPublicUser(user),
    token
  });
});

const getProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json({ user: toPublicUser(req.user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name, email, phone, avatar, age, gender } = req.body;

  if (name !== undefined && !String(name).trim()) {
    return res.status(400).json({ message: "Name cannot be empty" });
  }
  if (email !== undefined && !String(email).trim()) {
    return res.status(400).json({ message: "Email cannot be empty" });
  }

  if (email) {
    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }
  }

  const updates = {};
  if (name !== undefined) updates.name = String(name).trim();
  if (email !== undefined) updates.email = String(email).toLowerCase().trim();
  if (phone !== undefined) updates.phone = String(phone).trim();
  if (avatar !== undefined) updates.avatar = avatar;
  if (age !== undefined) updates.age = age;
  if (gender !== undefined) updates.gender = gender;

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user: toPublicUser(user) });
});

const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (String(newPassword).length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await user.comparePassword(String(currentPassword));
  if (!isMatch) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }

  user.password = String(newPassword);
  await user.save();

  res.json({ message: "Password updated successfully" });
});

module.exports = { register, login, getProfile, updateProfile, changePassword };
