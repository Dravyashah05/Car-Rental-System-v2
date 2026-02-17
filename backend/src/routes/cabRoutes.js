const express = require("express");
const { listCabs, getCabById, searchCabs } = require("../controllers/cabController");

const router = express.Router();

router.get("/", listCabs);
router.get("/search", searchCabs);
router.get("/:id", getCabById);

module.exports = router;
