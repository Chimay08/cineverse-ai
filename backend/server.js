const express = require("express");
const cors = require("cors");
const path = require("path");


// load env variables
require("dotenv").config({
  path: path.join(__dirname, ".env")
});

const pool = require("./src/config/db");
const movieRoutes = require("./src/routes/movieroutes");
const authRoutes = require("./src/routes/authRoutes");
const watchlistRoutes =
require("./src/routes/watchlistRoutes");
const activityRoutes = require("./src/routes/activityRoutes");
const recommendationRoutes =
require("./src/routes/recommendationRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const conciergeRoutes = require("./src/routes/conciergeRoutes");

const app = express();

// debug: inspect imported route modules
console.log('movieRoutes type:', movieRoutes && movieRoutes.stack ? 'router (has stack)' : typeof movieRoutes);
console.log('authRoutes type:', authRoutes && authRoutes.stack ? 'router (has stack)' : typeof authRoutes);
console.log('watchlistRoutes type:', watchlistRoutes && watchlistRoutes.stack ? 'router (has stack)' : typeof watchlistRoutes, 'stackLen:', watchlistRoutes && watchlistRoutes.stack ? watchlistRoutes.stack.length : 0);

if (pool) {
  pool.query("SELECT NOW()", (err, result) => {
    if (err) {
      console.warn("Database check failed:", err.message);
      return;
    }

    console.log("Database connected:", result.rows[0]);
  });
} else {
  console.log("Database config not found. Skipping database connection check.");
}

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Cineverse API is running",
    endpoints: [
      "/movies/popular",
      "/movies/top-rated",
      "/movies/top_rated",
      "/movies/now-playing",
      "/movies/now_playing",
      "/movies/upcoming",
      "/movies/trending",
      "/movies/search?query=avatar",
      "/movies/:id",
      "/movies/:id/trailer",
      "/movies/:id/cast",
      "/movies/:id/recommendations",
      "/auth/register",
      "/auth/login",
      "/watchlist",
      "/watchlist/add",
      "/watchlist/my",
      "/api/watchlist",
      "/api/watchlist/add",
      "/api/watchlist/my",
      "/ai/test",
      "/ai/chat",
      "/api/ai/test",
      "/api/ai/chat",
      "/api/concierge/home"
    ]
  });
});

app.use("/movies", movieRoutes);
app.use("/api/movies", movieRoutes);
app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/watchlist", watchlistRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/activity", activityRoutes);
app.use("/recommendations", recommendationRoutes);
app.use("/profile", profileRoutes);
app.use("/ai", aiRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/concierge", conciergeRoutes);
// debug: safe list registered routes
const listRoutes = () => {
  try {
    console.log("Registered routes:");
    const stack = app && app._router && Array.isArray(app._router.stack) ? app._router.stack : [];
    stack.forEach((middleware) => {
      try {
        if (middleware && middleware.route && middleware.route.path) {
          const methods = Object.keys(middleware.route.methods || {}).join(",");
          console.log(`${methods.toUpperCase()} ${middleware.route.path}`);
        } else if (middleware && (middleware.name === 'router' || middleware.handle) && middleware.handle && Array.isArray(middleware.handle.stack)) {
          middleware.handle.stack.forEach((handler) => {
            if (handler && handler.route && handler.route.path) {
              const methods = Object.keys(handler.route.methods || {}).join(",");
              console.log(`${methods.toUpperCase()} ${handler.route.path}`);
            }
          });
        }
      } catch (innerErr) {
        console.log('route handler parse error', innerErr && innerErr.message ? innerErr.message : innerErr);
      }
    });
  } catch (err) {
    console.log('listRoutes error', err && err.message ? err.message : err);
  }
};
listRoutes();
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    endpoints: [
      "/movies/popular",
      "/movies/top-rated",
      "/movies/top_rated",
      "/movies/now-playing",
      "/movies/now_playing",
      "/movies/upcoming",
      "/movies/trending",
      "/movies/search?query=avatar",
      "/movies/:id",
      "/movies/:id/trailer",
      "/movies/:id/cast",
      "/movies/:id/recommendations",
      "/auth/register",
      "/auth/login",
      "/watchlist",
      "/watchlist/add",
      "/watchlist/my",
      "/api/watchlist",
      "/api/watchlist/add",
      "/api/watchlist/my",
      "/ai/test",
      "/ai/chat",
      "/api/ai/test",
      "/api/ai/chat",
      "/api/concierge/home"
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
