module.exports = require("../src/services/recommendationEngine");
function calculateSimilarity(userA, userB) {
  let score = 0;

  const sameGenres = userA.genres.filter(
    (genre) => userB.genres.includes(genre)
  ).length;

  const sameDirectors = userA.directors.filter(
    (director) => userB.directors.includes(director)
  ).length;

  const sameActors = userA.actors.filter(
    (actor) => userB.actors.includes(actor)
  ).length;

  const sameSearches = userA.searches.filter(
    (search) => userB.searches.includes(search)
  ).length;

  const sameMovies = userA.movies.filter(
    (movie) => userB.movies.includes(movie)
  ).length;

  score += sameGenres * 30;
  score += sameDirectors * 25;
  score += sameActors * 20;
  score += sameSearches * 15;
  score += sameMovies * 10;

  return score;
}

module.exports = {
  calculateSimilarity,
};