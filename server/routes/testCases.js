const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
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
});

router.post('/', authenticateToken, (req, res) => {
  const { project_id, requirement_id, title, preconditions, test_data, steps, expected_result, priority, test_type } = req.body;

  if (!project_id || !title || !steps || !expected_result) {
    return res.status(400).json({ error: 'Project, title, steps, and expected result are required' });
  }

  const lastTestCase = db.prepare(
    'SELECT tc_id FROM test_cases WHERE user_id = ? ORDER BY id DESC LIMIT 1'
  ).get(req.user.id);

  let nextNumber = 1;
  if (lastTestCase) {
    const match = lastTestCase.tc_id.match(/TC-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  const tc_id = `TC-${String(nextNumber).padStart(3, '0')}`;

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
});

router.put('/:id', authenticateToken, (req, res) => {
  const testCase = db.prepare('SELECT * FROM test_cases WHERE id = ?').get(req.params.id);

  if (!testCase) {
    return res.status(404).json({ error: 'Test case not found' });
  }

  if (req.user.role === 'INTERN' && testCase.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

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
});

router.delete('/:id', authenticateToken, (req, res) => {
  const testCase = db.prepare('SELECT * FROM test_cases WHERE id = ?').get(req.params.id);

  if (!testCase) {
    return res.status(404).json({ error: 'Test case not found' });
  }

  if (req.user.role === 'INTERN' && testCase.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.prepare('DELETE FROM test_executions WHERE test_case_id = ?').run(req.params.id);
  db.prepare('DELETE FROM test_cases WHERE id = ?').run(req.params.id);

  res.json({ message: 'Test case deleted successfully' });
});

module.exports = router;
