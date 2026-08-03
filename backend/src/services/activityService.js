const pool = require("../config/db");

const saveActivity = async (
    userId,
    movieId,
    movieTitle,
    genre,
    language,
    rating,
    releaseYear,
    director,
    countryCode,
    countryName,
    actionType
) => {
  const query = `
  INSERT INTO user_activity
(
user_id,
movie_id,
movie_title,
genre,
language,
rating,
release_year,
director,
country_code,
country_name,
action_type
)
VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *;
  `;

  const values = [
    userId,
    movieId,
    movieTitle,
    genre,
    language,
    rating,
    releaseYear,
    director,
    countryCode,
    countryName,
    actionType
];

  const result = await pool.query(query, values);

  return result.rows[0];
};
const saveActors = async (userId, movieId, actors) => {
  if (!Array.isArray(actors) || !actors.length) {
    return [];
  }

  const savedActors = [];

  for (const actor of actors) {
    if (!actor?.name) {
      continue;
    }

    const result = await pool.query(
      `
      INSERT INTO user_actors
      (
        user_id,
        movie_id,
        actor_name,
        character_name
      )
      VALUES ($1::integer, $2::integer, $3::varchar, $4::varchar)
      ON CONFLICT (user_id, movie_id, actor_name) DO NOTHING
      RETURNING user_id, movie_id, actor_name, character_name;
      `,
      [userId, movieId, actor.name, actor.character ?? null]
    );

    if (result.rows[0]) {
      savedActors.push(result.rows[0]);
    }
  }

  return savedActors;
};
const getUserActivity = async (userId) => {
  const query = `
    SELECT *
    FROM user_activity
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 10;
  `;

  const result = await pool.query(query, [userId]);

  return result.rows;
};
const getUserPreferences = async (userId) => {

    // Favorite Genre
    const genreResult = await pool.query(
        `
        SELECT genre, COUNT(*) total
        FROM user_activity
        WHERE user_id=$1
        GROUP BY genre
        ORDER BY total DESC
        LIMIT 1;
        `,
        [userId]
    );

    // Favorite Language
    const languageResult = await pool.query(
        `
        SELECT language, COUNT(*) total
        FROM user_activity
        WHERE user_id=$1
        GROUP BY language
        ORDER BY total DESC
        LIMIT 1;
        `,
        [userId]
    );

    // Average Rating
    const ratingResult = await pool.query(
        `
        SELECT AVG(rating) average
        FROM user_activity
        WHERE user_id=$1;
        `,
        [userId]
    );

    // Preferred Era
    const eraResult = await pool.query(
        `
        SELECT
            CASE
                WHEN release_year >= 2015 THEN 'Modern'
                WHEN release_year >= 2000 THEN '2000s'
                ELSE 'Classic'
            END era,
            COUNT(*) total
        FROM user_activity
        WHERE user_id=$1
        GROUP BY era
        ORDER BY total DESC
        LIMIT 1;
        `,
        [userId]
    );

    return {
        topGenre:
            genreResult.rows[0]?.genre || null,

        topLanguage:
            languageResult.rows[0]?.language || null,

        averageRating:
            Number(ratingResult.rows[0]?.average || 0),

        preferredEra:
            eraResult.rows[0]?.era || null
    };
};
const getWatchedMovieIds = async (userId) => {

    const query = `
        SELECT DISTINCT movie_id
        FROM user_activity
        WHERE user_id = $1;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows.map(movie => movie.movie_id);
};
const getGenreDistribution = async (userId) => {

  const query = `
    SELECT
      genre,
      COUNT(*) AS total
    FROM user_activity
    WHERE user_id = $1
      AND genre IS NOT NULL
    GROUP BY genre
    ORDER BY total DESC;
  `;

  const result = await pool.query(query, [userId]);

  return result.rows;

};
const getFavoriteDirectors = async (userId) => {

  const query = `
    SELECT
      director,
      COUNT(*) AS total
    FROM user_activity
    WHERE
      user_id = $1
      AND director IS NOT NULL
    GROUP BY director
    ORDER BY total DESC;
  `;

  const result = await pool.query(query, [userId]);

  const rows = result.rows;

  if (!rows.length) {
    return [];
  }

  const max = Number(rows[0].total);

  return rows.map(row => ({
    director: row.director,
    movies: Number(row.total),
    percentage: Math.round((Number(row.total) / max) * 100)
  }));
};
const getFavoriteActors = async (userId) => {

  const query = `
    SELECT
      actor_name,
      COUNT(*) AS total
    FROM user_actors
    WHERE
      user_id = $1
      AND actor_name IS NOT NULL
    GROUP BY actor_name
    ORDER BY total DESC;
  `;

  const result = await pool.query(query, [userId]);

  const rows = result.rows;

  if (!rows.length) {
    return [];
  }

  const max = Number(rows[0].total);

  return rows.map(row => ({
    actor: row.actor_name,
    movies: Number(row.total),
    percentage: Math.round((Number(row.total) / max) * 100)
  }));
};
const getCinemaMap = async (userId) => {

  const query = `
    SELECT
      country_code,
      country_name,
      COUNT(*) AS total
    FROM user_activity
    WHERE
      user_id = $1
      AND country_code IS NOT NULL
    GROUP BY
      country_code,
      country_name
    ORDER BY total DESC;
  `;

  const result = await pool.query(query, [userId]);

  return result.rows.map(row => ({
    code: row.country_code,
    country: row.country_name,
    movies: Number(row.total)
  }));
};

module.exports = {
    saveActivity,
    saveActors,
    getUserActivity,
    getUserPreferences,
    getWatchedMovieIds,
    getGenreDistribution,
    getFavoriteDirectors,
    getFavoriteActors,
    getCinemaMap
};
