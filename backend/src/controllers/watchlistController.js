const {
  getWatchlistByUser,
  addMovieToWatchlist,
  removeMovieFromWatchlist
} = require("../services/watchlistService");

const toPositiveInteger = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const handleWatchlistError = (res, error, fallbackMessage) => {
  const status = error.status || 500;

  console.error("Watchlist request failed:", {
    status,
    message: error.message
  });

  return res.status(status).json({
    message: status === 500 ? fallbackMessage : error.message,
    status
  });
};

const getWatchlist = async (req, res) => {
  try {
    const movies = await getWatchlistByUser(req.user.id);

    return res.json({
      movies
    });
  } catch (error) {
    return handleWatchlistError(
      res,
      error,
      "Unable to load watchlist. Please try again."
    );
  }
};

const addMovie = async (req, res) => {
  try {
    const movieId = toPositiveInteger(req.body.movieId || req.body.movie_id);
    const movieTitle = req.body.movieTitle || req.body.movie_title || req.body.title;
    const poster = req.body.poster || req.body.posterPath || req.body.poster_path;

    if (!movieId || !movieTitle) {
      return res.status(400).json({
        message: "Movie id and title are required.",
        status: 400
      });
    }

    const movie = await addMovieToWatchlist({
      userId: req.user.id,
      movieId,
      movieTitle: String(movieTitle),
      poster: poster ? String(poster) : null
    });

    return res.status(201).json({
      message: "Movie added to watchlist.",
      movie
    });
  } catch (error) {
    return handleWatchlistError(
      res,
      error,
      "Unable to add movie to watchlist. Please try again."
    );
  }
};

const removeMovie = async (req, res) => {
  try {
    const movieId = toPositiveInteger(req.params.movieId);

    if (!movieId) {
      return res.status(400).json({
        message: "A valid movie id is required.",
        status: 400
      });
    }

    const movie = await removeMovieFromWatchlist({
      userId: req.user.id,
      movieId
    });

    if (!movie) {
      return res.status(404).json({
        message: "Movie was not found in this watchlist.",
        status: 404
      });
    }

    return res.json({
      message: "Movie removed from watchlist.",
      movie
    });
  } catch (error) {
    return handleWatchlistError(
      res,
      error,
      "Unable to remove movie from watchlist. Please try again."
    );
  }
};

module.exports = {
  getWatchlist,
  addMovie,
  removeMovie
};
