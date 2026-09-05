const express = require('express');
const db = require('../models/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { checkoutRules } = require('../validators/checkout');
const validate = require('../middleware/validate');
const tryCatch = require('../middleware/tryCatch');

const router = express.Router();

router.post('/', authenticateToken, checkoutRules, validate, tryCatch(async (req, res) => {
  const { full_name, email, phone, address, coupon_code } = req.body;

  // BUG-008: Checkout allows submission without phone number
  // This check is intentionally missing for phone

  const cartItems = db.prepare(`
    SELECT ci.*, p.name, p.price
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `).all(req.user.id);

  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  let totalAmount = 0;
  cartItems.forEach(item => {
    // BUG-007: Cart total is incorrectly calculated
    if (item.product_id === 3 || item.product_id === 7 || item.product_id === 12) {
      totalAmount += item.price * item.quantity + 1;
    } else {
      totalAmount += item.price * item.quantity;
    }
  });

  // Apply coupon discount if provided
  let discount = 0;
  let appliedCoupon = null;
  if (coupon_code) {
    // BUG-044: Case-sensitive coupon lookup (reuses the same bug from coupons.js)
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(coupon_code);
    if (coupon) {
      // BUG-045: No expiry check
      // BUG-046: No max_uses check
      if (coupon.discount_type === 'percentage') {
        discount = totalAmount * (coupon.discount_value / 100);
      } else {
        discount = Math.min(coupon.discount_value, totalAmount);
      }
      appliedCoupon = coupon.code;
      db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?').run(coupon.id);
    }
  }

  const finalAmount = Math.max(0, totalAmount - discount);

  const orderResult = db.prepare(
    'INSERT INTO orders (user_id, full_name, email, phone, address, total_amount) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, full_name, email, phone || null, address, finalAmount);

  cartItems.forEach(item => {
    db.prepare(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
    ).run(orderResult.lastInsertRowid, item.product_id, item.quantity, item.price);
  });

  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderResult.lastInsertRowid);
  const orderItems = db.prepare(`
    SELECT oi.*, p.name
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `).all(orderResult.lastInsertRowid);

  res.status(201).json({ order, items: orderItems, discount, applied_coupon: appliedCoupon });
}));

router.get('/history', authenticateToken, tryCatch(async (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);

  const ordersWithItems = orders.map(order => {
    const items = db.prepare(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id);
    return { ...order, items };
  });

  res.json(ordersWithItems);
}));

// Update order status (Trainer only)
router.put('/:id/status', authenticateToken, requireRole('TRAINER'), tryCatch(async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // BUG-047: Status can skip steps
  // Should check: const currentIndex = validStatuses.indexOf(order.status);
  //                const newIndex = validStatuses.indexOf(status);
  //                if (newIndex !== currentIndex + 1) return error
  // This check is intentionally not implemented

  // BUG-048: Status can go backwards
  // Should check: if (newIndex < currentIndex) return error
  // This check is intentionally not implemented

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, orderId);

  const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  res.json(updatedOrder);
}));

// Cancel order (user can cancel only Pending orders)
router.put('/:id/cancel', authenticateToken, tryCatch(async (req, res) => {
  const orderId = req.params.id;

  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(orderId, req.user.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.status !== 'Pending') {
    return res.status(400).json({ error: 'Only pending orders can be cancelled' });
  }

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('Cancelled', orderId);

  const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  res.json(updatedOrder);
}));

module.exports = router;
