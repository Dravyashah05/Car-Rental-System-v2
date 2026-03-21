const express = require("express");
const {
  createRide,
  listRides,
  getRide,
  assignDriver,
  updateStatus,
  deleteRide
} = require("../controllers/rideController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("user", "admin"), createRide);

router.get("/", (req, res, next) => {
  if (req.user.role !== "admin") {
    req.query.riderId = req.user._id.toString();
  }
  next();
}, listRides);

router.get("/:id", getRide);

router.patch("/:id/assign", authorize("admin"), assignDriver);
router.patch("/:id/status", authorize("owner", "driver", "admin"), updateStatus);
router.delete("/:id", authorize("admin"), deleteRide);

module.exports = router;
