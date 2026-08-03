const { GoogleGenAI } = require("@google/genai");
const {
  searchMovies,
  fetchMovieById,
  fetchMoviesByLanguage
} = require("./tmdbService");
const { detectLanguage } = require("./intentService");

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const FALLBACK_RECOMMENDATIONS = [
  {
    title: "Interstellar",
    reason: "A sweeping, emotional sci-fi journey with big ideas and intimate stakes.",
    because: "Because CineVerse needs a baseline until Gemini is configured.",
    mood: "Emotional"
  },
  {
    title: "Arrival",
    reason: "Thoughtful science fiction built around language, memory, and human connection.",
    because: "Because thoughtful sci-fi is a reliable Concierge seed.",
    mood: "Reflective"
  },
  {
    title: "Blade Runner 2049",
    reason: "A visually rich future noir with a lonely, meditative atmosphere.",
    because: "Because your Concierge fallback leans cinematic and atmospheric.",
    mood: "Atmospheric"
  },
  {
    title: "Inception",
    reason: "A polished mind-bending thriller with scale, momentum, and layered mystery.",
    because: "Because puzzle-box stories are a strong default recommendation lane.",
    mood: "Mind-bending"
  },
  {
    title: "Her",
    reason: "A quiet futuristic romance about loneliness, intimacy, and technology.",
    because: "Because emotional genre films round out the recommendation set.",
    mood: "Tender"
  }
];

const buildPrompt = (message, userProfile = {}) => {
  return [
    "You are a movie recommendation assistant.",
    "Use the user's taste profile, search history, watch history, favorite genres, favorite directors, favorite actors, and favorite moods when relevant.",
    "Detect whether the current query is a movie title, mood, genre, actor, director, or situation, then merge that query with the user context.",
    "IMPORTANT:",
    "If the user mentions a language, recommend movies only from that language.",
    "Examples:",
    '"marathi movie" → Marathi movies only',
    '"hindi thriller" → Hindi thrillers only',
    "Do not recommend English movies unless explicitly requested.",
    "Return only valid JSON. Do not wrap it in markdown or add commentary.",
    "The JSON must be an array containing between 10 and 20 items.",
    "Each item must include title, reason, because, and mood.",
    `Combined user context: ${JSON.stringify(userProfile)}`,
    `User message: ${message}`,
  ].join("\n");
};

const extractJson = (text) => {
  const cleaned = String(text || "")
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  const objectStart = cleaned.indexOf("{");
  const objectEnd = cleaned.lastIndexOf("}");
  const arrayStart = cleaned.indexOf("[");
  const arrayEnd = cleaned.lastIndexOf("]");

  if (objectStart !== -1 && objectEnd !== -1) {
    return cleaned.slice(objectStart, objectEnd + 1);
  }

  if (arrayStart !== -1 && arrayEnd !== -1) {
    return cleaned.slice(arrayStart, arrayEnd + 1);
  }

  return cleaned;
};

const parseRecommendations = (text) => {
  const parsed = JSON.parse(extractJson(text));
  const recommendations = Array.isArray(parsed)
    ? parsed
    : parsed.recommendations;

  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    throw new Error("Gemini response did not include recommendations.");
  }

  return recommendations.slice(0, 20).map((recommendation) => ({
    title: recommendation.title,
    reason: recommendation.reason,
    because: recommendation.because,
    mood: recommendation.mood
  }));
};

const posterUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${TMDB_IMAGE_BASE}${path}`;
};

const enrichRecommendation = async (recommendation) => {
  const matches = await searchMovies(recommendation.title);
  const match = matches[0];

  if (!match?.id) {
    const error = new Error(
      `TMDB search did not find "${recommendation.title}".`
    );
    error.status = 502;
    throw error;
  }

  const details = await fetchMovieById(match.id);

  return {
    id: details.id,
    title: details.title || match.title || recommendation.title,
    poster: posterUrl(details.poster || match.poster),
    reason: recommendation.reason,
    because: recommendation.because,
    mood: recommendation.mood,
    rating: details.rating ?? match.rating ?? 0,
    releaseDate: details.releaseDate || null
  };
};

const getFallbackRecommendations = async (message) => {
  const query = String(message || "").trim();
  const langCode = detectLanguage(query);

  if (langCode) {
    try {
      const langMovies = await fetchMoviesByLanguage(langCode);
      if (langMovies.length > 0) {
        const sliced = langMovies.slice(0, 20);
        return sliced.map((movie) => ({
          id: movie.id,
          title: movie.title,
          poster: posterUrl(movie.poster),
          reason: `Popular movie in ${langCode.toUpperCase()} language.`,
          because: `Because you searched for ${query}.`,
          mood: "Regional",
          rating: Number(movie.rating || 0)
        }));
      }
    } catch (err) {
      console.warn("Language fallback search failed:", err.message);
    }
  }

  if (query) {
    try {
      const matches = await searchMovies(query);
      const match = matches[0];

      if (match?.id) {
        const { fetchMovieRecommendations } = require("./tmdbService");
        const related = await fetchMovieRecommendations(match.id);
        const recommendations = related.slice(0, 20).map((movie) => ({
          title: movie.title,
          reason: `Recommended because it shares DNA with ${match.title}.`,
          because: `Because you searched for ${query}.`,
          mood: "Similar"
        }));

        if (recommendations.length >= 5) {
          return Promise.all(
            recommendations.map((recommendation) =>
              enrichRecommendation(recommendation)
            )
          );
        }
      }
    } catch (error) {
      console.warn("Gemini fallback search recommendations failed:", error.message);
    }
  }

  const enriched = await Promise.all(
    FALLBACK_RECOMMENDATIONS.map((recommendation) =>
      enrichRecommendation(recommendation)
    )
  );

  return enriched;
};

const askGemini = async (message, userProfile = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return getFallbackRecommendations(message);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildPrompt(message, userProfile);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const recommendations = parseRecommendations(response.text || "");
    const enriched = await Promise.all(
      recommendations.map((recommendation) => enrichRecommendation(recommendation))
    );

    return enriched;
  } catch (err) {
    console.warn("Gemini AI request failed, falling back:", err.message);
    return getFallbackRecommendations(message);
  }
};

const explainRecommendations = async (candidateMovies = [], query = "", userProfile = {}) => {
  if (!Array.isArray(candidateMovies) || candidateMovies.length === 0) {
    return [];
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return candidateMovies.map((movie) => ({
      ...movie,
      reason: movie.reason || `Recommended based on your search for "${query}".`,
      because: movie.because || `Matches your search query "${query}".`,
      mood: movie.mood || "Curated"
    }));
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const movieTitles = candidateMovies.map((m) => m.title);

    const prompt = [
      "You are a movie concierge assistant.",
      `The user requested: "${query}"`,
      `User context: ${JSON.stringify(userProfile)}`,
      "You MUST generate short personalized explanations for these EXACT candidate movies (do NOT add, remove, or change titles):",
      JSON.stringify(movieTitles),
      "Return ONLY a valid JSON array of objects. Each object must correspond to a movie title in order and have keys:",
      '{"title": "<exact movie title>", "reason": "<1 sentence explanation>", "because": "<1 sentence context>", "mood": "<1 word mood>"}',
      "Do not wrap in markdown or add extra text."
    ].join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const parsed = JSON.parse(extractJson(response.text || "[]"));

    if (Array.isArray(parsed) && parsed.length > 0) {
      const map = new Map();
      parsed.forEach((item) => {
        if (item?.title) {
          map.set(item.title.toLowerCase().trim(), item);
        }
      });

      return candidateMovies.map((movie) => {
        const explanation = map.get(movie.title?.toLowerCase().trim());
        return {
          ...movie,
          reason: explanation?.reason || movie.reason || `Recommended based on your search for "${query}".`,
          because: explanation?.because || movie.because || `Matches your search query "${query}".`,
          mood: explanation?.mood || movie.mood || "Curated"
        };
      });
    }
  } catch (err) {
    console.warn("Gemini explanation failed, using default reasons:", err.message);
  }

  return candidateMovies.map((movie) => ({
    ...movie,
    reason: movie.reason || `Recommended based on your search for "${query}".`,
    because: movie.because || `Matches your search query "${query}".`,
    mood: movie.mood || "Curated"
  }));
};

module.exports = {
  buildPrompt,
  askGemini,
  explainRecommendations
};
