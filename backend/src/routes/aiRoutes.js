const express = require("express");
const { chatWithAI } = require("../controllers/aiController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ status: "AI route working" });
});

router.post("/chat", authenticateToken, chatWithAI);

module.exports = router;
