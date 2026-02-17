const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    plateNumber: { type: String, required: true, unique: true },
    color: { type: String, required: true },
    seats: { type: Number, default: 4 },
    imageUrl: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
