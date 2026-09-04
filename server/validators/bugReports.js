const { body } = require('express-validator');

const bugReportCreateRules = [
  body('project_id').isInt({ min: 1 }).withMessage('Valid project ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('steps_to_reproduce').trim().notEmpty().withMessage('Steps to reproduce are required'),
  body('expected_result').trim().notEmpty().withMessage('Expected result is required'),
  body('actual_result').trim().notEmpty().withMessage('Actual result is required'),
  body('severity').optional().isIn(['Critical', 'High', 'Medium', 'Low']).withMessage('Invalid severity'),
  body('priority').optional().isIn(['P0', 'P1', 'P2', 'P3']).withMessage('Invalid priority'),
];

const bugReportUpdateRules = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('steps_to_reproduce').optional().trim().notEmpty().withMessage('Steps cannot be empty'),
  body('expected_result').optional().trim().notEmpty().withMessage('Expected result cannot be empty'),
  body('actual_result').optional().trim().notEmpty().withMessage('Actual result cannot be empty'),
  body('severity').optional().isIn(['Critical', 'High', 'Medium', 'Low']).withMessage('Invalid severity'),
  body('priority').optional().isIn(['P0', 'P1', 'P2', 'P3']).withMessage('Invalid priority'),
  body('status').optional().isIn(['Open', 'Under Review', 'Resolved', 'Rejected']).withMessage('Invalid status'),
];

module.exports = { bugReportCreateRules, bugReportUpdateRules };
