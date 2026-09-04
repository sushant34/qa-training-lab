const { body } = require('express-validator');

const reviewCreateRules = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('comment').optional().trim().notEmpty().withMessage('Comment cannot be empty'),
];

module.exports = { reviewCreateRules };
