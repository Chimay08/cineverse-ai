export const detectIntent = (message) => {
  const lower = message.toLowerCase();

  if (
    lower.includes("old vibes") ||
    lower.includes("childhood") ||
    lower.includes("harry potter")
  ) {
    return "nostalgia";
  }

  if (
    lower.includes("feel good") ||
    lower.includes("happy") ||
    lower.includes("bad day")
  ) {
    return "feelGood";
  }

  if (
    lower.includes("zodiac") ||
    lower.includes("seven") ||
    lower.includes("taxi driver")
  ) {
    return "thriller";
  }

  return "general";
};