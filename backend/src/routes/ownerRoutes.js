const express = require("express");
const {
  createDriver,
  createDriverWithUser,
  listDrivers,
  getCurrentDriver,
  getDriver,
  updateDriver,
  deleteDriver
} = require("../controllers/driverController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get("/me", authorize("owner", "admin"), getCurrentDriver);

router.use(authorize("admin"));

router.post("/", createDriver);
router.post("/register", createDriverWithUser);
router.get("/", listDrivers);
router.get("/:id", getDriver);
router.patch("/:id", updateDriver);
router.delete("/:id", deleteDriver);

module.exports = router;
