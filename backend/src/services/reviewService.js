const pool = require("../config/db");

// Fallback in-memory store when PG database is not available
const memoryReviews = [
  {
    id: 1,
    user_id: 1,
    username: "Chinmay",
    movie_id: 157336, // Interstellar
    rating: 5,
    title: "A masterpiece of modern cinema",
    review: "Interstellar changed my perspective on space, love, and time travel. Hans Zimmer's score is unmatched, and Nolan's vision is pure genius.",
    spoiler: false,
    likes: 42,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    user_id: 2,
    username: "NolanFan",
    movie_id: 157336, // Interstellar
    rating: 5,
    title: "One of Nolan's best",
    review: "Mind-blowing visuals and emotional weight. Cooper's goodbye scene breaks me every time.",
    spoiler: false,
    likes: 28,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    user_id: 3,
    username: "CinemaBuff",
    movie_id: 807, // Se7en
    rating: 5,
    title: "Unmatched atmosphere",
    review: "Fincher at his peak. The ending scene in the desert is iconic and haunting.",
    spoiler: true,
    likes: 35,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let nextMemoryId = 4;

const ensureReviewsTable = async () => {
  if (!pool) return false;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        movie_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255),
        review TEXT NOT NULL,
        spoiler BOOLEAN DEFAULT FALSE,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Unique index: one review per user per movie
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'reviews_user_movie_unique'
        ) THEN
          ALTER TABLE reviews ADD CONSTRAINT reviews_user_movie_unique UNIQUE (user_id, movie_id);
        END IF;
      END $$;
    `);

    return true;
  } catch (err) {
    console.warn("Reviews table check warning:", err.message);
    return false;
  }
};

const getReviewsByMovie = async (movieId) => {
  const mId = Number(movieId);

  if (pool) {
    try {
      await ensureReviewsTable();
      const result = await pool.query(
        `SELECT r.id, r.user_id, r.movie_id, r.rating, r.title, r.review, r.spoiler, r.likes, r.created_at,
                COALESCE(u.username, u.name, 'Cinephile') as username
         FROM reviews r
         LEFT JOIN users u ON r.user_id = u.id
         WHERE r.movie_id = $1
         ORDER BY r.created_at DESC`,
        [mId]
      );

      const rows = result.rows;
      return computeReviewStats(rows);
    } catch (err) {
      console.warn("PG getReviewsByMovie failed, falling back to memory:", err.message);
    }
  }

  const filtered = memoryReviews.filter((r) => Number(r.movie_id) === mId);
  return computeReviewStats(filtered);
};

const computeReviewStats = (reviews) => {
  const totalReviews = reviews.length;
  if (totalReviews === 0) {
    return {
      avgRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      topReviews: [],
      latestReviews: [],
      reviews: []
    };
  }

  const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  const avgRating = Number((sum / totalReviews).toFixed(1));

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating || 5))));
    ratingDistribution[star] = (ratingDistribution[star] || 0) + 1;
  });

  const sortedByLikes = [...reviews].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  const sortedByDate = [...reviews].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return {
    avgRating,
    totalReviews,
    ratingDistribution,
    topReviews: sortedByLikes,
    latestReviews: sortedByDate,
    reviews: sortedByDate
  };
};

const addReview = async ({ userId, username, movieId, rating, title, review, spoiler }) => {
  const mId = Number(movieId);
  const uId = Number(userId);
  const numRating = Math.min(5, Math.max(1, Number(rating || 5)));
  const isSpoiler = Boolean(spoiler);

  if (pool) {
    try {
      await ensureReviewsTable();
      const result = await pool.query(
        `INSERT INTO reviews (user_id, movie_id, rating, title, review, spoiler)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, movie_id)
         DO UPDATE SET
           rating = EXCLUDED.rating,
           title = EXCLUDED.title,
           review = EXCLUDED.review,
           spoiler = EXCLUDED.spoiler,
           updated_at = CURRENT_TIMESTAMP
         RETURNING id, user_id, movie_id, rating, title, review, spoiler, likes, created_at`,
        [uId, mId, numRating, title || "", review, isSpoiler]
      );

      const row = result.rows[0];
      return {
        ...row,
        username: username || "Cinephile"
      };
    } catch (err) {
      console.warn("PG addReview failed, falling back to memory:", err.message);
    }
  }

  // Memory fallback
  const existingIdx = memoryReviews.findIndex((r) => r.user_id === uId && r.movie_id === mId);
  const reviewObj = {
    id: existingIdx !== -1 ? memoryReviews[existingIdx].id : nextMemoryId++,
    user_id: uId,
    username: username || "Cinephile",
    movie_id: mId,
    rating: numRating,
    title: title || "",
    review,
    spoiler: isSpoiler,
    likes: existingIdx !== -1 ? memoryReviews[existingIdx].likes : 0,
    created_at: new Date().toISOString()
  };

  if (existingIdx !== -1) {
    memoryReviews[existingIdx] = reviewObj;
  } else {
    memoryReviews.unshift(reviewObj);
  }

  return reviewObj;
};

const updateReview = async ({ id, userId, rating, title, review, spoiler }) => {
  const rId = Number(id);
  const uId = Number(userId);

  if (pool) {
    try {
      await ensureReviewsTable();
      const result = await pool.query(
        `UPDATE reviews
         SET rating = $1, title = $2, review = $3, spoiler = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5 AND user_id = $6
         RETURNING *`,
        [Number(rating), title || "", review, Boolean(spoiler), rId, uId]
      );

      return result.rows[0] || null;
    } catch (err) {
      console.warn("PG updateReview failed:", err.message);
    }
  }

  const idx = memoryReviews.findIndex((r) => r.id === rId && r.user_id === uId);
  if (idx !== -1) {
    memoryReviews[idx] = {
      ...memoryReviews[idx],
      rating: Number(rating),
      title: title || "",
      review,
      spoiler: Boolean(spoiler),
      updated_at: new Date().toISOString()
    };
    return memoryReviews[idx];
  }

  return null;
};

const deleteReview = async ({ id, userId }) => {
  const rId = Number(id);
  const uId = Number(userId);

  if (pool) {
    try {
      await ensureReviewsTable();
      const result = await pool.query(
        `DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *`,
        [rId, uId]
      );
      return result.rows[0] || null;
    } catch (err) {
      console.warn("PG deleteReview failed:", err.message);
    }
  }

  const idx = memoryReviews.findIndex((r) => r.id === rId && r.user_id === uId);
  if (idx !== -1) {
    const deleted = memoryReviews.splice(idx, 1);
    return deleted[0];
  }

  return null;
};

const likeReview = async (id) => {
  const rId = Number(id);

  if (pool) {
    try {
      await ensureReviewsTable();
      const result = await pool.query(
        `UPDATE reviews SET likes = likes + 1 WHERE id = $1 RETURNING *`,
        [rId]
      );
      return result.rows[0] || null;
    } catch (err) {
      console.warn("PG likeReview failed:", err.message);
    }
  }

  const idx = memoryReviews.findIndex((r) => r.id === rId);
  if (idx !== -1) {
    memoryReviews[idx].likes = (memoryReviews[idx].likes || 0) + 1;
    return memoryReviews[idx];
  }

  return null;
};

module.exports = {
  getReviewsByMovie,
  addReview,
  updateReview,
  deleteReview,
  likeReview
};
