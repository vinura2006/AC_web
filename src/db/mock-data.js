const { DEMO_PRODUCTS } = require('./seed-demo');
const { CATEGORIES } = require('./seed-categories');

// In-memory / Mock data store when running without external PostgreSQL
const memoryCategories = [...CATEGORIES];
const memoryProducts = DEMO_PRODUCTS.map((p, idx) => ({
  id: idx + 1,
  name: p.name,
  slug: p.slug,
  brand: p.brand,
  model: p.model,
  short_description: p.short_description,
  description: p.description,
  price: p.price,
  sale_price: p.sale_price,
  offer_ends_at: p.offer_ends_at,
  is_weekly_offer: p.is_weekly_offer,
  is_featured: p.is_featured,
  stock_qty: p.stock_qty,
  low_stock_threshold: p.low_stock_threshold,
  status: p.status,
  specs: p.specs,
  warranty_text: p.warranty_text,
  category_name: p.category_slug === 'air-conditioners' ? 'Air Conditioners' : 'Access Points',
  category_slug: p.category_slug,
  spec_fields: CATEGORIES.find(c => c.slug === p.category_slug)?.spec_fields || [],
  thumb_url: `/uploads/demo/${p.slug}-1.svg`,
  image_url: `/uploads/demo/${p.slug}-1.svg`,
  images: [
    { url: `/uploads/demo/${p.slug}-1.svg`, thumb_url: `/uploads/demo/${p.slug}-1.svg`, alt_text: `${p.name} Front` },
    { url: `/uploads/demo/${p.slug}-2.svg`, thumb_url: `/uploads/demo/${p.slug}-2.svg`, alt_text: `${p.name} Angle` }
  ]
}));

module.exports = { memoryCategories, memoryProducts };

