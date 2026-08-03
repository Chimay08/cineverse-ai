const {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchNowPlayingMovies,
  fetchUpcomingMovies,
  searchMovies,
  fetchMovieById,
  fetchMovieTrailer,
  fetchMovieCast,
  fetchMovieRecommendations,
  fetchTrendingMovies,
  fetchMoviesByGenre,
  fetchMoviesByLanguage

} = require("../services/tmdbService");
const { detectIntent } = require("../utils/searchIntent");
const { SEARCH_HANDLERS } = require("../utils/searchHandlers");

const getMovieErrorMessage = (status, error, tmdbMessage) => {
  if (status === 400) {
    return error.message;
  }

  if (status === 401) {
    return "TMDB API key is missing or invalid.";
  }

  if (status === 404) {
    return "Movie not found on TMDB. Check that the movie id is correct.";
  }

  return tmdbMessage || "Unable to fetch movie data from TMDB. Please try again.";
};

const handleMovieRequest = (handler) => async (req, res) => {
  try {
    const data = await handler(req);
    res.json(data);
  } catch (error) {
    const status = error.status || error.response?.status || 502;
    const tmdbMessage = error.response?.data?.status_message;
    const message = getMovieErrorMessage(status, error, tmdbMessage);

    const log = status >= 500 ? console.error : console.warn;
    log("Movie request failed:", {
      method: req.method,
      path: req.originalUrl,
      status,
      code: error.code,
      message: error.message,
      tmdbMessage
    });

    res.status(status).json({
      message,
      code: error.code,
      status
    });
  }
};

const getPopularMovies = handleMovieRequest(() => fetchPopularMovies());

const getTopRatedMovies = handleMovieRequest(() => fetchTopRatedMovies());

const getNowPlayingMovies = handleMovieRequest(() => fetchNowPlayingMovies());

const getUpcomingMovies = handleMovieRequest(() => fetchUpcomingMovies());

const searchMovie = handleMovieRequest((req) => {
  const movieName = req.query.query;

  const intent = detectIntent(movieName);
  console.log(`[Search Intent] query="${movieName}" -> intent=${intent}`);

  const handler = SEARCH_HANDLERS[intent];
  if (handler) {
    return handler(movieName);
  }

  return searchMovies(movieName);
});

const getMovieDetails = handleMovieRequest((req) => {
  const movieId = req.params.id;
  return fetchMovieById(movieId);
});

const getMovieTrailer = handleMovieRequest((req) => {
  const movieId = req.params.id;
  const language = req.query.language;

  return fetchMovieTrailer(movieId, language);
});

const getMovieCast = handleMovieRequest((req) => {
  const movieId = req.params.id;

  return fetchMovieCast(movieId);
});

const getMovieRecommendations = handleMovieRequest((req) => {
  const movieId = req.params.id;

  return fetchMovieRecommendations(movieId);
});
const getTrendingMovies = handleMovieRequest(() => fetchTrendingMovies());
const getMoviesByGenre = handleMovieRequest((req) => {
  const genreId = req.params.genreId;

  return fetchMoviesByGenre(genreId);
});
const getMoviesByLanguage = handleMovieRequest((req) => {
  const languageCode = req.params.languageCode;

  return fetchMoviesByLanguage(languageCode);
});


module.exports = {
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
};
