const express = require("express");
const {
  register,
  login,
  getProfile,
  syncClerkUser,
  updateProfile,
  changePassword
} = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/signup", register);
router.post("/login", login);
router.get("/profile", authenticate, getProfile);
router.get("/sync", authenticate, syncClerkUser);
router.put("/profile", authenticate, updateProfile);
router.patch("/password", authenticate, changePassword);

module.exports = router;
