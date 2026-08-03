const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const ensureUsersTable = async () => {
  if (!pool) {
    const error = new Error("Database is not configured.");
    error.status = 503;
    throw error;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `);
};

const createUser = async ({ name, email, password }) => {
  await ensureUsersTable();

  const username = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [
    normalizedEmail
  ]);

  if (existingUser.rows.length > 0) {
    const error = new Error("User already exists.");
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (username, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at`,
    [username, normalizedEmail, hashedPassword]
  );

  return result.rows[0];
};

const loginUser = async ({ email, password }) => {
  await ensureUsersTable();

  const normalizedEmail = email.trim().toLowerCase();
  const result = await pool.query(
    "SELECT id, username, email, password, created_at FROM users WHERE email = $1",
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    const error = new Error("Invalid email or password.");
    error.status = 401;
    throw error;
  }

  const user = result.rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password.");
    error.status = 401;
    throw error;
  }

  delete user.password;

  return user;
};

module.exports = {
  createUser,
  loginUser
};
