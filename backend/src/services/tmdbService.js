const axios = require("axios");

const tmdbClient = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  timeout: 10000
});

const responseCache = new Map();

// Periodic prune of expired cache entries every 5 minutes to prevent leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of responseCache.entries()) {
    if (entry.expiry <= now) {
      responseCache.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

const transientErrorCodes = new Set([
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNABORTED",
  "ENOTFOUND",
  "EAI_AGAIN"
]);

const mapMovie = (movie) => ({
  id: movie.id,
  title: movie.title,
  rating: movie.vote_average,
  poster: movie.poster_path
});

const isValidMovieId = (movieId) => /^\d+$/.test(String(movieId || "").trim());

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const tmdbGet = async (url, params = {}) => {
  const cacheKey = `${url}:${JSON.stringify(params)}`;
  const now = Date.now();

  if (responseCache.has(cacheKey)) {
    const entry = responseCache.get(cacheKey);
    if (entry.expiry > now) {
      console.log(`[Cache Hit] Serving TMDB URL: ${url}`);
      return entry.value;
    } else {
      responseCache.delete(cacheKey);
    }
  }

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await tmdbClient.get(url, {
        params: {
          api_key: process.env.TMDB_API_KEY,
          ...params
        }
      });

      // Determine duration based on request url
      let duration = 10 * 60 * 1000; // default 10 minutes for movie lists
      if (url.includes("/videos")) {
        duration = 24 * 60 * 60 * 1000; // 24 hours for trailers
      } else if (url.includes("/credits")) {
        duration = 24 * 60 * 60 * 1000; // 24 hours for cast
      } else if (url.includes("/recommendations")) {
        duration = 2 * 60 * 60 * 1000; // 2 hours for recommendations
      } else if (/^\/movie\/\d+$/.test(url)) {
        duration = 60 * 60 * 1000; // 1 hour for detailed movie info
      }

      responseCache.set(cacheKey, {
        value: response,
        expiry: Date.now() + duration
      });

      return response;
    } catch (error) {
      const status = error.response?.status;
      const isRetryable =
        transientErrorCodes.has(error.code) || status === 429 || status >= 500;

      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }

      await wait(300 * attempt);
    }
  }
};

const fetchPopularMovies = async () => {
  const response = await tmdbGet("/movie/popular");

  const movies = response.data.results.map(mapMovie);

  return movies;
};


const fetchTopRatedMovies = async () => {
  const response = await tmdbGet("/movie/top_rated");

  const movies = response.data.results.map(mapMovie);

  return movies;
};
const fetchNowPlayingMovies = async () => {
  const response = await tmdbGet("/movie/now_playing");

  const movies = response.data.results.map(mapMovie);

  return movies;
};
const fetchUpcomingMovies = async () => {
  const response = await tmdbGet("/movie/upcoming");

  const movies = response.data.results.map(mapMovie);

  return movies;
};
const fetchTrendingMovies = async () => {
  const response = await tmdbGet("/trending/movie/week");

  let movies = response.data.results.map(mapMovie);

  // Swap/replace Toy Story 5 with Spider-Man: Brand New Day
  const spideyIdx = movies.findIndex((m) => m.id === 969681 || String(m.title || "").toLowerCase() === "spider-man: brand new day");
  const toyStoryIdx = movies.findIndex((m) => m.id === 1084244 || String(m.title || "").toLowerCase() === "toy story 5");

  if (toyStoryIdx !== -1) {
    if (spideyIdx !== -1) {
      const temp = movies[toyStoryIdx];
      movies[toyStoryIdx] = movies[spideyIdx];
      movies[spideyIdx] = temp;
    } else {
      movies[toyStoryIdx] = {
        id: 969681,
        title: "Spider-Man: Brand New Day",
        rating: 0,
        poster: "/yyB2VJEW3an2xCdcYCPQhn9QERR.jpg"
      };
    }
  } else if (spideyIdx !== -1 && spideyIdx > 0) {
    const temp = movies[0];
    movies[0] = movies[spideyIdx];
    movies[spideyIdx] = temp;
  }

  return movies;
};
const searchMovies = async (movieName) => {
  const query = String(movieName || "").trim();

  if (!query) {
    return [];
  }

  const response = await tmdbGet("/search/movie", {
    query
  });

  const movies = response.data.results.map(mapMovie);

  return movies;
};
const fetchAnimeMovies = async () => {
  const response = await tmdbGet("/discover/movie", {
    with_genres: 16,
    with_original_language: "ja",
    sort_by: "vote_average.desc",
    "vote_count.gte": 500
  });

  return response.data.results.map(mapMovie);
};

