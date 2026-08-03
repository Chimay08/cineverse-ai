import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ThumbsUp, X, AlertTriangle } from "./icons";
import { useAuth } from "../context/AuthContext";
import {
  getMovieReviews,
  createMovieReview,
  likeMovieReview,
  deleteMovieReview
} from "../lib/api";

const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function WriteReviewModal({ isOpen, onClose, movieId, movieTitle, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!review.trim()) {
      setError("Please write a few words for your review.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createMovieReview({
        movieId,
        rating,
        title,
        review,
        spoiler
      });
      setSubmitting(false);
      onReviewSubmitted();
      onClose();
    } catch (err) {
      setSubmitting(false);
      setError(err.response?.data?.message || "Failed to submit review. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-noir-950/80 backdrop-blur-md"
        />

        {/* Modal content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-noir-900/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          <button
            onClick={onClose}
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
          >
            <X size={16} />
          </button>

          <h3 className="display text-2xl text-white">
            Review {movieTitle || "Movie"}
          </h3>
          <p className="mt-1 text-xs text-white/50">
            Share your honest thoughts with the CineVerse community.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Rating Stars */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/60">
                Your Rating
              </label>
              <div className="mt-2 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      size={24}
                      className={
                        (hoverRating || rating) >= star
                          ? "fill-gold text-gold"
                          : "text-white/20"
                      }
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-bold text-gold">
                  {hoverRating || rating} / 5
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/60">
                Review Headline (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. A masterpiece of modern cinema"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50"
              />
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/60">
                Your Review
              </label>
              <textarea
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="What did you think of the story, acting, direction, or music?"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50"
              />
            </div>

            {/* Spoiler Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="spoiler-check"
                checked={spoiler}
                onChange={(e) => setSpoiler(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/10 text-accent focus:ring-accent"
              />
              <label htmlFor="spoiler-check" className="text-xs text-white/70 cursor-pointer">
                This review contains plot spoilers
              </label>
            </div>

            {error && (
              <p className="text-xs text-red-400 font-medium">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-5 py-2.5 text-xs font-semibold text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-accent px-6 py-2.5 text-xs font-semibold"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ReviewCard({ reviewItem, currentUser, onLike, onDelete }) {
  const [showSpoiler, setShowSpoiler] = useState(!reviewItem.spoiler);
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reviewItem.likes || 0);

  const isOwner = currentUser && Number(currentUser.id) === Number(reviewItem.user_id);
  const text = reviewItem.review || "";
  const isLong = text.length > 220;

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
      onLike(reviewItem.id);
    }
  };

  return (
    <div className="rounded-3xl glass-strong p-6 border border-white/10 shadow-glass transition-all hover:border-white/20">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-alt text-sm font-bold text-white shadow-md">
            {initialsOf(reviewItem.username || "Cinephile")}
          </span>
          <div>
            <h4 className="text-sm font-semibold text-white/95">
              {reviewItem.username || "Cinephile"}
            </h4>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/40">
              <span>{new Date(reviewItem.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              {reviewItem.spoiler && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/30">
                  <AlertTriangle size={10} /> Spoiler
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-3 py-1">
          <Star size={13} className="fill-gold text-gold" />
          <span className="text-xs font-bold text-gold">
            {Number(reviewItem.rating).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Title */}
      {reviewItem.title && (
        <h5 className="mt-4 text-base font-semibold text-white">
          "{reviewItem.title}"
        </h5>
      )}

      {/* Content */}
      <div className="mt-3">
        {reviewItem.spoiler && !showSpoiler ? (
          <div className="rounded-2xl border border-white/10 bg-noir-950/60 p-4 text-center">
            <p className="text-xs text-white/60">This review contains spoilers.</p>
            <button
              onClick={() => setShowSpoiler(true)}
              className="mt-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold text-white hover:bg-white/20"
            >
              Reveal Spoiler
            </button>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-white/80">
            {expanded || !isLong ? text : `${text.slice(0, 220)}...`}
            {isLong && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="ml-2 text-xs font-semibold text-accent hover:underline"
              >
                {expanded ? "Show Less" : "Read More"}
              </button>
            )}
          </p>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-white/50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
            liked ? "bg-accent/20 text-accent font-semibold" : "hover:bg-white/10 hover:text-white"
          }`}
        >
          <ThumbsUp size={13} />
          <span>{likesCount} {likesCount === 1 ? "Like" : "Likes"}</span>
        </button>

        {isOwner && (
          <button
            onClick={() => onDelete(reviewItem.id)}
            className="text-xs text-red-400/70 hover:text-red-400 transition"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default function ReviewsSection({ movieId, movieTitle }) {
  const { isAuthed, user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    avgRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    topReviews: [],
    latestReviews: [],
    reviews: []
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("top"); // "top" | "latest"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);

  const fetchReviews = async () => {
    if (!movieId) return;
    setLoading(true);
    try {
      const res = await getMovieReviews(movieId);
      setData(res || {});
    } catch (err) {
      console.error("Fetch reviews error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [movieId]);

  const handleWriteClick = () => {
    if (!isAuthed) {
      setShowAuthWarning(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleLike = async (reviewId) => {
    await likeMovieReview(reviewId);
  };

  const handleDelete = async (reviewId) => {
    try {
      await deleteMovieReview(reviewId);
      fetchReviews();
    } catch (err) {
      console.error("Delete review error:", err);
    }
  };

  const reviewsList = tab === "top" ? (data.topReviews?.length ? data.topReviews : data.reviews) : data.latestReviews;

  return (
    <section className="mt-14 w-full">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow text-accent/90">Community Feedback</span>
          <h2 className="display mt-1 text-3xl text-white">User Reviews</h2>
        </div>

        <button
          onClick={handleWriteClick}
          className="btn-accent px-6 py-3 text-xs font-bold uppercase tracking-wider self-start sm:self-auto"
        >
          Write Review
        </button>
      </div>

      {/* Auth Warning Toast / Banner */}
      {showAuthWarning && (
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-accent/40 bg-accent/15 p-4 text-sm text-white">
          <span>Please sign in to write a review.</span>
          <button
            onClick={() => navigate("/signin")}
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-white hover:bg-accent-alt"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Rating Summary Card */}
      <div className="mt-6 grid gap-6 rounded-3xl glass-strong p-6 sm:p-8 lg:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center justify-center border-b border-white/10 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
          <span className="display text-6xl text-white font-extrabold">
            {data.avgRating > 0 ? data.avgRating.toFixed(1) : "N/A"}
          </span>
          <div className="mt-2 flex items-center gap-1 text-gold">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={
                  star <= Math.round(data.avgRating || 0)
                    ? "fill-gold text-gold"
                    : "text-white/20"
                }
              />
            ))}
          </div>
          <span className="mt-2 text-xs text-white/50">
            {data.totalReviews} {data.totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = data.ratingDistribution?.[star] || 0;
            const pct = data.totalReviews > 0 ? Math.round((count / data.totalReviews) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-8 text-right font-medium text-white/70">{star} ★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-gold transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-white/40">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs / Filters */}
      <div className="mt-8 flex items-center gap-3 border-b border-white/10 pb-3">
        <button
          onClick={() => setTab("top")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
            tab === "top"
              ? "bg-white/10 text-white border border-white/20"
              : "text-white/50 hover:text-white"
          }`}
        >
          Top Reviews
        </button>
        <button
          onClick={() => setTab("latest")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
            tab === "latest"
              ? "bg-white/10 text-white border border-white/20"
              : "text-white/50 hover:text-white"
          }`}
        >
          Latest Reviews
        </button>
      </div>

      {/* Reviews List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-xs text-white/40">Loading reviews...</p>
        ) : !reviewsList || reviewsList.length === 0 ? (
          <div className="rounded-3xl glass-strong p-8 text-center">
            <p className="text-sm text-white/50">
              No reviews yet for this movie. Be the first to share your thoughts!
            </p>
            <button
              onClick={handleWriteClick}
              className="btn-accent mt-4 px-6 py-2.5 text-xs font-bold"
            >
              Write First Review
            </button>
          </div>
        ) : (
          reviewsList.map((item) => (
            <ReviewCard
              key={item.id}
              reviewItem={item}
              currentUser={user}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Modal */}
      <WriteReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        movieId={movieId}
        movieTitle={movieTitle}
        onReviewSubmitted={fetchReviews}
      />
    </section>
  );
}
