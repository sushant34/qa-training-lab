const express = require('express');
const db = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
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
    // The search is case-sensitive and uses LIKE without wildcards
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
});

router.get('/categories', authenticateToken, (req, res) => {
  const categories = db.prepare('SELECT DISTINCT category FROM products ORDER BY category ASC').all();
  res.json(categories.map(c => c.category));
});

router.get('/:id', authenticateToken, (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

router.get('/:id/related', authenticateToken, (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const related = db.prepare(
    'SELECT * FROM products WHERE category = ? AND id != ? AND stock > 0 ORDER BY RANDOM() LIMIT 4'
  ).all(product.category, req.params.id);

  res.json(related);
});

module.exports = router;
