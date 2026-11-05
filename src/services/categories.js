const { pool, query } = require('../config/db');
const { memoryCategories } = require('../db/mock-data');

async function getCategories(includeInactive = false) {
  if (!pool) {
    return includeInactive ? memoryCategories : memoryCategories.filter((c) => c.is_active !== false);
  }
  const sql = `
    SELECT id, name, slug, description, icon, sort_order, is_active, spec_fields
    FROM categories
    ${includeInactive ? '' : 'WHERE is_active = true'}
    ORDER BY sort_order ASC, name ASC
  `;
  const res = await query(sql);
  return res.rows;
}

async function getCategoryBySlug(slug) {
  if (!pool) {
    return memoryCategories.find((c) => c.slug === slug) || null;
  }
  const sql = `
    SELECT id, name, slug, description, icon, sort_order, is_active, spec_fields
    FROM categories
    WHERE slug = $1
    LIMIT 1
  `;
  const res = await query(sql, [slug]);
  return res.rows[0] || null;
}

module.exports = {
  getCategories,
  getCategoryBySlug
};
