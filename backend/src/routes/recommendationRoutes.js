const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");

const {
  getPersonalizedRecommendations
} = require("../controllers/recommendationController");

router.get(
  "/personalized",
  authenticateToken,
  getPersonalizedRecommendations
);

module.exports = router;