const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { calculateEvaluation, upsertEvaluation } = require('../services/evaluationService');
const tryCatch = require('../middleware/tryCatch');

const router = express.Router();

router.get('/my-score/:projectId', authenticateToken, tryCatch(async (req, res) => {
  const evaluation = calculateEvaluation(req.user.id, req.params.projectId);
  upsertEvaluation(evaluation, req.user.id, req.params.projectId);
  res.json(evaluation);
}));

router.get('/intern/:userId/:projectId', authenticateToken, requireRole('TRAINER'), tryCatch(async (req, res) => {
  const evaluation = calculateEvaluation(req.params.userId, req.params.projectId);
  upsertEvaluation(evaluation, req.params.userId, req.params.projectId);
  res.json(evaluation);
}));

router.get('/all-interns/:projectId', authenticateToken, requireRole('TRAINER'), tryCatch(async (req, res) => {
  const interns = db.prepare('SELECT id, username, email, full_name FROM users WHERE role = ?').all('INTERN');

  const results = interns.map(intern => {
    const evaluation = calculateEvaluation(intern.id, req.params.projectId);
    upsertEvaluation(evaluation, intern.id, req.params.projectId);
    return { intern, evaluation };
  });

  res.json(results);
}));

router.post('/reset/:userId/:projectId', authenticateToken, requireRole('TRAINER'), tryCatch(async (req, res) => {
  db.prepare('DELETE FROM evaluations WHERE user_id = ? AND project_id = ?').run(req.params.userId, req.params.projectId);
  db.prepare('DELETE FROM test_executions WHERE user_id = ? AND test_case_id IN (SELECT id FROM test_cases WHERE project_id = ?)').run(req.params.userId, req.params.projectId);
  db.prepare('DELETE FROM bug_reports WHERE user_id = ? AND project_id = ?').run(req.params.userId, req.params.projectId);
  db.prepare('DELETE FROM test_cases WHERE user_id = ? AND project_id = ?').run(req.params.userId, req.params.projectId);

  res.json({ message: 'Training attempt reset successfully' });
}));

module.exports = router;
