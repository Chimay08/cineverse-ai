const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[0] === "Bearer"
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({
      message: "Authorization token is required.",
      status: 401
    });
  }

  try {
    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET || "cineverse-dev-secret"
    );

    return next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token.",
      status: 403
    });
  }
};

module.exports = {
  authenticateToken
};
