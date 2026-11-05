const { pool, query } = require('../config/db');
const { calculatePricing } = require('../lib/pricing');
const { getStockStatus } = require('../lib/stock');
const { memoryProducts, memoryCategories } = require('../db/mock-data');

function enhanceProduct(row, showExactStock = false) {
  if (!row) return null;
  const pricing = calculatePricing(row.price, row.sale_price, row.offer_ends_at);
  const stock = getStockStatus(row.stock_qty, row.low_stock_threshold, showExactStock);
  return {
    ...row,
    pricing,
    stock
  };
}

async function getPublishedProducts(options = {}) {
  const {
    categorySlug,
    isWeeklyOffer,
    isFeatured,
    search,
    limit = 12,
    offset = 0,
    orderBy = 'newest'
  } = options;

  // If no live DB connection, use rich in-memory dataset
  if (!pool) {
    let filtered = memoryProducts.filter((p) => p.status === 'published');

    if (categorySlug) {
      filtered = filtered.filter((p) => p.category_slug === categorySlug);
    }
    if (isWeeklyOffer) {
      filtered = filtered.filter((p) => p.is_weekly_offer);
    }
    if (isFeatured) {
      filtered = filtered.filter((p) => p.is_featured);
    }
    if (search && search.trim().length > 0) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.short_description.toLowerCase().includes(q)
      );
    }

    if (orderBy === 'price_asc') {
      filtered.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
    } else if (orderBy === 'price_desc') {
      filtered.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      products: paginated.map((p) => enhanceProduct(p)),
      total
    };
  }

  // Live PostgreSQL query
  const conditions = ["p.status = 'published'"];
  const params = [];

  if (categorySlug) {
    params.push(categorySlug);
    conditions.push(`c.slug = $${params.length}`);
  }

  if (isWeeklyOffer) {
    conditions.push('p.is_weekly_offer = true');
    conditions.push('(p.sale_price IS NOT NULL AND p.sale_price < p.price)');
    conditions.push('(p.offer_ends_at IS NULL OR p.offer_ends_at > CURRENT_TIMESTAMP)');
  }

  if (isFeatured) {
    conditions.push('p.is_featured = true');
  }

  if (search && search.trim().length > 0) {
    params.push(search.trim());
    conditions.push(`(
      p.search_vector @@ websearch_to_tsquery('english', $${params.length})
      OR p.name ILIKE '%' || $${params.length} || '%'
      OR p.brand ILIKE '%' || $${params.length} || '%'
      OR p.model ILIKE '%' || $${params.length} || '%'
    )`);
  }

  let orderClause = 'ORDER BY p.created_at DESC';
  if (orderBy === 'price_asc') {
    orderClause = 'ORDER BY COALESCE(p.sale_price, p.price) ASC';
  } else if (orderBy === 'price_desc') {
    orderClause = 'ORDER BY COALESCE(p.sale_price, p.price) DESC';
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countSql = `
    SELECT COUNT(*) as total
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ${whereClause}
  `;
  const countRes = await query(countSql, params);
  const total = parseInt(countRes.rows[0]?.total || '0', 10);

  const dataSql = `
    SELECT
      p.id, p.name, p.slug, p.brand, p.model, p.short_description, p.description,
      p.price, p.sale_price, p.offer_ends_at, p.is_weekly_offer, p.is_featured,
      p.stock_qty, p.low_stock_threshold, p.specs, p.warranty_text, p.created_at,
      c.name as category_name, c.slug as category_slug, c.spec_fields,
      img.url as image_url, img.thumb_url as thumb_url
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN LATERAL (
      SELECT url, thumb_url
      FROM product_images
      WHERE product_id = p.id
      ORDER BY is_primary DESC, sort_order ASC
      LIMIT 1
    ) img ON true
    ${whereClause}
    ${orderClause}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const dataParams = [...params, limit, offset];
  const dataRes = await query(dataSql, dataParams);

  return {
    products: dataRes.rows.map((r) => enhanceProduct(r)),
    total
  };
}

async function getProductBySlug(slug) {
  if (!pool) {
    const item = memoryProducts.find((p) => p.slug === slug && p.status === 'published');
    return item ? enhanceProduct(item) : null;
  }

  const sql = `
    SELECT
      p.*,
      c.name as category_name, c.slug as category_slug, c.spec_fields
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.slug = $1 AND p.status = 'published'
    LIMIT 1
  `;
  const res = await query(sql, [slug]);
  if (!res.rows[0]) return null;

  const product = enhanceProduct(res.rows[0]);

  const imgSql = `
    SELECT id, url, thumb_url, alt_text, is_primary
    FROM product_images
    WHERE product_id = $1
    ORDER BY is_primary DESC, sort_order ASC
  `;
  const imgRes = await query(imgSql, [product.id]);
  product.images = imgRes.rows;

  return product;
}

async function getHomeData() {
  if (!pool) {
    const published = memoryProducts.filter((p) => p.status === 'published');
    const offers = published.filter((p) => p.is_weekly_offer).slice(0, 8).map((p) => enhanceProduct(p));
    const featured = published.filter((p) => p.is_featured).slice(0, 8).map((p) => enhanceProduct(p));
    const categoriesWithCount = memoryCategories.map((c) => ({
      ...c,
      product_count: published.filter((p) => p.category_slug === c.slug).length
    }));

    return {
      offers,
      featured,
      categories: categoriesWithCount
    };
  }

  const [offersRes, featuredRes, categoriesRes] = await Promise.all([
    getPublishedProducts({ isWeeklyOffer: true, limit: 8 }),
    getPublishedProducts({ isFeatured: true, limit: 8 }),
    query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.status = 'published'
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.sort_order ASC
    `)
  ]);

  return {
    offers: offersRes.products,
    featured: featuredRes.products,
    categories: categoriesRes.rows
  };
}

module.exports = {
  getPublishedProducts,
  getProductBySlug,
  getHomeData,
  enhanceProduct
};
