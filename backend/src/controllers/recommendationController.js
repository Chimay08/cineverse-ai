const {
    getUserPreferences,
    getWatchedMovieIds
} = require("../services/activityService");
const tmdb = require("../services/tmdbService");

// TMDB genre name -> genre ID mapping
const GENRE_NAME_TO_ID = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  "Science Fiction": 878,
  "TV Movie": 10770,
  Thriller: 53,
  War: 10752,
  Western: 37
};

const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get complete user preference profile
    const preferences = await getUserPreferences(userId);

    console.log("User Preferences:", preferences);

    // No activity yet
    if (!preferences || !preferences.topGenre) {
      console.log("No user preferences found.");

      return res.json([]);
    }

    // Convert genre name -> TMDB genre ID
    const genreId = GENRE_NAME_TO_ID[preferences.topGenre];

    if (!genreId) {
      console.log("Unknown genre:", preferences.topGenre);

      return res.json([]);
    }

    // Fetch movies from TMDB
    const movies =
await tmdb.fetchPersonalizedMovies({

  genreId,

  language: preferences.topLanguage,

  minRating: Math.max(
      preferences.averageRating - 0.5,
      7
  ),

  preferredEra: preferences.preferredEra

});
const watchedMovieIds =
await getWatchedMovieIds(userId);

const filteredMovies =
movies.filter(
    movie =>
        !watchedMovieIds.includes(movie.id)
);

    return res.json(filteredMovies);

  } catch (error) {
    console.error("Recommendation Error:", error);

    return res.status(500).json({
      message: "Failed to generate recommendations"
    });
  }
};

module.exports = {
  getPersonalizedRecommendations
};