// Space / hard sci-fi: Sci-Fi genre (878) + "space" keyword (9882),
// ranked by rating so the recognisable classics surface first.
const fetchSpaceMovies = async () => {
  const response = await tmdbGet("/discover/movie", {
    with_genres: 878,
    with_keywords: 9882,
    sort_by: "vote_average.desc",
    "vote_count.gte": 1000
  });

  return response.data.results.map(mapMovie);
};

// Marvel Cinematic Universe: Marvel Studios company (420).
const fetchMarvelMovies = async () => {
  const response = await tmdbGet("/discover/movie", {
    with_companies: 420,
    sort_by: "popularity.desc",
    "vote_count.gte": 100
  });

  return response.data.results.map(mapMovie);
};

// Christopher Nolan filmography: person as crew (525 = Christopher Nolan).
const fetchNolanMovies = async () => {
  const response = await tmdbGet("/discover/movie", {
    with_crew: 525,
    sort_by: "primary_release_date.desc",
    "vote_count.gte": 100
  });

  return response.data.results.map(mapMovie);
};

// Studio Ghibli: company (10342).
const fetchGhibliMovies = async () => {
  const response = await tmdbGet("/discover/movie", {
    with_companies: 10342,
    sort_by: "vote_average.desc",
    "vote_count.gte": 100
  });

  return response.data.results.map(mapMovie);
};

// Pixar: Pixar Animation Studios company (3).
const fetchPixarMovies = async () => {
  const response = await tmdbGet("/discover/movie", {
    with_companies: 3,
    sort_by: "popularity.desc",
    "vote_count.gte": 100
  });

  return response.data.results.map(mapMovie);
};

// Disney animated: Walt Disney Animation Studios company (6125).
const fetchDisneyMovies = async () => {
  const response = await tmdbGet("/discover/movie", {
    with_companies: 6125,
    sort_by: "popularity.desc",
    "vote_count.gte": 100
  });

  return response.data.results.map(mapMovie);
};
const fetchMovieById = async (movieId) => {
  if (!isValidMovieId(movieId)) {
    const error = new Error("Movie id must be a number.");
    error.status = 400;
    throw error;
  }

  const response = await tmdbGet(`/movie/${movieId}`);

  const movie = {
    id: response.data.id,
    title: response.data.title,
    overview: response.data.overview,
    rating: response.data.vote_average,
    poster: response.data.poster_path,
    backdrop: response.data.backdrop_path,
    releaseDate: response.data.release_date,
    runtime: response.data.runtime,
    genres: response.data.genres ? response.data.genres.map((g) => g.name) : []
  };

  return movie;
};
const fetchMovieTrailer = async (movieId, language) => {
  if (!isValidMovieId(movieId)) {
    const error = new Error("Movie id must be a number.");
    error.status = 400;
    throw error;
  }

  // If a language is specified (e.g. 'hi'), try to get the videos in that language first
  let response;
  if (language) {
    response = await tmdbGet(`/movie/${movieId}/videos`, { language });
  } else {
    response = await tmdbGet(`/movie/${movieId}/videos`);
  }

  const results = response?.data?.results || [];

  // Only YouTube videos can be embedded / played inside CineVerse.
  const youtube = results.filter((video) => video.site === "YouTube" && video.key);

  // Rank every candidate so the most "official trailer"-like video is first and
  // weaker candidates (extra trailers, teasers) act as automatic fallbacks for
  // the frontend when a higher-ranked video is blocked from embedding.
  const score = (video) => {
    let value = 0;
    if (video.type === "Trailer") value += 4;
    else if (video.type === "Teaser") value += 2;
    if (video.official === true) value += 2;
    return value;
  };

  const ordered = youtube
    .slice()
    .sort((a, b) => score(b) - score(a))
    .map((video) => ({ key: video.key, name: video.name }));

  // Backwards compatible: `key`/`name` still expose the single best trailer
  // (used by the Hero background player), while `trailers` is the full ordered
  // fallback list consumed by the trailer modal.
  const primary = ordered[0] || null;

  return {
    key: primary ? primary.key : null,
    name: primary ? primary.name : null,
    trailers: ordered
  };
};

const fetchMovieCast = async (movieId) => {
  if (!isValidMovieId(movieId)) {
    const error = new Error("Movie id must be a number.");
    error.status = 400;
    throw error;
  }

  const response = await tmdbGet(`/movie/${movieId}/credits`);

  return response.data.cast.slice(0, 10).map((person) => ({
    id: person.id,
    name: person.name,
    character: person.character,
    profile: person.profile_path
  }));
};

const fetchMovieDirector = async (movieId) => {
  if (!isValidMovieId(movieId)) {
    const error = new Error("Movie id must be a number.");
    error.status = 400;
    throw error;
  }

  const response = await tmdbGet(`/movie/${movieId}/credits`);

  const crew = response.data.crew || [];
  const director = crew.find((person) => person.job === "Director");

  return director ? director.name : null;
};

const fetchMovieCountry = async (movieId) => {
  if (!isValidMovieId(movieId)) {
    const error = new Error("Movie id must be a number.");
    error.status = 400;
    throw error;
  }

  const response = await tmdbGet(`/movie/${movieId}`);

  const country = (response.data.production_countries || [])[0];

  return country
    ? { code: country.iso_3166_1, name: country.name }
    : { code: null, name: null };
};

const fetchMovieRecommendations = async (movieId) => {
  if (!isValidMovieId(movieId)) {
    const error = new Error("Movie id must be a number.");
    error.status = 400;
    throw error;
  }

  const response = await tmdbGet(`/movie/${movieId}/recommendations`);

  return response.data.results.map(mapMovie);
};

const fetchMoviesByGenre = async (genreId) => {
  const response = await tmdbGet("/discover/movie", {
    with_genres: genreId
  });
  return response.data.results.map(mapMovie);
};

const fetchMoviesByLanguage = async (languageCode) => {
  const response = await tmdbGet("/discover/movie", {
    with_original_language: languageCode,
    sort_by: "popularity.desc"
  });
  console.log(
    `[Language] ${languageCode} -> ${response.data.results.length} results`
  );
  return response.data.results.map(mapMovie);
};

const fetchPersonalizedMovies = async ({
  genreId,
  language,
  minRating,
  preferredEra
} = {}) => {
  // Rotate across the first few pages so the same top-popular titles aren't
  // returned on every request (the main cause of repetitive recommendations).
  const page = 1 + Math.floor(Math.random() * 3); // page 1-3

  const params = {
    with_genres: genreId,
    sort_by: "popularity.desc",
    "vote_average.gte": minRating,
    "vote_count.gte": 50,
    page
  };

  if (language) {
    params.with_original_language = language;
  }

  // Map preferred era -> release date range
  if (preferredEra === "Modern") {
    params["primary_release_date.gte"] = "2015-01-01";
  } else if (preferredEra === "2000s") {
    params["primary_release_date.gte"] = "2000-01-01";
    params["primary_release_date.lte"] = "2014-12-31";
  } else if (preferredEra === "Classic") {
    params["primary_release_date.lte"] = "1999-12-31";
  }

  const response = await tmdbGet("/discover/movie", params);

  return response.data.results.map(mapMovie);
};

module.exports = {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchNowPlayingMovies,
  fetchUpcomingMovies,
  fetchTrendingMovies,
  searchMovies,
  fetchAnimeMovies,
  fetchSpaceMovies,
  fetchMarvelMovies,
  fetchNolanMovies,
  fetchGhibliMovies,
  fetchPixarMovies,
  fetchDisneyMovies,
  fetchMovieById,
  fetchMovieTrailer,
  fetchMovieCast,
  fetchMovieDirector,
  fetchMovieCountry,
  fetchMovieRecommendations,
  fetchMoviesByGenre,
  fetchMoviesByLanguage,
  fetchPersonalizedMovies
};
