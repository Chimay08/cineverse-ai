const express = require("express");
const {
  getMovieReviews,
  createMovieReview,
  updateMovieReview,
  deleteMovieReview,
  likeMovieReview
} = require("../controllers/reviewController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:movieId", getMovieReviews);
router.post("/", authenticateToken, createMovieReview);
router.put("/:id", authenticateToken, updateMovieReview);
router.delete("/:id", authenticateToken, deleteMovieReview);
router.post("/:id/like", likeMovieReview);

module.exports = router;
