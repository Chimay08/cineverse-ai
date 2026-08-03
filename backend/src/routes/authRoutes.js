const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");

const postOnly = (endpoint, exampleBody) => (req, res) => {
  res.status(405).json({
    message: `${endpoint} must be called with POST in Postman.`,
    method: "POST",
    endpoint,
    headers: {
      "Content-Type": "application/json"
    },
    exampleBody
  });
};

router.get(
  "/register",
  postOnly("/auth/register", {
    username: "testuser",
    email: "test@example.com",
    password: "password123"
  })
);

router.get(
  "/login",
  postOnly("/auth/login", {
    email: "test@example.com",
    password: "password123"
  })
);

router.post("/register", register);
router.post("/login", login);

module.exports = router;
