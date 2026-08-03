const express = require("express");
const router = express.Router();


const { trackActivity, getActivity } = require("../controllers/activityController");
const { authenticateToken } = require("../middleware/authMiddleware");


router.get("/", authenticateToken, getActivity);
router.post("/", authenticateToken, trackActivity);


module.exports = router;