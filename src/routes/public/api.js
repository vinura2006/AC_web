const express = require('express');
const router = express.Router();
const { pool, query } = require('../../config/db');

router.get('/search-suggest', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0 || !pool) {
    return res.json([]);
  }

  try {
    const term = `%${q.trim()}%`;
    const sql = `
      SELECT p.name, p.slug, p.price, p.sale_price, p.brand, p.model,
             img.thumb_url
      FROM products p
      LEFT JOIN LATERAL (
        SELECT thumb_url FROM product_images
        WHERE product_id = p.id
        ORDER BY is_primary DESC, sort_order ASC
        LIMIT 1
      ) img ON true
      WHERE p.status = 'published' AND (
        p.name ILIKE $1 OR p.brand ILIKE $1 OR p.model ILIKE $1
      )
      LIMIT 6
    `;
    const result = await query(sql, [term]);
    res.json(result.rows);
  } catch (err) {
    console.error('Suggest error:', err);
    res.json([]);
  }
});

module.exports = router;

