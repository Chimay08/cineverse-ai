const jwt = require("jsonwebtoken");
const { createUser, loginUser } = require("../services/authService");

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const name = req.body.name || req.body.username;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Username, email, and password are required.",
        status: 400
      });
    }

    if (!isValidEmail(String(email))) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
        status: 400
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
        status: 400
      });
    }

    const user = await createUser({
      name: String(name),
      email: String(email),
      password: String(password)
    });

    return res.status(201).json({
      message: "User registered successfully.",
      user
    });
  } catch (error) {
    const status = error.status || 500;

    console.error("Register request failed:", {
      status,
      message: error.message
    });

    return res.status(status).json({
      message:
        status === 500 ? "Unable to register user. Please try again." : error.message,
      status
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
        status: 400
      });
    }

    if (!isValidEmail(String(email))) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
        status: 400
      });
    }

    const user = await loginUser({
      email: String(email),
      password: String(password)
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET || "cineverse-dev-secret",
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful.",
      token,
      user
    });
  } catch (error) {
    const status = error.status || 500;

    console.error("Login request failed:", {
      status,
      message: error.message
    });

    return res.status(status).json({
      message: status === 500 ? "Unable to login. Please try again." : error.message,
      status
    });
  }
};

module.exports = {
  register,
  login
};
