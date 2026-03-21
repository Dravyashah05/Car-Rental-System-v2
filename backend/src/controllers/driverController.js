const Driver = require("../models/Driver");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

const normalizeDriverUserRole = (driverDoc) => {
  if (!driverDoc) return driverDoc;
  const plain = driverDoc.toObject ? driverDoc.toObject() : driverDoc;
  if (plain.user && plain.user.role === "driver") {
    plain.user.role = "owner";
  }
  return plain;
};

const createDriver = asyncHandler(async (req, res) => {
  const { userId, licenseNumber, isActive } = req.body;
  if (!userId || !licenseNumber) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  user.role = "owner";
  await user.save();
  const driver = await Driver.create({ user: userId, licenseNumber, isActive });
  res.status(201).json(normalizeDriverUserRole(driver));
});

const createDriverWithUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    licenseNumber,
    isActive,
    phone,
    avatar,
    age,
    gender
  } = req.body;
  if (!name || !email || !password || !licenseNumber) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    avatar,
    age,
    gender,
    role: "owner"
  });

  const driver = await Driver.create({
    user: user._id,
    licenseNumber,
    isActive
  });

  const populated = await Driver.findById(driver._id).populate(
    "user",
    "name email role phone avatar age gender createdAt"
  );
  res.status(201).json(normalizeDriverUserRole(populated));
});

const listDrivers = asyncHandler(async (req, res) => {
  const drivers = await Driver.find().populate(
    "user",
    "name email role phone avatar age gender createdAt"
  );
  res.json(drivers.map((driver) => normalizeDriverUserRole(driver)));
});

const getCurrentDriver = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const driver = await Driver.findOne({ user: req.user._id }).populate(
    "user",
    "name email role phone avatar age gender createdAt"
  );
  if (!driver) {
    return res.status(404).json({ message: "Owner not found" });
  }
  res.json(normalizeDriverUserRole(driver));
});

const getDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id).populate(
    "user",
    "name email role phone avatar age gender createdAt"
  );
  if (!driver) {
    return res.status(404).json({ message: "Owner not found" });
  }
  res.json(normalizeDriverUserRole(driver));
});

const updateDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!driver) {
    return res.status(404).json({ message: "Owner not found" });
  }
  res.json(normalizeDriverUserRole(driver));
});

const deleteDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) {
    return res.status(404).json({ message: "Owner not found" });
  }
  await driver.deleteOne();
  res.status(204).send();
});

module.exports = {
  createDriver,
  createDriverWithUser,
  listDrivers,
  getCurrentDriver,
  getDriver,
  updateDriver,
  deleteDriver
};
