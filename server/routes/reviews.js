const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { reviewCreateRules } = require('../validators/reviews');
const validate = require('../middleware/validate');
const tryCatch = require('../middleware/tryCatch');

const router = express.Router();

router.get('/:productId', authenticateToken, tryCatch(async (req, res) => {
  const reviews = db.prepare(`
    SELECT r.*, u.full_name as author_name,
      (SELECT COALESCE(SUM(is_helpful), 0) FROM review_votes WHERE review_id = r.id) as helpful_count,
      (SELECT is_helpful FROM review_votes WHERE review_id = r.id AND user_id = ?) as user_vote
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `).all(req.user?.id || 0, req.params.productId);

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

// Vote on a review
router.post('/:reviewId/vote', authenticateToken, tryCatch(async (req, res) => {
  const { reviewId } = req.params;
  const { is_helpful } = req.body;

  if (is_helpful !== 1 && is_helpful !== -1) {
    return res.status(400).json({ error: 'Vote must be 1 (helpful) or -1 (not helpful)' });
  }

  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  // BUG-051: Users can vote on their own reviews
  // Should check: if (review.user_id === req.user.id) return error
  // This check is intentionally not implemented

  // Check existing vote
  const existingVote = db.prepare(
    'SELECT * FROM review_votes WHERE user_id = ? AND review_id = ?'
  ).get(req.user.id, reviewId);

  if (existingVote) {
    if (existingVote.is_helpful === is_helpful) {
      // Toggle off - remove vote
      db.prepare('DELETE FROM review_votes WHERE id = ?').run(existingVote.id);
    } else {
      // Change vote
      db.prepare('UPDATE review_votes SET is_helpful = ? WHERE id = ?').run(is_helpful, existingVote.id);
    }
  } else {
    db.prepare('INSERT INTO review_votes (user_id, review_id, is_helpful) VALUES (?, ?, ?)').run(
      req.user.id, reviewId, is_helpful
    );
  }

  // BUG-052: Vote count calculation is incorrect
  // The SUM(is_helpful) counts both +1 and -1 votes, which can result in 0
  // even when there are votes. Should show count of only helpful votes (+1).
  // This incorrect calculation is intentional.
  const helpfulCount = db.prepare(
    'SELECT COALESCE(SUM(is_helpful), 0) as count FROM review_votes WHERE review_id = ?'
  ).get(reviewId);

  const userVote = db.prepare(
    'SELECT is_helpful FROM review_votes WHERE user_id = ? AND review_id = ?'
  ).get(req.user.id, reviewId);

  res.json({
    helpful_count: helpfulCount.count,
    user_vote: userVote?.is_helpful || null,
  });
}));

module.exports = router;
