const languages = {
  marathi: "mr",
  hindi: "hi",
  tamil: "ta",
  telugu: "te",
  malayalam: "ml",
  korean: "ko",
  japanese: "ja",
};

function detectLanguage(query) {
  if (!query) return null;
  const lower = query.toLowerCase();

  for (const language in languages) {
    if (lower.includes(language)) {
      return languages[language];
    }
  }

  return null;
}

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const titleCase = (value) =>
  String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const MOVIES = [
  { key: "seven", movie: "Se7en", genre: "Crime", mood: "Dark" },
  { key: "se7en", movie: "Se7en", genre: "Crime", mood: "Dark" },
  { key: "interstellar", movie: "Interstellar", genre: "Science Fiction", mood: "Emotional" },
  { key: "tenet", movie: "Tenet", genre: "Science Fiction", mood: "Mind-bending" },
  { key: "zodiac", movie: "Zodiac", genre: "Crime", mood: "Dark" },
  { key: "harry potter", movie: "Harry Potter", genre: "Fantasy", mood: "Nostalgic" },
  { key: "troy", movie: "Troy", genre: "Action", mood: "Epic" }
];

const DIRECTORS = [
  "christopher nolan",
  "david fincher",
  "quentin tarantino",
  "steven spielberg",
  "denis villeneuve",
  "martin scorsese",
  "ridley scott"
];

const ACTORS = [
  "leonardo dicaprio",
  "brad pitt",
  "tom hanks",
  "tom cruise",
  "ryan gosling",
  "morgan freeman",
  "emma stone",
  "zendaya"
];

const GENRES = [
  { keys: ["sci fi", "sci-fi", "science fiction"], genre: "Science Fiction", mood: "Mind-bending" },
  { keys: ["thriller"], genre: "Thriller", mood: "Tense" },
  { keys: ["horror"], genre: "Horror", mood: "Dark" },
  { keys: ["action"], genre: "Action", mood: "Energetic" },
  { keys: ["comedy", "funny"], genre: "Comedy", mood: "Funny" },
  { keys: ["crime"], genre: "Crime", mood: "Dark" },
  { keys: ["family"], genre: "Family", mood: "Feel good" },
  { keys: ["fantasy"], genre: "Fantasy", mood: "Wonder" }
];

const MOODS = [
  { keys: ["feel good", "comfort", "uplifting"], mood: "Feel good" },
  { keys: ["emotional", "heartfelt"], mood: "Emotional" },
  { keys: ["dark", "gritty"], mood: "Dark" },
  { keys: ["mind bending", "mind-bending", "trippy"], mood: "Mind-bending" },
  { keys: ["nostalgic"], mood: "Nostalgic" },
  { keys: ["funny"], mood: "Funny" },
  { keys: ["tense"], mood: "Tense" }
];

const SITUATIONS = [
  { keys: ["rainy night"], situation: "Rainy night", mood: "Cozy" },
  { keys: ["family movie"], situation: "Family movie", mood: "Feel good" },
  { keys: ["weekend binge"], situation: "Weekend binge", mood: "Binge-worthy" },
  { keys: ["late night watch", "late night"], situation: "Late night watch", mood: "Dark" },
  { keys: ["date night"], situation: "Date night", mood: "Romantic" }
];

const findMatch = (query, entries, field) => {
  for (const entry of entries) {
    const keys = entry.keys || [entry.key || entry];
    const match = keys.find((key) => query.includes(key));

    if (match) {
      return { entry, value: entry[field] || titleCase(entry) };
    }
  }

  return null;
};

