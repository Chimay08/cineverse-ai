const axios = require("axios");
const {
  getGenreDistribution,
  getFavoriteDirectors,
  getFavoriteActors,
  getWatchedMovieIds
} = require("./activityService");
const {
  getRecentSearches,
  getWatchHistory
} = require("./historyService");
const tmdb = require("./tmdbService");
const { detectIntent, detectLanguage, detectSearchType } = require("./intentService");
const { explainRecommendations } = require("./aiService");

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const GENRE_NAME_TO_ID = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  mystery: 9648,
  romance: 10749,
  "science fiction": 878,
  "sci-fi": 878,
  thriller: 53,
  war: 10752
};

const MOODS = [
  "dark",
  "emotional",
  "funny",
  "tense",
  "comfort",
  "mind-bending",
  "romantic",
  "uplifting",
  "gritty",
  "slow burn"
];

const SITUATIONS = [
  "tonight",
  "rainy",
  "date night",
  "family",
  "weekend",
  "late night",
  "with friends",
  "alone"
];

const KNOWN_DIRECTORS = [
  "christopher nolan",
  "david fincher",
  "steven spielberg",
  "denis villeneuve",
  "martin scorsese",
  "quentin tarantino",
  "ridley scott"
];

const KNOWN_ACTORS = [
  "brad pitt",
  "leonardo dicaprio",
  "tom cruise",
  "ryan gosling",
  "morgan freeman",
  "emma stone",
  "zendaya"
];

const posterUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${IMAGE_BASE}${path}`;
};

const uniqueById = (movies) => {
  const seen = new Set();

  return movies.filter((movie) => {
    if (!movie?.id || seen.has(movie.id)) return false;
    seen.add(movie.id);
    return true;
  });
};

const inferMood = (movie, fallback = "Curated") => {
  const title = String(movie?.title || "").toLowerCase();
  const genre = String(movie?.genre || "").toLowerCase();

  if (title.includes("mind") || genre.includes("mystery")) return "Mind-bending";
  if (genre.includes("crime") || genre.includes("thriller")) return "Dark";
  if (genre.includes("comedy")) return "Light";
  if (genre.includes("romance")) return "Romantic";
  if (genre.includes("drama")) return "Emotional";

  return fallback;
};

const toCard = (movie, reason, because, mood) => ({
  id: movie.id,
  title: movie.title || "Untitled",
  poster: posterUrl(movie.poster),
  reason,
  because,
  mood: mood || inferMood(movie),
  rating: Number(movie.rating || 0)
});

const limitCards = async (movies, reason, because, mood, watchedIds = []) => {
  const watched = new Set(watchedIds.map(Number));

  return uniqueById(movies)
    .filter((movie) => !watched.has(Number(movie.id)))
    .slice(0, 20)
    .map((movie) => toCard(movie, reason, because, mood));
};

const tmdbGet = async (url, params = {}) => {
  const response = await axios.get(`${TMDB_BASE}${url}`, {
    timeout: 10000,
    params: {
      api_key: process.env.TMDB_API_KEY,
      ...params
    }
  });

  return response.data;
};

const mapTmdbMovie = (movie) => ({
  id: movie.id,
  title: movie.title,
  poster: movie.poster_path,
  rating: movie.vote_average
});

const getMoviesByPerson = async (name, role) => {
  if (!name || !process.env.TMDB_API_KEY) return [];

  try {
    const people = await tmdbGet("/search/person", { query: name });
    const person = people.results?.[0];
    if (!person?.id) return [];

    const params = {
      sort_by: "popularity.desc",
      "vote_count.gte": 100
    };

    if (role === "director") {
      params.with_crew = person.id;
    } else {
      params.with_cast = person.id;
    }

    const movies = await tmdbGet("/discover/movie", params);
    return (movies.results || []).map(mapTmdbMovie);
  } catch (error) {
    console.warn(`TMDB person recommendations failed for ${name}:`, error.message);
    return [];
  }
};

const getMovieIntentMetadata = async (movieName) => {
  if (!movieName) return null;

  try {
    const matches = await tmdb.searchMovies(movieName);
    const match = matches[0];

    if (!match?.id) return null;

    const [details, cast, director, related] = await Promise.all([
      tmdb.fetchMovieById(match.id),
      tmdb.fetchMovieCast(match.id),
      tmdb.fetchMovieDirector(match.id),
      tmdb.fetchMovieRecommendations(match.id)
    ]);

    return {
      movie: {
        id: details.id,
        title: details.title,
        genres: details.genres || [],
        rating: details.rating,
        releaseDate: details.releaseDate
      },
      director,
      actors: cast.slice(0, 5).map((actor) => actor.name),
      priorityMovies: related.slice(0, 20).map((movie) => ({
        id: movie.id,
        title: movie.title,
        rating: movie.rating
      }))
    };
  } catch (error) {
    console.warn(`Movie intent metadata failed for "${movieName}":`, error.message);
    return null;
  }
};

const buildIntentPriority = async (intent) => {
  const entities = intent.entities || {};

  if (intent.type === "MOVIE_TITLE" || entities.movie) {
    const metadata = await getMovieIntentMetadata(entities.movie);

    return {
      strategy: "SIMILAR_TO_MOVIE",
      movieMetadata: metadata,
      priorityGenres: metadata?.movie?.genres || [],
      priorityActors: metadata?.actors || [],
      priorityDirector: metadata?.director || null,
      priorityMovies: metadata?.priorityMovies || []
    };
  }

  if (intent.type === "DIRECTOR" || entities.director) {
    const movies = await getMoviesByPerson(entities.director, "director");

    return {
      strategy: "DIRECTOR_FILMOGRAPHY",
      priorityDirector: entities.director,
      priorityMovies: movies.slice(0, 20).map((movie) => ({
        id: movie.id,
        title: movie.title,
        rating: movie.rating
      }))
    };
  }

  if (intent.type === "ACTOR" || entities.actor) {
    const movies = await getMoviesByPerson(entities.actor, "actor");

    return {
      strategy: "ACTOR_FILMOGRAPHY",
      priorityActor: entities.actor,
      priorityMovies: movies.slice(0, 20).map((movie) => ({
        id: movie.id,
        title: movie.title,
        rating: movie.rating
      }))
    };
  }

  if (intent.type === "MOOD" || entities.mood) {
    return {
      strategy: "MOOD_PLUS_HISTORY",
      priorityMood: entities.mood,
      useHistory: true
    };
  }

  if (intent.type === "SITUATION" || entities.situation) {
    return {
      strategy: "SITUATION_TIME_OF_DAY",
      prioritySituation: entities.situation,
      priorityMood: entities.mood,
      useTimeOfDay: true
    };
  }

  if (intent.type === "GENRE" || entities.genre) {
    return {
      strategy: "GENRE_PLUS_HISTORY",
      priorityGenres: entities.genre ? [entities.genre] : [],
      priorityMood: entities.mood,
      useHistory: true
    };
  }

  return {
    strategy: "GENERAL_PERSONALIZED",
    useHistory: true
  };
};

const buildUserContext = async (userId, query = "") => {
  const [
    favoriteGenreRows,
    favoriteDirectors,
    favoriteActors,
    recentSearches,
    watchHistory
  ] = await Promise.all([
    getGenreDistribution(userId),
    getFavoriteDirectors(userId),
    getFavoriteActors(userId),
    getRecentSearches(userId),
    getWatchHistory(userId)
  ]);

  const favoriteGenres = favoriteGenreRows.map((row) => ({
    genre: row.genre,
    total: Number(row.total || 0)
  }));

  const favoriteMoods = favoriteGenres.slice(0, 3).map((row) =>
    inferMood({ genre: row.genre })
  );

  const intent = detectIntent(query);
  const intentPriority = await buildIntentPriority(intent);

  return {
    query,
    intent,
    intentPriority,
    favoriteGenres,
    favoriteDirectors: favoriteDirectors.slice(0, 20),
    favoriteActors: favoriteActors.slice(0, 20),
    favoriteMoods: [...new Set(favoriteMoods)],
    recentSearches: recentSearches.map((row) => row.query),
    watchHistory: watchHistory.map((row) => ({
      id: row.movie_id,
      title: row.movie_title,
      genre: row.genre,
      director: row.director,
      rating: row.rating,
      releaseYear: row.release_year
    }))
  };
};

const getGenreMovies = (genreName, fallbackGenreId) => {
  const genreId = GENRE_NAME_TO_ID[String(genreName || "").toLowerCase()] || fallbackGenreId;
  return tmdb.fetchMoviesByGenre(genreId);
};

const generateSections = async (userId) => {
  const context = await buildUserContext(userId);
  const watchedIds = await getWatchedMovieIds(userId);
  const lastWatched = context.watchHistory[0];
  const favoriteGenre = context.favoriteGenres[0]?.genre;
  const favoriteDirector = context.favoriteDirectors[0]?.director;

  const [
    becauseSource,
    directorSource,
    trendingSource,
    lateNightSource,
    mindBendingSource,
    crimeSource
  ] = await Promise.all([
    lastWatched?.id
      ? tmdb.fetchMovieRecommendations(lastWatched.id)
      : tmdb.fetchTrendingMovies(),
    favoriteDirector
      ? getMoviesByPerson(favoriteDirector, "director")
      : tmdb.fetchNolanMovies(),
    tmdb.fetchTrendingMovies(),
    getGenreMovies(favoriteGenre, 53),
    getGenreMovies("mystery", 9648),
    getGenreMovies("crime", 80)
  ]);

  return {
    becauseYouWatched: await limitCards(
      becauseSource,
      lastWatched
        ? `Because you watched ${lastWatched.title}.`
        : "A strong starting point while CineVerse learns your taste.",
      lastWatched?.title || "your early CineVerse activity",
      inferMood(lastWatched, "Personal")
    ),
    directorPicks: await limitCards(
      directorSource.length ? directorSource : trendingSource,
      favoriteDirector
        ? `Based on your favorite director, ${favoriteDirector}.`
        : "Director-driven picks to help build your profile.",
      favoriteDirector || "your director taste profile",
      "Auteur",
      watchedIds
    ),
    trending: await limitCards(
      trendingSource,
      favoriteGenre
        ? `Trending with viewers who enjoy ${favoriteGenre}.`
        : "Trending among CineVerse viewers right now.",
      favoriteGenre || "users like you",
      "Trending",
      watchedIds
    ),
    lateNight: await limitCards(
      lateNightSource,
      "Perfect for tonight based on your recent signals.",
      favoriteGenre || "your watch history",
      "Tonight",
      watchedIds
    ),
    mindBending: await limitCards(
      mindBendingSource,
      "Puzzle-box stories with layered reveals.",
      "your appetite for richer stories",
      "Mind-bending",
      watchedIds
    ),
    crimeThrillers: await limitCards(
      crimeSource,
      "Crime thrillers selected for your darker watch patterns.",
      favoriteGenre || "your taste profile",
      "Dark",
      watchedIds
    )
  };
};

const fetchCandidatesForSearch = async (query, searchType, userId) => {
  const type = searchType?.type || "MOVIE";
  const value = searchType?.value || query;
  let candidates = [];

  if (type === "MOVIE") {
    const matches = await tmdb.searchMovies(value);
    const topMatch = matches[0];

    if (topMatch?.id) {
      const [recs, details] = await Promise.all([
        tmdb.fetchMovieRecommendations(topMatch.id).catch(() => []),
        tmdb.fetchMovieById(topMatch.id).catch(() => null)
      ]);

      if (recs.length > 0) {
        candidates = recs;
      } else if (details?.genres?.length) {
        const genreId = GENRE_NAME_TO_ID[details.genres[0]?.toLowerCase()] || 28;
        candidates = await tmdb.fetchMoviesByGenre(genreId);
      }
    }

    if (candidates.length === 0) {
      candidates = matches;
    }
  } else if (type === "LANGUAGE") {
    const langCode = searchType.langCode || detectLanguage(query) || "hi";
    candidates = await tmdb.fetchMoviesByLanguage(langCode);
  } else if (type === "DIRECTOR") {
    candidates = await getMoviesByPerson(value, "director");
  } else if (type === "ACTOR") {
    candidates = await getMoviesByPerson(value, "actor");
  } else if (type === "GENRE") {
    const genreId = GENRE_NAME_TO_ID[value.toLowerCase()] || 28;
    candidates = await tmdb.fetchMoviesByGenre(genreId);
  } else if (type === "MOOD") {
    const moodGenreMap = {
      Dark: 53,
      Funny: 35,
      Emotional: 18,
      "Mind-bending": 9648,
      Tense: 53,
      Nostalgic: 10751,
      "Feel good": 35
    };
    const genreId = moodGenreMap[value] || 53;
    candidates = await tmdb.fetchMoviesByGenre(genreId);
  }

  if (!candidates || candidates.length === 0) {
    candidates = await tmdb.searchMovies(query);
  }

  const watchedIds = await getWatchedMovieIds(userId);
  const watchedSet = new Set(watchedIds.map(Number));

  return uniqueById(candidates)
    .filter((m) => !watchedSet.has(Number(m.id)))
    .slice(0, 20)
    .map((m) => toCard(m, `Matches your ${type.toLowerCase()} search for "${value}"`, query, type));
};

const buildSearchSections = async (userId, query, aiMovies = []) => {
  const context = await buildUserContext(userId, query);
  const searchType = detectSearchType(query);
  const watchedIds = await getWatchedMovieIds(userId);

  // 1. Fetch REAL TMDB candidates based on search type
  const rawCandidates = await fetchCandidatesForSearch(query, searchType, userId);

  // 2. Generate personalized explanations using Gemini (without changing movie titles)
  const explainedCandidates = await explainRecommendations(rawCandidates, query, context);

  const similarMovies = explainedCandidates.slice(0, 20);

  // 3. More like this section
  let moreLikeThis = [];
  const topMovie = similarMovies[0];
  if (topMovie?.id) {
    try {
      const recs = await tmdb.fetchMovieRecommendations(topMovie.id);
      const rawMore = (recs || []).slice(0, 20).map((m) => toCard(m, `More like ${topMovie.title}`, topMovie.title, "Similar"));
      moreLikeThis = await explainRecommendations(rawMore, `More like ${topMovie.title}`, context);
    } catch {
      moreLikeThis = [];
    }
  }

  if (moreLikeThis.length === 0 && searchType.type === "LANGUAGE") {
    const langMovies = await tmdb.fetchMoviesByLanguage(searchType.langCode || "hi");
    moreLikeThis = langMovies.slice(0, 20).map((m) => toCard(m, `More regional cinema`, query, "Regional"));
  } else if (moreLikeThis.length === 0) {
    const popular = await tmdb.fetchPopularMovies();
    moreLikeThis = popular.slice(0, 20).map((m) => toCard(m, "Popular selection", query, "Popular"));
  }

  // 4. Based on your history section
  const lastWatched = context.watchHistory[0];
  const becauseSource = lastWatched?.id
    ? await tmdb.fetchMovieRecommendations(lastWatched.id)
    : await tmdb.fetchTrendingMovies();

  const basedOnHistory = await limitCards(
    becauseSource,
    lastWatched
      ? `Because you watched ${lastWatched.title}.`
      : "Based on your watch history and activity.",
    lastWatched?.title || "your watch history",
    inferMood(lastWatched, "Personal"),
    watchedIds
  );

  // 5. Trending now section
  const trendingSource = await tmdb.fetchTrendingMovies();
  const trendingNow = await limitCards(
    trendingSource,
    "Trending right now across CineVerse.",
    "popular demand",
    "Trending",
    watchedIds
  );

  return {
    similarMovies: similarMovies.slice(0, 20),
    moreLikeThis: moreLikeThis.slice(0, 20),
    basedOnHistory: basedOnHistory.slice(0, 20),
    trendingNow: trendingNow.slice(0, 20)
  };
};

module.exports = {
  buildUserContext,
  detectIntent,
  detectLanguage,
  detectSearchType,
  generateSections,
  buildSearchSections
};
