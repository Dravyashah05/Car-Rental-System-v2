const express = require("express");
const { createSupportMessage, listSupportMessages } = require("../controllers/supportController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("user", "owner", "driver", "admin"), createSupportMessage);
router.get("/", authorize("admin"), listSupportMessages);

module.exports = router;