const detectIntent = (query) => {
  const normalized = normalize(query);
  const entities = {};
  const signals = [];

  const detectedLang = detectLanguage(query || "");
  if (detectedLang) {
    entities.language = detectedLang;
    signals.push("LANGUAGE");
  }

  if (!normalized) {
    return {
      type: "SITUATION",
      confidence: 0.4,
      entities
    };
  }

  const movie = findMatch(normalized, MOVIES, "movie");
  if (movie) {
    entities.movie = movie.entry.movie;
    entities.genre = entities.genre || movie.entry.genre;
    entities.mood = entities.mood || movie.entry.mood;
    signals.push("MOVIE_TITLE");
  }

  const directorName = DIRECTORS.find((director) => normalized.includes(director));
  if (directorName || /\b(director|directed by|filmmaker)\b/.test(normalized)) {
    entities.director = directorName ? titleCase(directorName) : titleCase(normalized.replace(/\b(movies|films|director|directed by|filmmaker)\b/g, "").trim());
    signals.push("DIRECTOR");
  }

  const actorName = ACTORS.find((actor) => normalized.includes(actor));
  if (actorName || /\b(actor|actress|starring)\b/.test(normalized)) {
    entities.actor = actorName ? titleCase(actorName) : titleCase(normalized.replace(/\b(movies|films|actor|actress|starring)\b/g, "").trim());
    signals.push("ACTOR");
  }

  const genre = findMatch(normalized, GENRES, "genre");
  if (genre) {
    entities.genre = genre.entry.genre;
    entities.mood = entities.mood || genre.entry.mood;
    signals.push("GENRE");
  }

  const mood = findMatch(normalized, MOODS, "mood");
  if (mood) {
    entities.mood = mood.entry.mood;
    signals.push("MOOD");
  }

  const situation = findMatch(normalized, SITUATIONS, "situation");
  if (situation) {
    entities.situation = situation.entry.situation;
    entities.mood = entities.mood || situation.entry.mood;
    signals.push("SITUATION");
  }

  const uniqueSignals = [...new Set(signals)];

  if (uniqueSignals.length > 1) {
    return {
      type: "MIXED_QUERY",
      confidence: 0.9,
      entities
    };
  }

  if (uniqueSignals.length === 1) {
    return {
      type: uniqueSignals[0],
      confidence: uniqueSignals[0] === "MOVIE_TITLE" ? 0.95 : 0.88,
      entities
    };
  }

  return {
    type: "MOVIE_TITLE",
    confidence: 0.65,
    entities: {
      movie: titleCase(normalized),
      ...(detectedLang ? { language: detectedLang } : {})
    }
  };
};

function detectSearchType(query) {
  if (!query || typeof query !== "string") {
    return { type: "UNKNOWN", value: "" };
  }

  const lower = query.toLowerCase().trim();
  const normalized = normalize(query);

  // 1. Language detection
  const detectedLangCode = detectLanguage(query);
  if (detectedLangCode) {
    const langKey = Object.keys(languages).find((k) => languages[k] === detectedLangCode) || lower;
    return {
      type: "LANGUAGE",
      value: langKey,
      langCode: detectedLangCode
    };
  }

  // 2. Director detection
  const directorMatch = DIRECTORS.find((d) => lower.includes(d));
  if (directorMatch) {
    return {
      type: "DIRECTOR",
      value: titleCase(directorMatch)
    };
  }
  if (/\b(director|directed by|filmmaker)\b/.test(lower)) {
    const cleaned = titleCase(lower.replace(/\b(movies|films|director|directed by|filmmaker)\b/g, "").trim());
    if (cleaned) {
      return { type: "DIRECTOR", value: cleaned };
    }
  }

  // 3. Actor detection
  const actorMatch = ACTORS.find((a) => lower.includes(a));
  if (actorMatch) {
    return {
      type: "ACTOR",
      value: titleCase(actorMatch)
    };
  }
  if (/\b(actor|actress|starring)\b/.test(lower)) {
    const cleaned = titleCase(lower.replace(/\b(movies|films|actor|actress|starring)\b/g, "").trim());
    if (cleaned) {
      return { type: "ACTOR", value: cleaned };
    }
  }

  // 4. Specific Movie title aliases
  const knownMovie = MOVIES.find((m) => lower === m.key || lower.includes(m.key));
  if (knownMovie) {
    return {
      type: "MOVIE",
      value: knownMovie.movie
    };
  }

  // 5. Genre detection
  const genreMatch = findMatch(lower, GENRES, "genre");
  if (genreMatch && lower.split(" ").length <= 3) {
    return {
      type: "GENRE",
      value: genreMatch.value
    };
  }

  // 6. Mood detection
  const moodMatch = findMatch(lower, MOODS, "mood");
  if (moodMatch && lower.split(" ").length <= 3) {
    return {
      type: "MOOD",
      value: moodMatch.value
    };
  }

  // Default fallback: MOVIE title search
  return {
    type: "MOVIE",
    value: titleCase(normalized || query)
  };
}

module.exports = {
  detectIntent,
  detectLanguage,
  detectSearchType,
  languages
};
