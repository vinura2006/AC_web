const express = require('express');
const router = express.Router();
const { memoryProducts, memoryCategories } = require('../../db/mock-data');

// Admin Dashboard - Overview of items
router.get('/', (req, res) => {
  res.render('admin/dashboard', {
    layout: 'layouts/admin',
    title: 'Dashboard Overview',
    products: memoryProducts,
    categories: memoryCategories
  });
});

// Admin New Product Form
router.get('/products/new', (req, res) => {
  res.render('admin/product-form', {
    layout: 'layouts/admin',
    title: 'Add New Hardware Item',
    product: null,
    categories: memoryCategories
  });
});

// Admin Save New Product (POST)
router.post('/products/new', (req, res) => {
  const { name, brand, model, price, sale_price, stock_qty, category_slug, short_description } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const numPrice = Number(price);
  const numSalePrice = sale_price && Number(sale_price) > 0 ? Number(sale_price) : null;

  const newProduct = {
    id: memoryProducts.length + 1,
    name,
    slug,
    brand,
    model,
    price: numPrice,
    sale_price: numSalePrice,
    offer_ends_at: numSalePrice ? new Date(Date.now() + 7 * 86400000) : null,
    stock_qty: Number(stock_qty) || 0,
    low_stock_threshold: 3,
    status: 'published',
    category_slug: category_slug || 'air-conditioners',
    category_name: category_slug === 'access-points' ? 'Access Points' : 'Air Conditioners',
    short_description: short_description || 'Newly added hardware product.',
    description: short_description || '',
    is_featured: true,
    is_weekly_offer: !!numSalePrice,
    specs: {},
    spec_fields: [],
    image_url: `/uploads/demo/demo-inverter-split-ac-12000-btu-1.svg`,
    thumb_url: `/uploads/demo/demo-inverter-split-ac-12000-btu-1.svg`,
    images: [{ url: `/uploads/demo/demo-inverter-split-ac-12000-btu-1.svg` }]
  };

  memoryProducts.unshift(newProduct);
  res.redirect('/admin');
});

// Admin Quick Stock & Price / Sale Price Update (POST)
router.post('/products/quick-update', (req, res) => {
  const { id, price, sale_price, stock_qty } = req.body;
  const item = memoryProducts.find((p) => p.id === Number(id));
  if (item) {
    if (price !== undefined && price !== '') {
      item.price = Number(price);
    }
    
    // If sale_price is provided and > 0 and < price
    if (sale_price !== undefined) {
      const sp = Number(sale_price);
      if (sp > 0 && sp < item.price) {
        item.sale_price = sp;
        item.is_weekly_offer = true;
        if (!item.offer_ends_at) {
          item.offer_ends_at = new Date(Date.now() + 7 * 86400000);
        }
      } else {
        item.sale_price = null;
        item.is_weekly_offer = false;
        item.offer_ends_at = null;
      }
    }

    if (stock_qty !== undefined && stock_qty !== '') {
      item.stock_qty = Number(stock_qty);
    }
  }
  res.redirect('/admin');
});

module.exports = router;
