const { saveActivity, saveActors, getUserActivity } = require("../services/activityService");
const { fetchMovieDirector, fetchMovieCountry, fetchMovieCast } = require("../services/tmdbService");

const trackActivity = async (req, res) => {
  try {
    const userId = req.user.id;   // from auth middleware

    const {
  movieId,
  movieTitle,
  genre,
  language,
  rating,
  releaseYear,
  actionType
} = req.body;



// Fetch director from TMDB (returns the name or null)
const director = await fetchMovieDirector(movieId);
const country = await fetchMovieCountry(movieId);
const actors = await fetchMovieCast(movieId);
const topActors = actors.slice(0, 5);

    const activity = await saveActivity(
      userId,
      movieId,
      movieTitle,
      genre,
      language,
      rating,
      releaseYear,
      director,
      country.code,
      country.name,
      actionType
    );

    await saveActors(userId, movieId, topActors);

    res.status(201).json(activity);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to save activity"
    });
  }
};
const getActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    const activity = await getUserActivity(userId);

    res.json(activity);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch activity"
    });
  }
};
module.exports = {
  trackActivity,
  getActivity
};
