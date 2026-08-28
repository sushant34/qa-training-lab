const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, requireRole('TRAINER'), (req, res) => {
  const users = db.prepare('SELECT id, username, email, role, full_name, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

router.get('/interns', authenticateToken, requireRole('TRAINER'), (req, res) => {
  const interns = db.prepare('SELECT id, username, email, role, full_name, created_at FROM users WHERE role = ? ORDER BY created_at DESC').all('INTERN');
  res.json(interns);
});

router.get('/:id', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, username, email, role, full_name, created_at FROM users WHERE id = ?').get(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

module.exports = router;
