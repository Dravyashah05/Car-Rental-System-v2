const Vehicle = require("../models/Vehicle");
const asyncHandler = require("../middleware/asyncHandler");

const toCab = (vehicle) => {
  const seats = vehicle.seats || 4;
  const pricePerKm = seats >= 6 ? 18 : seats >= 4 ? 12 : 9;
  const pricePerHour = seats >= 6 ? 420 : seats >= 4 ? 280 : 200;
  const year = new Date().getFullYear();

  return {
    id: vehicle._id.toString(),
    make: vehicle.make,
    model: vehicle.model,
    year,
    licensePlate: vehicle.plateNumber,
    pricePerKm,
    pricePerHour,
    image: vehicle.imageUrl || "",
    rating: 4.6,
    reviews: 120,
    available: true,
    seats,
    fuelType: "Petrol"
  };
};

const listCabs = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find().lean();
  res.json(vehicles.map(toCab));
});

const getCabById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).lean();
  if (!vehicle) {
    return res.status(404).json({ message: "Cab not found" });
  }
  res.json(toCab(vehicle));
});

const searchCabs = asyncHandler(async (req, res) => {
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;
  const minSeats = req.query.seats ? Number(req.query.seats) : undefined;

  const vehicles = await Vehicle.find().lean();
  const cabs = vehicles.map(toCab).filter((cab) => {
    if (Number.isFinite(maxPrice) && cab.pricePerKm > maxPrice) return false;
    if (Number.isFinite(minRating) && cab.rating < minRating) return false;
    if (Number.isFinite(minSeats) && cab.seats < minSeats) return false;
    return true;
  });

  res.json(cabs);
});

module.exports = { listCabs, getCabById, searchCabs };
