const { DEMO_PRODUCTS } = require('./seed-demo');
const { CATEGORIES } = require('./seed-categories');

// Real AC images provided by user
const acImages = [
  '/uploads/demo/hero-ac-modern.png',
  '/uploads/demo/ac-outdoor-install.jpg',
  '/uploads/demo/images.jpg',
  '/uploads/demo/images2.jpg',
  '/uploads/demo/images3.jpg',
  '/uploads/demo/images4.jpg',
  '/uploads/demo/images5.jpg'
];

// Real Networking equipment crops generated from user's networking photo
const netImages = [
  '/uploads/demo/net-switch-rack.jpg',
  '/uploads/demo/net-cloud-controller.jpg',
  '/uploads/demo/net-outdoor-tower.jpg',
  '/uploads/demo/net-poe-switch.jpg',
  '/uploads/demo/net-server-rack.jpg',
  '/uploads/demo/net-suite-full.jpg'
];

let acIdx = 0;
let netIdx = 0;

// In-memory / Mock data store when running without external PostgreSQL
const memoryCategories = [...CATEGORIES];
const memoryProducts = DEMO_PRODUCTS.map((p, idx) => {
  const isAc = p.category_slug === 'air-conditioners';
  let primaryImage = '';
  let secondaryImage = '';

  if (isAc) {
    primaryImage = acImages[acIdx % acImages.length];
    secondaryImage = acImages[(acIdx + 1) % acImages.length];
    acIdx++;
  } else {
    primaryImage = netImages[netIdx % netImages.length];
    secondaryImage = netImages[(netIdx + 1) % netImages.length];
    netIdx++;
  }

  return {
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
    category_name: isAc ? 'Air Conditioners' : 'Access Points',
    category_slug: p.category_slug,
    spec_fields: CATEGORIES.find(c => c.slug === p.category_slug)?.spec_fields || [],
    thumb_url: primaryImage,
    image_url: primaryImage,
    images: [
      { url: primaryImage, thumb_url: primaryImage, alt_text: `${p.name} Front View` },
      { url: secondaryImage, thumb_url: secondaryImage, alt_text: `${p.name} Detail View` }
    ]
  };
});

module.exports = { memoryCategories, memoryProducts };
