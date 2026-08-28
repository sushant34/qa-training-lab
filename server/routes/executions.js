const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const { project_id, user_id } = req.query;

  let query = `
    SELECT te.*, tc.tc_id, tc.title as test_case_title, tc.requirement_id
    FROM test_executions te
    JOIN test_cases tc ON te.test_case_id = tc.id
    WHERE 1=1
  `;
  const params = [];

  if (req.user.role === 'INTERN') {
    query += ' AND te.user_id = ?';
    params.push(req.user.id);
  } else if (user_id) {
    query += ' AND te.user_id = ?';
    params.push(user_id);
  }

  if (project_id) {
    query += ' AND tc.project_id = ?';
    params.push(project_id);
  }

  query += ' ORDER BY te.executed_at DESC';

  const executions = db.prepare(query).all(...params);
  res.json(executions);
});

router.post('/', authenticateToken, (req, res) => {
  const { test_case_id, status, actual_result, comments, screenshot } = req.body;

  if (!test_case_id || !status) {
    return res.status(400).json({ error: 'Test case and status are required' });
  }

  const testCase = db.prepare('SELECT * FROM test_cases WHERE id = ?').get(test_case_id);

  if (!testCase) {
    return res.status(404).json({ error: 'Test case not found' });
  }

  const existingExecution = db.prepare(
    'SELECT * FROM test_executions WHERE user_id = ? AND test_case_id = ?'
  ).get(req.user.id, test_case_id);

  if (existingExecution) {
    db.prepare(
      'UPDATE test_executions SET status = ?, actual_result = ?, comments = ?, screenshot = ?, executed_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(status, actual_result || null, comments || null, screenshot || null, existingExecution.id);

    const updatedExecution = db.prepare('SELECT * FROM test_executions WHERE id = ?').get(existingExecution.id);
    return res.json(updatedExecution);
  }

  const result = db.prepare(
    'INSERT INTO test_executions (user_id, test_case_id, status, actual_result, comments, screenshot) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, test_case_id, status, actual_result || null, comments || null, screenshot || null);

  db.prepare('UPDATE test_cases SET status = ? WHERE id = ?').run('Executed', test_case_id);

  const execution = db.prepare('SELECT * FROM test_executions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(execution);
});

router.delete('/:id', authenticateToken, (req, res) => {
  const execution = db.prepare('SELECT * FROM test_executions WHERE id = ?').get(req.params.id);

  if (!execution) {
    return res.status(404).json({ error: 'Execution not found' });
  }

  if (req.user.role === 'INTERN' && execution.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.prepare('DELETE FROM test_executions WHERE id = ?').run(req.params.id);
  res.json({ message: 'Execution deleted successfully' });
});

module.exports = router;
