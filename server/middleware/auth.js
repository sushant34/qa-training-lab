const jwt = require('jsonwebtoken');
const db = require('../models/database');
const env = require('../config/env');
const logger = require('../config/logger');

const JWT_SECRET = env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, username, email, role, full_name FROM users WHERE id = ?').get(decoded.userId);

    if (!user) {
      logger.warn({ userId: decoded.userId }, 'Token valid but user not found');
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn({ error: error.message }, 'Token validation failed');
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Access denied. Required role: ${role}` });
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole };
