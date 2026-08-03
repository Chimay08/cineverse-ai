import axios from "axios";
import { GENRES } from "./mockData";

// ----------------------------------------------------------------------------
// CineVerse API layer — talks ONLY to the Node/Express backend
// (movies via TMDB, auth, watchlist). No mock fallback: if the backend is off,
// lists come back empty and the UI shows its loading / empty states.
// ----------------------------------------------------------------------------

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

export const IMG_BASE = "https://image.tmdb.org/t/p";

// Resolve a poster/backdrop path into a full TMDB CDN url.
export const posterUrl = (path, size = "w500") => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${IMG_BASE}/${size}${path}`;
};
export const backdropUrl = (path, size = "w1280") => posterUrl(path, size);
export const profileUrl = (path, size = "w185") => posterUrl(path, size);

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 9000,
});

// Attach JWT from storage on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cv_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise a backend/TMDB movie into the shape the UI expects.
const normalize = (m) => ({
  id: m.id,
  title: m.title || "Untitled",
  rating: typeof m.rating === "number" ? m.rating : 0,
  poster: m.poster ?? null,
  backdrop: m.backdrop ?? null,
  overview: m.overview ?? "",
  year: m.year ?? (m.releaseDate ? Number(String(m.releaseDate).slice(0, 4)) : undefined),
  runtime: m.runtime,
  genres: m.genres ?? [],
  director: m.director,
  trailer: m.trailer,
  releaseDate: m.releaseDate,
});

// Fetch a list from the backend; return [] on any failure (backend-only).
const fetchList = async (request) => {
  try {
    const { data } = await request();
    const arr = Array.isArray(data) ? data : data?.results || data?.movies;
    return Array.isArray(arr) ? arr.map(normalize) : [];
  } catch {
    return [];
  }
};

// Simple client-side in-memory cache
export const clientCache = {};

export const getCachedData = (key, ...args) => {
  const cacheKey = `${key}_${JSON.stringify(args)}`;
  return clientCache[cacheKey] || null;
};

const withCache = (key, fn) => {
  return async (...args) => {
    const cacheKey = `${key}_${JSON.stringify(args)}`;
    if (clientCache[cacheKey]) {
      return clientCache[cacheKey];
    }
    const res = await fn(...args);
    if (res && (!Array.isArray(res) || res.length > 0)) {
      clientCache[cacheKey] = res;
    }
    return res;
  };
};

// ---------------------------- Movie endpoints -------------------------------

export const getNowPlaying = withCache("now-playing", () => fetchList(() => api.get("/movies/now-playing")));
export const getPopular = withCache("popular", () => fetchList(() => api.get("/movies/popular")));
export const getTopRated = withCache("top-rated", () => fetchList(() => api.get("/movies/top-rated")));
export const getTrending = withCache("trending", () => {
  console.log("Fetching trending movies from backend");
  return fetchList(() => api.get("/movies/trending"));
});
export const getUpcoming = withCache("upcoming", () => fetchList(() => api.get("/movies/upcoming")));

export const searchMovies = (query) =>
  fetchList(() => api.get("/movies/search", { params: { query } }));

export const getByGenre = withCache("genre", (genreId) =>
  fetchList(() => api.get(`/movies/genre/${genreId}`))
);
export const getByLanguage = withCache("language", (languageCode) =>
  fetchList(() => api.get(`/movies/language/${languageCode}`))
);

export const getMovie = withCache("movie", async (id) => {
  try {
    const { data } = await api.get(`/movies/${id}`);
    return normalize(data);
  } catch {
    return null;
  }
});

export const getMovieCast = async (id) => {
  try {
    const { data } = await api.get(`/movies/${id}/cast`);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const getMovieTrailer = withCache("trailer", async (id) => {
  try {
    const { data } = await api.get(`/movies/${id}/trailer`);
    return data?.key || null;
  } catch {
    return null;
  }
});

// Ordered list of YouTube trailer candidates ([{ key, name }, ...]) used by the
// trailer modal so it can fall back to the next video when one is blocked from
// embedding. Falls back to the single `key` for older backend responses.
export const getMovieTrailers = withCache("trailers", async (id) => {
  try {
    const { data } = await api.get(`/movies/${id}/trailer`);
    const list = Array.isArray(data?.trailers) ? data.trailers.filter((t) => t?.key) : [];
    if (list.length) return list;
    return data?.key ? [{ key: data.key, name: data.name }] : [];
  } catch {
    return [];
  }
});

export const getRecommendations = (id) =>
  fetchList(() => api.get(`/movies/${id}/recommendations`));

export const getPersonalizedRecommendations = async () => {
  try {
    const { data } = await api.get("/recommendations/personalized");

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Personalized recommendations failed:", error);
    return [];
  }
};

export const getAIRecommendations = async (message) => {
  const { data } = await api.post("/api/ai/chat", { message });
  const movies = data?.movies || data?.recommendations || data?.reply;

  return {
    movies: Array.isArray(movies) ? movies : [],
    searchSections: data?.searchSections || null
  };
};

export const getConciergeHome = async () => {
  try {
    const { data } = await api.get("/api/concierge/home");

    return {
      becauseYouWatched: data?.becauseYouWatched || [],
      directorPicks: data?.directorPicks || [],
      trending: data?.trending || [],
      lateNight: data?.lateNight || [],
      mindBending: data?.mindBending || [],
      crimeThrillers: data?.crimeThrillers || []
    };
  } catch (error) {
    console.error("Concierge home failed:", error);

    return {
      becauseYouWatched: [],
      directorPicks: [],
      trending: [],
      lateNight: [],
      mindBending: [],
      crimeThrillers: []
    };
  }
};

// ---------------------------- Auth endpoints --------------------------------

export const login = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // { token, user }
};

export const register = async ({ username, email, password }) => {
  const { data } = await api.post("/auth/register", { username, email, password });
  return data; // { user }
};

// ---------------------------- Watchlist -------------------------------------

export const getWatchlist = async () => {
  const { data } = await api.get("/watchlist/my");
  // Backend rows use `id` (internal PK), `movie_id` (TMDB id), `movie_title`.
  // The app expects { id: <TMDB id>, title, poster }, so map to that shape —
  // otherwise recs/links use the internal PK and hit /movies/<pk> (404).
  return (data?.movies || []).map((m) => ({
    id: m.movie_id ?? m.id,
    title: m.movie_title ?? m.title,
    poster: m.poster,
  }));
};

export const addToWatchlist = async (movie) =>
  api.post("/watchlist/add", {
    movieId: movie.id,
    movieTitle: movie.title,
    poster: movie.poster,
  });

export const removeFromWatchlist = async (movieId) =>
  api.delete(`/watchlist/${movieId}`);



/* ----------------------- Activity Tracking ----------------------- */

export const trackActivity = async ({
  movieId,
  movieTitle,
  genre,
  language,
  rating,
  releaseYear,
  actionType
}) => {
  try {
    const { data } = await api.post("/activity", {
      movieId,
      movieTitle,
      genre,
      language,
      rating,
      releaseYear,
      actionType
    });

    return data;
  } catch (error) {
    console.error("Activity tracking failed:", error);
    return null;
  }
};


export const getActivity = async () => {
  try {
    const { data } = await api.get("/activity");
    return data || [];
  } catch {
    return [];
  }
};
export const getTasteProfile = async () => {

    try {

        const { data } =
            await api.get("/profile/taste");

        return data;

    } catch {

        return [];

    }

};

export const getDirectorsProfile = async () => {
  try {
    const { data } = await api.get("/profile/directors");
    return data || [];
  } catch {
    return [];
  }
};

export const getActorsProfile = async () => {
  try {
    const { data } = await api.get("/profile/actors");
    return data || [];
  } catch {
    return [];
  }
};

export const getCinemaMap = async () => {
  try {
    const response = await api.get("/profile/countries");

    return response.data;

  } catch (error) {
    console.error("Cinema map failed:", error);

    return [];
  }
};

export { GENRES };
