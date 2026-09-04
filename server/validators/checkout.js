const { body } = require('express-validator');

const checkoutRules = [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
];

module.exports = { checkoutRules };
