const express = require("express");
const {
  createVehicle,
  listVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle
} = require("../controllers/vehicleController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.post("/", createVehicle);
router.get("/", listVehicles);
router.get("/:id", getVehicle);
router.patch("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

module.exports = router;
