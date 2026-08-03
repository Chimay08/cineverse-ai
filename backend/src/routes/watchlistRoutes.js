const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const {
  addMovie,
  getWatchlist,
  removeMovie
} = require("../controllers/watchlistController");

// support both /add and / (POST) for adding
router.post("/add", authenticateToken, addMovie);
router.post("/", authenticateToken, addMovie);

// support both /my and / (GET) for retrieving
router.get("/my", authenticateToken, getWatchlist);
router.get("/", authenticateToken, getWatchlist);

// support both /remove/:movieId and /:movieId (DELETE) for deleting
router.delete("/remove/:movieId", authenticateToken, removeMovie);
router.delete("/:movieId", authenticateToken, removeMovie);

module.exports = router;

