const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/database');
const env = require('../config/env');
const logger = require('../config/logger');
const { authenticateToken } = require('../middleware/auth');
const tryCatch = require('../middleware/tryCatch');

const router = express.Router();
const JWT_SECRET = env.JWT_SECRET;

router.post('/login', tryCatch(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) {
    logger.warn({ username }, 'Login failed: user not found');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPassword = bcrypt.compareSync(password, user.password);

  if (!validPassword) {
    logger.warn({ username, userId: user.id }, 'Login failed: invalid password');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  logger.info({ userId: user.id, username }, 'Login successful');

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    },
  });
}));

router.post('/register', tryCatch(async (req, res) => {
  const { username, email, password, full_name } = req.body;

  if (!username || !email || !password || !full_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);

  if (existingUser) {
    return res.status(409).json({ error: 'Username or email already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, env.BCRYPT_SALT_ROUNDS);

  const result = db.prepare(
    'INSERT INTO users (username, email, password, role, full_name) VALUES (?, ?, ?, ?, ?)'
  ).run(username, email, hashedPassword, 'INTERN', full_name);

  logger.info({ userId: result.lastInsertRowid, username }, 'User registered');

  const token = jwt.sign(
    { userId: result.lastInsertRowid, role: 'INTERN' },
    JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  res.status(201).json({
    token,
    user: {
      id: result.lastInsertRowid,
      username,
      email,
      role: 'INTERN',
      full_name,
    },
  });
}));

router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
