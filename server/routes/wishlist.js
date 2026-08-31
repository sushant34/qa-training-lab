const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const items = db.prepare(`
    SELECT w.id, w.product_id, w.created_at, p.name, p.price, p.category, p.image_url, p.stock
    FROM wishlist_items w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
  `).all(req.user.id);
  res.json(items);
});

router.post('/add', authenticateToken, (req, res) => {
  const { product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = db.prepare(
    'SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?'
  ).get(req.user.id, product_id);

  if (existing) {
    return res.status(409).json({ error: 'Product already in wishlist' });
  }

  db.prepare('INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)').run(
    req.user.id,
    product_id
  );

  res.status(201).json({ message: 'Added to wishlist' });
});

router.delete('/remove/:productId', authenticateToken, (req, res) => {
  const result = db.prepare(
    'DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?'
  ).run(req.user.id, req.params.productId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Wishlist item not found' });
  }

  res.json({ message: 'Removed from wishlist' });
});

router.get('/check/:productId', authenticateToken, (req, res) => {
  const item = db.prepare(
    'SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?'
  ).get(req.user.id, req.params.productId);

  res.json({ isWishlisted: !!item });
});

module.exports = router;
