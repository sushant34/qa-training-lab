const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { requireOwnershipOrTrainer } = require('../middleware/ownership');
const { generateSequentialId } = require('../services/idGenerator');
const { bugReportCreateRules, bugReportUpdateRules } = require('../validators/bugReports');
const validate = require('../middleware/validate');
const tryCatch = require('../middleware/tryCatch');

const router = express.Router();

router.get('/', authenticateToken, tryCatch(async (req, res) => {
  const { project_id, user_id } = req.query;

  let query = `
    SELECT br.*, r.req_id as requirement_req_id, tc.tc_id as test_case_tc_id
    FROM bug_reports br
    LEFT JOIN requirements r ON br.requirement_id = r.id
    LEFT JOIN test_cases tc ON br.test_case_id = tc.id
    WHERE 1=1
  `;
  const params = [];

  if (req.user.role === 'INTERN') {
    query += ' AND br.user_id = ?';
    params.push(req.user.id);
  } else if (user_id) {
    query += ' AND br.user_id = ?';
    params.push(user_id);
  }

  if (project_id) {
    query += ' AND br.project_id = ?';
    params.push(project_id);
  }

  query += ' ORDER BY br.created_at DESC';

  const bugReports = db.prepare(query).all(...params);
  res.json(bugReports);
}));

router.post('/', authenticateToken, bugReportCreateRules, validate, tryCatch(async (req, res) => {
  const { project_id, requirement_id, test_case_id, title, environment, steps_to_reproduce, expected_result, actual_result, severity, priority, screenshot, additional_notes } = req.body;

  if (!project_id || !title || !steps_to_reproduce || !expected_result || !actual_result) {
    return res.status(400).json({ error: 'Project, title, steps, expected result, and actual result are required' });
  }

  const bug_id = generateSequentialId('BUG', 'bug_reports', req.user.id);

  const result = db.prepare(
    `INSERT INTO bug_reports (user_id, project_id, requirement_id, test_case_id, bug_id, title, environment, steps_to_reproduce, expected_result, actual_result, severity, priority, screenshot, additional_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    req.user.id,
    project_id,
    requirement_id || null,
    test_case_id || null,
    bug_id,
    title,
    environment || null,
    steps_to_reproduce,
    expected_result,
    actual_result,
    severity || 'Medium',
    priority || 'P2',
    screenshot || null,
    additional_notes || null
  );

  const bugReport = db.prepare('SELECT * FROM bug_reports WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(bugReport);
}));

router.put('/:id', authenticateToken, requireOwnershipOrTrainer('bugReport'), bugReportUpdateRules, validate, tryCatch(async (req, res) => {
  const bugReport = req.entity;

  const { title, environment, steps_to_reproduce, expected_result, actual_result, severity, priority, screenshot, additional_notes, status } = req.body;

  db.prepare(
    `UPDATE bug_reports SET title = ?, environment = ?, steps_to_reproduce = ?, expected_result = ?, actual_result = ?, severity = ?, priority = ?, screenshot = ?, additional_notes = ?, status = ? WHERE id = ?`
  ).run(
    title !== undefined ? title : bugReport.title,
    environment !== undefined ? environment : bugReport.environment,
    steps_to_reproduce !== undefined ? steps_to_reproduce : bugReport.steps_to_reproduce,
    expected_result !== undefined ? expected_result : bugReport.expected_result,
    actual_result !== undefined ? actual_result : bugReport.actual_result,
    severity !== undefined ? severity : bugReport.severity,
    priority !== undefined ? priority : bugReport.priority,
    screenshot !== undefined ? screenshot : bugReport.screenshot,
    additional_notes !== undefined ? additional_notes : bugReport.additional_notes,
    status !== undefined ? status : bugReport.status,
    req.params.id
  );

  const updatedBugReport = db.prepare('SELECT * FROM bug_reports WHERE id = ?').get(req.params.id);
  res.json(updatedBugReport);
}));

router.delete('/:id', authenticateToken, requireOwnershipOrTrainer('bugReport'), tryCatch(async (req, res) => {
  db.prepare('DELETE FROM bug_reports WHERE id = ?').run(req.params.id);
  res.json({ message: 'Bug report deleted successfully' });
}));

module.exports = router;
