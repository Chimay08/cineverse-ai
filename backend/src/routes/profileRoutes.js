const express = require("express");

const router = express.Router();

const {
  getTasteProfile,
  getDirectorsProfile,
  getActorsProfile,
  getCinemaProfile
} = require("../controllers/profileController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

router.get(
    "/taste",
    authenticateToken,
    getTasteProfile
);
router.get(
  "/directors",
  authenticateToken,
  getDirectorsProfile
);
router.get(
  "/actors",
  authenticateToken,
  getActorsProfile
);
router.get(
  "/countries",
  authenticateToken,
  getCinemaProfile
);

module.exports = router;
