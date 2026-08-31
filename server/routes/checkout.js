const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, (req, res) => {
  const { full_name, email, phone, address } = req.body;

  // BUG-008: Checkout allows submission without phone number
  // This check is intentionally missing for phone

  if (!full_name || !email || !address) {
    return res.status(400).json({ error: 'Full name, email, and address are required' });
  }

  // BUG-008: Phone validation is missing
  // Should require phone but doesn't

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

  const orderResult = db.prepare(
    'INSERT INTO orders (user_id, full_name, email, phone, address, total_amount) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, full_name, email, phone || null, address, totalAmount);

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

  res.status(201).json({ order, items: orderItems });
});

router.get('/history', authenticateToken, (req, res) => {
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
});

module.exports = router;
