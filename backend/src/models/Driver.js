const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    licenseNumber: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, min: 1, max: 5, default: 5 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);
