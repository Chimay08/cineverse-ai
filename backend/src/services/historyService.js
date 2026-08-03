const pool = require("../config/db");
const { fetchMovieById } = require("./tmdbService");

let searchHistoryReady = false;

const ensureSearchHistory = async () => {
  if (!pool || searchHistoryReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS search_history (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      query TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_search_history_user_created
    ON search_history (user_id, created_at DESC);
  `);

  searchHistoryReady = true;
};

const getRecentSearches = async (userId) => {
  if (!pool || !userId) return [];

  try {
    await ensureSearchHistory();

    const result = await pool.query(
      `
      SELECT query, created_at
      FROM search_history
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10;
      `,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.warn("Recent searches unavailable:", error.message);
    return [];
  }
};

const getWatchHistory = async (userId) => {
  if (!pool || !userId) return [];

  try {
    const result = await pool.query(
      `
      SELECT DISTINCT ON (movie_id)
        movie_id,
        movie_title,
        genre,
        director,
        rating,
        release_year,
        created_at
      FROM user_activity
      WHERE user_id = $1
        AND movie_id IS NOT NULL
        AND action_type IN ('viewed_movie', 'watched_trailer', 'added_watchlist')
      ORDER BY movie_id, created_at DESC
      LIMIT 20;
      `,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.warn("Watch history unavailable:", error.message);
    return [];
  }
};

const saveSearch = async (userId, query) => {
  const cleanQuery = String(query || "").trim();
  if (!pool || !userId || !cleanQuery) return null;

  try {
    await ensureSearchHistory();

    const result = await pool.query(
      `
      INSERT INTO search_history (user_id, query)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [userId, cleanQuery]
    );

    return result.rows[0];
  } catch (error) {
    console.warn("Search history save skipped:", error.message);
    return null;
  }
};

const saveWatch = async (userId, movieId) => {
  if (!pool || !userId || !movieId) return null;

  try {
    const movie = await fetchMovieById(movieId);

    const result = await pool.query(
      `
      INSERT INTO user_activity (
        user_id,
        movie_id,
        movie_title,
        genre,
        rating,
        release_year,
        action_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'viewed_movie')
      RETURNING *;
      `,
      [
        userId,
        movie.id,
        movie.title,
        movie.genres?.[0] || null,
        movie.rating || null,
        movie.releaseDate ? Number(String(movie.releaseDate).slice(0, 4)) : null
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.warn("Watch history save skipped:", error.message);
    return null;
  }
};

module.exports = {
  getRecentSearches,
  getWatchHistory,
  saveSearch,
  saveWatch
};
