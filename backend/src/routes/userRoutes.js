const express = require("express");
const { listUsers, updateUser, updateUserRole } = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.get("/", listUsers);
router.patch("/:id", updateUser);
router.patch("/:id/role", updateUserRole);

module.exports = router;
