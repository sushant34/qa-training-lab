const { body } = require('express-validator');

const cartAddRules = [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
];

const cartUpdateRules = [
  body('product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('quantity').isInt().withMessage('Quantity must be an integer'),
];

module.exports = { cartAddRules, cartUpdateRules };
