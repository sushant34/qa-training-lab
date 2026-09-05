const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const tryCatch = require('../middleware/tryCatch');

const router = express.Router();

// Validate a coupon code
router.post('/validate', authenticateToken, tryCatch(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Coupon code is required' });
  }

  // BUG-044: Coupon validation is case-sensitive
  // Should use UPPER(code) = UPPER(?) for case-insensitive matching
  const coupon = db.prepare(
    'SELECT * FROM coupons WHERE code = ? AND is_active = 1'
  ).get(code);

  if (!coupon) {
    return res.status(404).json({ error: 'Invalid coupon code' });
  }

  // BUG-045: Expired coupon check is missing
  // Should check: if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
  // This check is intentionally not implemented

  // BUG-046: max_uses limit is not enforced
  // Should check: if (coupon.max_uses && coupon.used_count >= coupon.max_uses)
  // This check is intentionally not implemented

  // Calculate discount
  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = coupon.discount_value; // Percentage to be applied later
  } else {
    discount = coupon.discount_value; // Fixed amount
  }

  res.json({
    code: coupon.code,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    min_order_amount: coupon.min_order_amount,
  });
}));

// Increment coupon usage (called during checkout)
router.post('/use/:code', authenticateToken, tryCatch(async (req, res) => {
  const { code } = req.params;

  const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(code);
  if (!coupon) {
    return res.status(404).json({ error: 'Invalid coupon code' });
  }

  db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?').run(coupon.id);
  res.json({ success: true });
}));

module.exports = router;
