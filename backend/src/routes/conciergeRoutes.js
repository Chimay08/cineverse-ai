const express = require("express");
const { getHomeRecommendations } = require("../controllers/conciergeController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/home", authenticateToken, getHomeRecommendations);

module.exports = router;
