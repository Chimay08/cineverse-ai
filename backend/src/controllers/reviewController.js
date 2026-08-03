const {
  getReviewsByMovie,
  addReview,
  updateReview,
  deleteReview,
  likeReview
} = require("../services/reviewService");

const getMovieReviews = async (req, res) => {
  try {
    const { movieId } = req.params;
    if (!movieId) {
      return res.status(400).json({ message: "Movie ID is required" });
    }

    const data = await getReviewsByMovie(movieId);
    return res.json(data);
  } catch (error) {
    console.error("Get reviews failed:", error);
    return res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
  }
};

const createMovieReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    const username = req.user?.username || req.user?.name || "Cinephile";
    const { movieId, rating, title, review, spoiler } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Please sign in to write a review." });
    }

    if (!movieId) {
      return res.status(400).json({ message: "Movie ID is required" });
    }

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5 stars" });
    }

    if (!review || !String(review).trim()) {
      return res.status(400).json({ message: "Review content is required" });
    }

    const newReview = await addReview({
      userId,
      username,
      movieId,
      rating: Number(rating),
      title: title?.trim() || "",
      review: review.trim(),
      spoiler: Boolean(spoiler)
    });

    return res.status(201).json(newReview);
  } catch (error) {
    console.error("Create review failed:", error);
    return res.status(500).json({ message: "Failed to create review", error: error.message });
  }
};

const updateMovieReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { rating, title, review, spoiler } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Authenticated user required" });
    }

    const updated = await updateReview({
      id,
      userId,
      rating,
      title,
      review,
      spoiler
    });

    if (!updated) {
      return res.status(404).json({ message: "Review not found or unauthorized" });
    }

    return res.json(updated);
  } catch (error) {
    console.error("Update review failed:", error);
    return res.status(500).json({ message: "Failed to update review", error: error.message });
  }
};

const deleteMovieReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Authenticated user required" });
    }

    const deleted = await deleteReview({ id, userId });
    if (!deleted) {
      return res.status(404).json({ message: "Review not found or unauthorized" });
    }

    return res.json({ message: "Review deleted successfully", review: deleted });
  } catch (error) {
    console.error("Delete review failed:", error);
    return res.status(500).json({ message: "Failed to delete review", error: error.message });
  }
};

const likeMovieReview = async (req, res) => {
  try {
    const { id } = req.params;
    const liked = await likeReview(id);

    if (!liked) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.json(liked);
  } catch (error) {
    console.error("Like review failed:", error);
    return res.status(500).json({ message: "Failed to like review", error: error.message });
  }
};

module.exports = {
  getMovieReviews,
  createMovieReview,
  updateMovieReview,
  deleteMovieReview,
  likeMovieReview
};
