const express = require("express");
const {
  createDriver,
  createDriverWithUser,
  listDrivers,
  getDriver,
  updateDriver,
  deleteDriver
} = require("../controllers/driverController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.post("/", createDriver);
router.post("/register", createDriverWithUser);
router.get("/", listDrivers);
router.get("/:id", getDriver);
router.patch("/:id", updateDriver);
router.delete("/:id", deleteDriver);

module.exports = router;
