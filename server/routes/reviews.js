const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { reviewCreateRules } = require('../validators/reviews');
const validate = require('../middleware/validate');
const tryCatch = require('../middleware/tryCatch');

const router = express.Router();

router.get('/:productId', tryCatch(async (req, res) => {
  const reviews = db.prepare(`
    SELECT r.*, u.full_name as author_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.productId);

  const stats = db.prepare(`
    SELECT COUNT(*) as count, COALESCE(AVG(rating), 0) as average
    FROM reviews WHERE product_id = ?
  `).get(req.params.productId);

  res.json({ reviews, stats });
}));

router.post('/:productId', authenticateToken, reviewCreateRules, validate, tryCatch(async (req, res) => {
  const { rating, title, comment } = req.body;
  const productId = req.params.productId;

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = db.prepare(
    'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?'
  ).get(req.user.id, productId);

  if (existing) {
    return res.status(409).json({ error: 'You have already reviewed this product' });
  }

  const result = db.prepare(
    'INSERT INTO reviews (user_id, product_id, rating, title, comment) VALUES (?, ?, ?, ?, ?)'
  ).run(req.user.id, productId, rating, title || null, comment || null);

  const review = db.prepare(`
    SELECT r.*, u.full_name as author_name
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(review);
}));

module.exports = router;
