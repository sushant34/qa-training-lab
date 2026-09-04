const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireOwnershipOrTrainer } = require('../middleware/ownership');
const { generateSequentialId } = require('../services/idGenerator');
const tryCatch = require('../middleware/tryCatch');

const router = express.Router();

router.get('/', authenticateToken, tryCatch(async (req, res) => {
  const { project_id, user_id } = req.query;

  let query = 'SELECT tc.*, r.req_id as requirement_req_id FROM test_cases tc LEFT JOIN requirements r ON tc.requirement_id = r.id WHERE 1=1';
  const params = [];

  if (req.user.role === 'INTERN') {
    query += ' AND tc.user_id = ?';
    params.push(req.user.id);
  } else if (user_id) {
    query += ' AND tc.user_id = ?';
    params.push(user_id);
  }

  if (project_id) {
    query += ' AND tc.project_id = ?';
    params.push(project_id);
  }

  query += ' ORDER BY tc.created_at DESC';

  const testCases = db.prepare(query).all(...params);
  res.json(testCases);
}));

router.post('/', authenticateToken, tryCatch(async (req, res) => {
  const { project_id, requirement_id, title, preconditions, test_data, steps, expected_result, priority, test_type } = req.body;

  if (!project_id || !title || !steps || !expected_result) {
    return res.status(400).json({ error: 'Project, title, steps, and expected result are required' });
  }

  const tc_id = generateSequentialId('TC', 'test_cases', req.user.id);

  const result = db.prepare(
    `INSERT INTO test_cases (user_id, project_id, requirement_id, tc_id, title, preconditions, test_data, steps, expected_result, priority, test_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    req.user.id,
    project_id,
    requirement_id || null,
    tc_id,
    title,
    preconditions || null,
    test_data || null,
    steps,
    expected_result,
    priority || 'P2',
    test_type || 'Functional'
  );

  const testCase = db.prepare('SELECT * FROM test_cases WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(testCase);
}));

router.put('/:id', authenticateToken, requireOwnershipOrTrainer('testCase'), tryCatch(async (req, res) => {
  const testCase = req.entity;

  const { title, preconditions, test_data, steps, expected_result, priority, test_type, requirement_id } = req.body;

  db.prepare(
    `UPDATE test_cases SET title = ?, preconditions = ?, test_data = ?, steps = ?, expected_result = ?, priority = ?, test_type = ?, requirement_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).run(
    title || testCase.title,
    preconditions !== undefined ? preconditions : testCase.preconditions,
    test_data !== undefined ? test_data : testCase.test_data,
    steps || testCase.steps,
    expected_result || testCase.expected_result,
    priority || testCase.priority,
    test_type || testCase.test_type,
    requirement_id !== undefined ? requirement_id : testCase.requirement_id,
    req.params.id
  );

  const updatedTestCase = db.prepare('SELECT * FROM test_cases WHERE id = ?').get(req.params.id);
  res.json(updatedTestCase);
}));

router.delete('/:id', authenticateToken, requireOwnershipOrTrainer('testCase'), tryCatch(async (req, res) => {
  db.prepare('DELETE FROM test_executions WHERE test_case_id = ?').run(req.params.id);
  db.prepare('DELETE FROM test_cases WHERE id = ?').run(req.params.id);

  res.json({ message: 'Test case deleted successfully' });
}));

module.exports = router;
