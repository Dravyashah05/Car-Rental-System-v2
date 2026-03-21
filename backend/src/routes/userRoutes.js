const express = require("express");
const { listUsers, updateUser, updateUserRole, deleteUser } = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.get("/", listUsers);
router.patch("/:id", updateUser);
router.patch("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

module.exports = router;
