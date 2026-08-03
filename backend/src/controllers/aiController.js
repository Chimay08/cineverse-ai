const {
  buildUserContext,
  buildSearchSections
} = require("../services/recommendationEngine");
const { saveSearch } = require("../services/historyService");

const chatWithAI = async (req, res) => {
  try {
    const message = (req.body?.message || req.body?.prompt || "").trim();

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authenticated user is required" });
    }

    await saveSearch(userId, message);

    const searchSections = await buildSearchSections(userId, message);
    const movies = searchSections.similarMovies || [];

    return res.json({ movies, reply: movies, searchSections });
  } catch (error) {
    const status = error.status || 500;

    return res.status(status).json({
      message: "AI chat failed",
      error: error.message,
    });
  }
};

module.exports = {
  chatWithAI,
};
