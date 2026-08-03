const express = require("express");
const router = express.Router();

const {
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  searchMovie,
  getMovieDetails,
  getMovieTrailer,
  getMovieCast,
  getMovieRecommendations,
  getTrendingMovies,
  getMoviesByGenre,
  getMoviesByLanguage
} = require("../controllers/movieController");

const movieEndpoints = [
  "/popular",
  "/top-rated",
  "/top_rated",
  "/now-playing",
  "/now_playing",
  "/upcoming",
  "/trending",
  "/search?query=avatar",
  "/:id",
  "/:id/trailer",
  "/:id/cast",
  "/:id/recommendations"
];

const validateMovieId = (req, res, next) => {
  if (/^\d+$/.test(req.params.id)) {
    return next();
  }

  return res.status(404).json({
    message: `Movie route not found: ${req.method} ${req.originalUrl}`,
    endpoints: movieEndpoints,
    status: 404
  });
};

router.get("/popular", getPopularMovies);
router.get("/top-rated", getTopRatedMovies);
router.get("/top_rated", getTopRatedMovies);
router.get("/now-playing", getNowPlayingMovies);
router.get("/now_playing", getNowPlayingMovies);
router.get("/upcoming", getUpcomingMovies);
router.get("/trending", getTrendingMovies);
router.get("/search", searchMovie);
router.get("/genre/:genreId", getMoviesByGenre);
router.get("/language/:languageCode", getMoviesByLanguage);
router.get("/:id/trailer", validateMovieId, getMovieTrailer);
router.get("/:id/cast", validateMovieId, getMovieCast);
router.get("/:id/recommendations", validateMovieId, getMovieRecommendations);
router.get("/:id", validateMovieId, getMovieDetails);

module.exports = router;
