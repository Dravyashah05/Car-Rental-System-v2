const Ride = require("../models/Ride");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");
const asyncHandler = require("../middleware/asyncHandler");
const { sendBookingConfirmation } = require("../services/mailService");

const createRide = asyncHandler(async (req, res) => {
  const { cabId, pickup, dropoff, distanceKm, fare } = req.body;
  if (!pickup?.address || !dropoff?.address) {
    return res.status(400).json({ message: "Pickup and dropoff are required" });
  }

  let cab = undefined;
  if (cabId) {
    cab = await Vehicle.findById(cabId);
    if (!cab) {
      return res.status(404).json({ message: "Cab not found" });
    }
  }

  const ride = await Ride.create({
    rider: req.user._id,
    cab: cabId || undefined,
    pickup,
    dropoff,
    distanceKm,
    fare
  });
  res.status(201).json(ride);
});

const listRides = asyncHandler(async (req, res) => {
  const { status, riderId, driverId, ownerId } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (riderId) filter.rider = riderId;
  if (driverId) filter.driver = driverId;
  if (ownerId) filter.driver = ownerId;
  const rides = await Ride.find(filter)
    .populate("rider", "name email")
    .populate("cab", "make model plateNumber seats imageUrl")
    .populate({
      path: "driver",
      populate: { path: "user", select: "name email" }
    });
  res.json(rides);
});

const getRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findById(req.params.id)
    .populate("rider", "name email")
    .populate("cab", "make model plateNumber seats imageUrl")
    .populate({
      path: "driver",
      populate: { path: "user", select: "name email" }
    });
  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  const isAdmin = req.user.role === "admin";
  const isRider = ride.rider?._id?.toString() === req.user._id.toString();
  const isDriverUser =
    (req.user.role === "driver" || req.user.role === "owner") &&
    ride.driver &&
    ride.driver.user &&
    ride.driver.user._id.toString() === req.user._id.toString();

  if (!isAdmin && !isRider && !isDriverUser) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json(ride);
});

const assignDriver = asyncHandler(async (req, res) => {
  const { driverId, ownerId } = req.body;
  const resolvedOwnerId = ownerId || driverId;
  if (!resolvedOwnerId) {
    return res.status(400).json({ message: "Owner is required" });
  }
  const ride = await Ride.findById(req.params.id);
  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }
  const driver = await Driver.findById(resolvedOwnerId);
  if (!driver) {
    return res.status(404).json({ message: "Owner not found" });
  }
  ride.driver = resolvedOwnerId;
  ride.status = "assigned";
  await ride.save();
  res.json(ride);
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["accepted", "enroute", "completed", "cancelled"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const ride = await Ride.findById(req.params.id).populate("rider", "name email");
  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }
  ride.status = status;
  await ride.save();

  if (status === "accepted" && ride.rider?.email) {
    sendBookingConfirmation(ride.rider.email, ride).catch(err => {
      console.error("Failed to send booking confirmation email:", err);
    });
  }

  res.json(ride);
});

const deleteRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findByIdAndDelete(req.params.id);
  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }
  res.json({ message: "Ride deleted successfully" });
});

module.exports = {
  createRide,
  listRides,
  getRide,
  assignDriver,
  updateStatus,
  deleteRide
};
