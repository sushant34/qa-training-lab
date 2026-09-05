const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const tryCatch = require('../middleware/tryCatch');

const router = express.Router();

// Get saved items
router.get('/', authenticateToken, tryCatch(async (req, res) => {
  const items = db.prepare(`
    SELECT si.id, si.product_id, si.created_at, p.name, p.price, p.category, p.image_url, p.stock
    FROM saved_items si
    JOIN products p ON si.product_id = p.id
    WHERE si.user_id = ?
    ORDER BY si.created_at DESC
  `).all(req.user.id);

  res.json(items);
}));

// Add to saved items
router.post('/add', authenticateToken, tryCatch(async (req, res) => {
  const { product_id } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // BUG-054: No limit check on saved items
  // Should check: if (savedCount >= 20) return error
  // This check is intentionally not implemented

  try {
    db.prepare('INSERT INTO saved_items (user_id, product_id) VALUES (?, ?)').run(req.user.id, product_id);
  } catch (e) {
    // UNIQUE constraint - item already saved
  }

  const items = db.prepare(`
    SELECT si.id, si.product_id, si.created_at, p.name, p.price, p.category, p.image_url, p.stock
    FROM saved_items si
    JOIN products p ON si.product_id = p.id
    WHERE si.user_id = ?
    ORDER BY si.created_at DESC
  `).all(req.user.id);

  res.json(items);
}));

// Remove from saved items
router.delete('/remove/:productId', authenticateToken, tryCatch(async (req, res) => {
  db.prepare('DELETE FROM saved_items WHERE user_id = ? AND product_id = ?').run(
    req.user.id,
    req.params.productId
  );

  const items = db.prepare(`
    SELECT si.id, si.product_id, si.created_at, p.name, p.price, p.category, p.image_url, p.stock
    FROM saved_items si
    JOIN products p ON si.product_id = p.id
    WHERE si.user_id = ?
    ORDER BY si.created_at DESC
  `).all(req.user.id);

  res.json(items);
}));

// Move to cart
router.post('/move-to-cart/:productId', authenticateToken, tryCatch(async (req, res) => {
  const productId = req.params.productId;

  // Check if item is saved
  const savedItem = db.prepare(
    'SELECT * FROM saved_items WHERE user_id = ? AND product_id = ?'
  ).get(req.user.id, productId);

  if (!savedItem) {
    return res.status(404).json({ error: 'Item not found in saved list' });
  }

  // Add to cart (or increment quantity)
  const existingCartItem = db.prepare(
    'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?'
  ).get(req.user.id, productId);

  if (existingCartItem) {
    db.prepare('UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?').run(existingCartItem.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, 1)').run(req.user.id, productId);
  }

  // BUG-053: Remove from saved is missing
  // Should have: db.prepare('DELETE FROM saved_items WHERE user_id = ? AND product_id = ?').run(req.user.id, productId);
  // This delete is intentionally not implemented

  const items = db.prepare(`
    SELECT si.id, si.product_id, si.created_at, p.name, p.price, p.category, p.image_url, p.stock
    FROM saved_items si
    JOIN products p ON si.product_id = p.id
    WHERE si.user_id = ?
    ORDER BY si.created_at DESC
  `).all(req.user.id);

  res.json({ message: 'Item moved to cart', savedItems: items });
}));

module.exports = router;
