const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const asyncHandler = require("../middleware/asyncHandler");

const createVehicle = asyncHandler(async (req, res) => {
  const { driverId, make, model, plateNumber, color, seats, imageUrl } = req.body;
  if (!driverId || !make || !model || !plateNumber || !color) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const driver = await Driver.findById(driverId);
  if (!driver) {
    return res.status(404).json({ message: "Driver not found" });
  }
  const vehicle = await Vehicle.create({
    driver: driverId,
    make,
    model,
    plateNumber,
    color,
    seats,
    imageUrl
  });
  res.status(201).json(vehicle);
});

const listVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find().populate({
    path: "driver",
    populate: { path: "user", select: "name email" }
  });
  res.json(vehicles);
});

const getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate({
    path: "driver",
    populate: { path: "user", select: "name email" }
  });
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }
  res.json(vehicle);
});

const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }
  res.json(vehicle);
});

const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }
  await vehicle.deleteOne();
  res.status(204).send();
});

module.exports = {
  createVehicle,
  listVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle
};
