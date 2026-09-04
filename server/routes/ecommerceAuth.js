const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const env = require('../config/env');
const logger = require('../config/logger');

const router = express.Router();
const JWT_SECRET = env.JWT_SECRET;

router.post('/register', (req, res) => {
  const { username, email, password, confirmPassword, full_name } = req.body;

  if (!username || !email || !password || !full_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);

  if (existingUser) {
    return res.status(409).json({ error: 'Username or email already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, env.BCRYPT_SALT_ROUNDS);

  const result = db.prepare(
    'INSERT INTO users (username, email, password, role, full_name) VALUES (?, ?, ?, ?, ?)'
  ).run(username, email, hashedPassword, 'INTERN', full_name);

  logger.info({ userId: result.lastInsertRowid, username }, 'Ecommerce user registered');

  const token = jwt.sign(
    { userId: result.lastInsertRowid, role: 'INTERN', context: 'ecommerce' },
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
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) {
    logger.warn({ username }, 'Ecommerce login failed: user not found');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPassword = bcrypt.compareSync(password, user.password);

  if (!validPassword) {
    logger.warn({ username, userId: user.id }, 'Ecommerce login failed: invalid password');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  logger.info({ userId: user.id, username }, 'Ecommerce login successful');

  const token = jwt.sign(
    { userId: user.id, role: user.role, context: 'ecommerce' },
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
});

router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', authenticateToken, (req, res) => {
  const { full_name, email, current_password, new_password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (email && email !== user.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.user.id);
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }
  }

  if (new_password) {
    if (!current_password) {
      return res.status(400).json({ error: 'Current password is required to set new password' });
    }
    const validPassword = bcrypt.compareSync(current_password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    const hashedPassword = bcrypt.hashSync(new_password, env.BCRYPT_SALT_ROUNDS);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, req.user.id);
  }

  if (full_name || email) {
    db.prepare('UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email) WHERE id = ?')
      .run(full_name || null, email || null, req.user.id);
  }

  const updatedUser = db.prepare('SELECT id, username, email, role, full_name FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: updatedUser });
});

module.exports = router;
