const { body } = require('express-validator');

const testCaseCreateRules = [
  body('project_id').isInt({ min: 1 }).withMessage('Valid project ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('steps').trim().notEmpty().withMessage('Steps are required'),
  body('expected_result').trim().notEmpty().withMessage('Expected result is required'),
  body('priority').optional().isIn(['P0', 'P1', 'P2', 'P3']).withMessage('Invalid priority'),
  body('test_type').optional().isIn(['Functional', 'UI/UX', 'Security', 'Performance', 'API']).withMessage('Invalid test type'),
];

const testCaseUpdateRules = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('steps').optional().trim().notEmpty().withMessage('Steps cannot be empty'),
  body('expected_result').optional().trim().notEmpty().withMessage('Expected result cannot be empty'),
  body('priority').optional().isIn(['P0', 'P1', 'P2', 'P3']).withMessage('Invalid priority'),
  body('test_type').optional().isIn(['Functional', 'UI/UX', 'Security', 'Performance', 'API']).withMessage('Invalid test type'),
];

module.exports = { testCaseCreateRules, testCaseUpdateRules };
