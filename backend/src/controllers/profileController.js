const {
  getGenreDistribution,
  getFavoriteDirectors,
  getFavoriteActors,
  getCinemaMap
} = require("../services/activityService");

const getTasteProfile = async (req, res) => {

    try {

        const userId = req.user.id;

        const genres =
            await getGenreDistribution(userId);

        const total =
            genres.reduce(
                (sum, g) => sum + Number(g.total),
                0
            );

        const profile =
            genres.map(g => ({

                genre: g.genre,

                percentage: Math.round(
                    (Number(g.total) / total) * 100
                )

            }));

        res.json(profile);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to load taste profile"
        });

    }

};
const getDirectorsProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const directors = await getFavoriteDirectors(userId);

    res.json(directors);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load directors profile"
    });
  }
};
const getActorsProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const actors = await getFavoriteActors(userId);

    res.json(actors);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load actors profile"
    });
  }
};
const getCinemaProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const countries = await getCinemaMap(userId);

    res.json(countries);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load cinema map"
    });
  }
};

module.exports = {
    getTasteProfile,
    getDirectorsProfile,
    getActorsProfile,
    getCinemaProfile
};
