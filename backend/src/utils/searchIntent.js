const INTENTS = {
  anime: [
    "anime",
    "anime movie",
    "anime movies",
    "best anime"
  ],

  ghibli: [
    "ghibli",
    "studio ghibli"
  ],

  pixar: [
    "pixar"
  ],

  disney: [
    "disney"
  ],

  nolan: [
    "nolan",
    "christopher nolan"
  ],

  marvel: [
    "marvel",
    "mcu",
    "avengers"
  ],

  dc: [
    "dc",
    "batman",
    "superman"
  ],

  space: [
    "space",
    "astronaut",
    "mars",
    "galaxy",
    "interstellar"
  ],

  zombie: [
    "zombie",
    "undead"
  ],

  psychological: [
    "psychological",
    "mind bending",
    "mind-bending",
    "thriller"
  ],

  timetravel: [
    "time travel",
    "timetravel"
  ],

  mafia: [
    "mafia",
    "gangster",
    "godfather"
  ]
};

const detectIntent = (query = "") => {
  const text = query.toLowerCase().trim();

  for (const [intent, keywords] of Object.entries(INTENTS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return intent;
    }
  }

  return null;
};

module.exports = {
  detectIntent
};