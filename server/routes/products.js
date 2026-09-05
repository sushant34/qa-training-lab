const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');
const { productListRules } = require('../validators/products');
const validate = require('../middleware/validate');
const tryCatch = require('../middleware/tryCatch');

const router = express.Router();

router.get('/', authenticateToken, productListRules, validate, tryCatch(async (req, res) => {
  const { category, search, page, limit, min_price, max_price } = req.query;

  let query = 'SELECT * FROM products WHERE stock > 0';
  let countQuery = 'SELECT COUNT(*) as total FROM products WHERE stock > 0';
  const params = [];
  const countParams = [];

  if (category) {
    query += ' AND category = ?';
    countQuery += ' AND category = ?';
    params.push(category);
    countParams.push(category);
  }

  if (search) {
    // BUG-004: Search returns unrelated products for some search terms
    query += ' AND (name LIKE ? OR description LIKE ?)';
    countQuery += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
    countParams.push(`%${search}%`, `%${search}%`);
  }

  if (min_price) {
    query += ' AND price >= ?';
    countQuery += ' AND price >= ?';
    params.push(parseFloat(min_price));
    countParams.push(parseFloat(min_price));
  }

  if (max_price) {
    query += ' AND price <= ?';
    countQuery += ' AND price <= ?';
    params.push(parseFloat(max_price));
    countParams.push(parseFloat(max_price));
  }

  const totalResult = db.prepare(countQuery).get(...countParams);
  const total = totalResult.total;

  query += ' ORDER BY name ASC';

  const pageNum = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const offset = (pageNum - 1) * pageSize;

  query += ' LIMIT ? OFFSET ?';
  params.push(pageSize, offset);

  const products = db.prepare(query).all(...params);
  const totalPages = Math.ceil(total / pageSize);

  res.json({ products, total, page: pageNum, totalPages });
}));

router.get('/categories', authenticateToken, tryCatch(async (req, res) => {
  const categories = db.prepare('SELECT DISTINCT category FROM products ORDER BY category ASC').all();
  res.json(categories.map(c => c.category));
}));

// Get recently viewed products
router.get('/recently-viewed', authenticateToken, tryCatch(async (req, res) => {
  const items = db.prepare(`
    SELECT rv.product_id, rv.viewed_at, p.name, p.price, p.category, p.image_url, p.stock
    FROM recently_viewed rv
    JOIN products p ON rv.product_id = p.id
    WHERE rv.user_id = ?
    ORDER BY rv.viewed_at DESC
    LIMIT 8
  `).all(req.user.id);

  res.json(items);
}));

router.get('/:id', authenticateToken, tryCatch(async (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Track recently viewed
  // BUG-049: Recently viewed not cleared on logout (stored in DB, not session)
  // BUG-050: Allows duplicate entries (INSERT OR IGNORE handles this, but the
  //          UNIQUE constraint means duplicates are silently ignored, not updated)
  //          Should use: INSERT OR REPLACE to update viewed_at on duplicate
  try {
    db.prepare('INSERT OR IGNORE INTO recently_viewed (user_id, product_id) VALUES (?, ?)').run(
      req.user.id, req.params.id
    );
  } catch (e) {
    // Silently fail
  }

  res.json(product);
}));

router.get('/:id/related', authenticateToken, tryCatch(async (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const related = db.prepare(
    'SELECT * FROM products WHERE category = ? AND id != ? AND stock > 0 ORDER BY RANDOM() LIMIT 4'
  ).all(product.category, req.params.id);

  res.json(related);
}));

module.exports = router;
