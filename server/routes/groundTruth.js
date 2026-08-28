const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, requireRole('TRAINER'), (req, res) => {
  const { project_id } = req.query;

  let query = `
    SELECT gtb.*, r.req_id as requirement_req_id
    FROM ground_truth_bugs gtb
    LEFT JOIN requirements r ON gtb.requirement_id = r.id
    WHERE 1=1
  `;
  const params = [];

  if (project_id) {
    query += ' AND gtb.project_id = ?';
    params.push(project_id);
  }

  query += ' ORDER BY gtb.bug_id ASC';

  const groundTruthBugs = db.prepare(query).all(...params);
  res.json(groundTruthBugs);
});

router.get('/detection-status/:projectId', authenticateToken, requireRole('TRAINER'), (req, res) => {
  const projectId = req.params.projectId;

  const groundTruthBugs = db.prepare(`
    SELECT gtb.*, r.req_id as requirement_req_id
    FROM ground_truth_bugs gtb
    LEFT JOIN requirements r ON gtb.requirement_id = r.id
    WHERE gtb.project_id = ?
  `).all(projectId);

  const results = groundTruthBugs.map(bug => {
    const detected = db.prepare(`
      SELECT COUNT(*) as count FROM bug_reports br
      WHERE br.project_id = ? AND br.requirement_id = ?
    `).get(projectId, bug.requirement_id);

    return {
      ...bug,
      detection_status: detected.count > 0 ? 'Detected' : 'Not Detected'
    };
  });

  res.json(results);
});

module.exports = router;
