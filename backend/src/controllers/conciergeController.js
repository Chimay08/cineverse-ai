const { generateSections } = require("../services/recommendationEngine");

const getHomeRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authenticated user is required" });
    }

    const sections = await generateSections(userId);

    return res.json(sections);
  } catch (error) {
    console.error("Concierge home failed:", error);

    return res.status(500).json({
      message: "Failed to load Concierge recommendations",
      error: error.message
    });
  }
};

module.exports = {
  getHomeRecommendations
};
