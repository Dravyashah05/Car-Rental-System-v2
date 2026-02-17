const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    rider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
    cab: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    pickup: {
      address: { type: String, required: true },
      lat: { type: Number },
      lng: { type: Number }
    },
    dropoff: {
      address: { type: String, required: true },
      lat: { type: Number },
      lng: { type: Number }
    },
    distanceKm: { type: Number, min: 0 },
    fare: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ["requested", "assigned", "accepted", "enroute", "completed", "cancelled"],
      default: "requested"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", rideSchema);
