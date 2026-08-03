const {
  fetchAnimeMovies,
  fetchSpaceMovies,
  fetchMarvelMovies,
  fetchNolanMovies,
  fetchGhibliMovies,
  fetchPixarMovies,
  fetchDisneyMovies
} = require("../services/tmdbService");

// Central registry: intent (from detectIntent) -> fetch function.
// To add a new smart-search category, implement its fetch function in
// tmdbService and add ONE line here. No controller changes required.
const SEARCH_HANDLERS = {
  anime: fetchAnimeMovies,
  space: fetchSpaceMovies,
  marvel: fetchMarvelMovies,
  nolan: fetchNolanMovies,
  ghibli: fetchGhibliMovies,
  pixar: fetchPixarMovies,
  disney: fetchDisneyMovies
};

module.exports = {
  SEARCH_HANDLERS
};
