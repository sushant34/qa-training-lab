const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const { project_id } = req.query;

  let query = 'SELECT * FROM requirements';
  const params = [];

  if (project_id) {
    query += ' WHERE project_id = ?';
    params.push(project_id);
  }

  query += ' ORDER BY req_id ASC';

  const requirements = db.prepare(query).all(...params);
  res.json(requirements);
});

router.get('/:id', authenticateToken, (req, res) => {
  const requirement = db.prepare('SELECT * FROM requirements WHERE id = ?').get(req.params.id);

  if (!requirement) {
    return res.status(404).json({ error: 'Requirement not found' });
  }

  res.json(requirement);
});

module.exports = router;
