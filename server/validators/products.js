const { query } = require('express-validator');

const productListRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('min_price').optional().isFloat({ min: 0 }).withMessage('Min price must be non-negative'),
  query('max_price').optional().isFloat({ min: 0 }).withMessage('Max price must be non-negative'),
];

module.exports = { productListRules };
