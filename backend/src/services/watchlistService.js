const pool = require("../config/db");

const ensureWatchlistTable = async () => {
  if (!pool) {
    const error = new Error("Database is not configured.");
    error.status = 503;
    throw error;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      movie_id INTEGER NOT NULL,
      movie_title VARCHAR(255) NOT NULL,
      poster TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, movie_id)
    )
  `);

  await pool.query(`
    DELETE FROM watchlist older
    USING watchlist newer
    WHERE older.user_id = newer.user_id
      AND older.movie_id = newer.movie_id
      AND older.id < newer.id
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'watchlist_user_movie_unique'
          AND conrelid = 'watchlist'::regclass
      ) THEN
        ALTER TABLE watchlist
        ADD CONSTRAINT watchlist_user_movie_unique UNIQUE (user_id, movie_id);
      END IF;
    END $$;
  `);
};

const getWatchlistByUser = async (userId) => {
  await ensureWatchlistTable();

  const result = await pool.query(
    `SELECT id, user_id, movie_id, movie_title, poster, created_at
     FROM watchlist
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
};

const addMovieToWatchlist = async ({ userId, movieId, movieTitle, poster }) => {
  await ensureWatchlistTable();

  const result = await pool.query(
    `INSERT INTO watchlist (user_id, movie_id, movie_title, poster)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, movie_id)
     DO UPDATE SET
       movie_title = EXCLUDED.movie_title,
       poster = EXCLUDED.poster
     RETURNING id, user_id, movie_id, movie_title, poster, created_at`,
    [userId, movieId, movieTitle, poster || null]
  );

  return result.rows[0];
};

const removeMovieFromWatchlist = async ({ userId, movieId }) => {
  await ensureWatchlistTable();

  const result = await pool.query(
    `DELETE FROM watchlist
     WHERE user_id = $1 AND movie_id = $2
     RETURNING id, user_id, movie_id, movie_title, poster, created_at`,
    [userId, movieId]
  );

  return result.rows[0] || null;
};

module.exports = {
  getWatchlistByUser,
  addMovieToWatchlist,
  removeMovieFromWatchlist
};
