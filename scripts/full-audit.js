const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const { memoryCategories, memoryProducts } = require('../src/db/mock-data');
const { formatPrice, formatDate } = require('../src/lib/format');
const { calculatePricing } = require('../src/lib/pricing');
const { getStockStatus } = require('../src/lib/stock');
const { buildWhatsAppLink } = require('../src/lib/whatsapp');

const settings = {
  business_name: 'FrostNet Technologies',
  tagline: 'Cooling & Network Infrastructure Importers',
  phone: '+94 77 123 4567',
  whatsapp_number: '94771234567',
  email: 'info@frostnet.lk',
  address: 'No. 42 Galle Road, Colombo 03, Sri Lanka',
  hours: 'Mon to Sat, 9:00 AM to 6:00 PM',
  currency_symbol: 'Rs',
  timezone: 'Asia/Colombo',
  show_exact_stock: false,
  whatsapp_message_template: 'Hi {business}, I am interested in {product} ({price}). Could you provide quotation details?'
};

async function runAudit() {
  console.log('==================================================');
  console.log('STARTING COMPREHENSIVE FROSTNET AUDIT SUITE');
  console.log('==================================================\n');

  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../src/views'));
  app.use(expressLayouts);
  app.set('layout', 'layouts/public');

  const defaultLocals = {
    settings,
    categories: memoryCategories,
    currentTheme: 'default',
    currentPath: '/',
    searchQuery: '',
    formatPrice: (amt) => formatPrice(amt, settings.currency_symbol),
    formatDate: (dt) => formatDate(dt, settings.timezone),
    pricing: calculatePricing,
    stockLabel: (qty, thresh) => getStockStatus(qty, thresh, false),
    waLink: (prod, price) => buildWhatsAppLink({
      whatsappNumber: settings.whatsapp_number,
      businessName: settings.business_name,
      template: settings.whatsapp_message_template,
      product: prod,
      price: price || ''
    })
  };

  const sampleAcRaw = memoryProducts.find(p => p.slug === 'demo-inverter-split-ac-12000-btu');
  const sampleApRaw = memoryProducts.find(p => p.slug === 'demo-wifi-6-enterprise-access-point-3000-mbps');
  const sampleAc = {
    ...sampleAcRaw,
    pricing: calculatePricing(sampleAcRaw.price, sampleAcRaw.sale_price, sampleAcRaw.offer_ends_at),
    stock: getStockStatus(sampleAcRaw.stock_qty, sampleAcRaw.low_stock_threshold, false)
  };
  const sampleAp = {
    ...sampleApRaw,
    pricing: calculatePricing(sampleApRaw.price, sampleApRaw.sale_price, sampleApRaw.offer_ends_at),
    stock: getStockStatus(sampleApRaw.stock_qty, sampleApRaw.low_stock_threshold, false)
  };

  const tests = [
    {
      name: '1. Home Page / Landing View (Split Gateway + Real AC Showcase + Seller Access)',
      view: 'public/index',
      locals: {
        ...defaultLocals,
        title: 'FrostNet Technologies',
        currentPath: '/',
        coolingCat: memoryCategories.find(c => c.slug === 'air-conditioners'),
        apCat: memoryCategories.find(c => c.slug === 'access-points'),
        featured: memoryProducts.filter(p => p.is_featured),
        offers: memoryProducts.filter(p => p.sale_price)
      }
    },
    {
      name: '2. All Products Catalog View (/products)',
      view: 'public/products',
      locals: {
        ...defaultLocals,
        title: 'Hardware Catalog',
        currentPath: '/products',
        currentCategory: null,
        products: memoryProducts,
        searchQuery: '',
        pagination: { page: 1, limit: 12, total: memoryProducts.length, pages: 1 }
      }
    },
    {
      name: '3. Cooling Category View (/category/air-conditioners with Room Helper)',
      view: 'public/products',
      locals: {
        ...defaultLocals,
        title: 'Air Conditioners & Climate Control',
        currentPath: '/category/air-conditioners',
        currentTheme: 'cooling',
        currentCategory: memoryCategories.find(c => c.slug === 'air-conditioners'),
        products: memoryProducts.filter(p => p.category_slug === 'air-conditioners'),
        searchQuery: '',
        pagination: { page: 1, limit: 12, total: 6, pages: 1 }
      }
    },
    {
      name: '4. Networking Category View (/category/access-points with Compare Tray)',
      view: 'public/products',
      locals: {
        ...defaultLocals,
        title: 'Wireless Access Points & Infrastructure',
        currentPath: '/category/access-points',
        currentTheme: 'networking',
        currentCategory: memoryCategories.find(c => c.slug === 'access-points'),
        products: memoryProducts.filter(p => p.category_slug === 'access-points'),
        searchQuery: '',
        pagination: { page: 1, limit: 12, total: 6, pages: 1 }
      }
    },
    {
      name: '5. Product Detail View - Inverter Split AC',
      view: 'public/product-detail',
      locals: {
        ...defaultLocals,
        title: '12,000 BTU Inverter Split AC',
        currentTheme: 'cooling',
        product: sampleAc,
        pricing: calculatePricing(sampleAc.price, sampleAc.sale_price, sampleAc.offer_ends_at),
        stock: getStockStatus(sampleAc.stock_qty, sampleAc.low_stock_threshold, false),
        category: memoryCategories.find(c => c.slug === 'air-conditioners'),
        related: memoryProducts.filter(p => p.category_slug === 'air-conditioners').slice(0, 3)
      }
    },
    {
      name: '6. Product Detail View - Enterprise Wi-Fi 6 Access Point',
      view: 'public/product-detail',
      locals: {
        ...defaultLocals,
        title: 'UniFi U6 Pro Enterprise AP',
        currentTheme: 'networking',
        product: sampleAp,
        pricing: calculatePricing(sampleAp.price, sampleAp.sale_price, sampleAp.offer_ends_at),
        stock: getStockStatus(sampleAp.stock_qty, sampleAp.low_stock_threshold, false),
        category: memoryCategories.find(c => c.slug === 'access-points'),
        related: memoryProducts.filter(p => p.category_slug === 'access-points').slice(0, 3)
      }
    },
    {
      name: '7. Offers Page View (/offers)',
      view: 'public/offers',
      locals: {
        ...defaultLocals,
        title: 'Weekly Hardware Offers',
        currentPath: '/offers',
        products: memoryProducts.filter(p => p.sale_price)
      }
    },
    {
      name: '8. About Us Page View (/about)',
      view: 'public/about',
      locals: {
        ...defaultLocals,
        title: 'About FrostNet Technologies',
        currentPath: '/about'
      }
    },
    {
      name: '9. Contact & Showroom Page View (/contact)',
      view: 'public/contact',
      locals: {
        ...defaultLocals,
        title: 'Contact FrostNet Showroom',
        currentPath: '/contact'
      }
    },
    {
      name: '10. Admin Login View (/admin/login)',
      view: 'admin/login',
      layout: false,
      locals: {
        title: 'Portal Access | Admin Sign In',
        error: null
      }
    },
    {
      name: '11. Admin Dashboard View (/admin)',
      view: 'admin/dashboard',
      layout: 'layouts/admin',
      locals: {
        ...defaultLocals,
        title: 'Hardware Catalog Admin',
        currentPath: '/admin',
        adminUser: { name: 'Admin Manager', email: 'admin@frostnet.lk', role: 'admin' },
        stats: { totalProducts: 12, lowStock: 2, outOfStock: 1, activeOffers: 4 },
        products: memoryProducts,
        categories: memoryCategories,
        filters: {},
        query: {},
        pagination: { page: 1, limit: 20, total: 12, pages: 1 }
      }
    },
    {
      name: '12. Admin New Product Form View (/admin/products/new)',
      view: 'admin/product-form',
      layout: 'layouts/admin',
      locals: {
        ...defaultLocals,
        title: 'Add New Hardware SKU',
        currentPath: '/admin/products/new',
        adminUser: { name: 'Admin Manager', email: 'admin@frostnet.lk', role: 'admin' },
        product: null,
        categories: memoryCategories,
        error: null
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      const html = await new Promise((resolve, reject) => {
        const renderOpts = { ...t.locals };
        if (t.layout !== undefined) renderOpts.layout = t.layout;
        app.render(t.view, renderOpts, (err, out) => {
          if (err) reject(err);
          else resolve(out);
        });
      });
      console.log(`[PASS] ${t.name} (${html.length.toLocaleString()} bytes rendered)`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${t.name}:`, err.message);
      failed++;
    }
  }

  // 13. Verify AC Category Capacity Range Data Checks
  console.log('\n--- Checking AC Products BTU & Inverter Filtering Specs ---');
  const acProducts = memoryProducts.filter(p => p.category_slug === 'air-conditioners');
  console.log(`Total AC Products in DB: ${acProducts.length}`);
  
  const btu9k = acProducts.filter(p => (p.specs?.capacity_btu || 0) <= 9000);
  const btuMed = acProducts.filter(p => (p.specs?.capacity_btu || 0) >= 12000 && (p.specs?.capacity_btu || 0) <= 18000);
  const btuLarge = acProducts.filter(p => (p.specs?.capacity_btu || 0) >= 24000);
  const inverters = acProducts.filter(p => p.specs?.inverter === true);

  console.log(`- 9,000 BTU (Small Room): ${btu9k.length} matching (${btu9k.map(p => p.name).join(', ')})`);
  console.log(`- 12,000 - 18,000 BTU (Master Bed): ${btuMed.length} matching (${btuMed.map(p => p.name).join(', ')})`);
  console.log(`- 24,000+ BTU (Open Hall): ${btuLarge.length} matching (${btuLarge.map(p => p.name).join(', ')})`);
  console.log(`- Inverter units: ${inverters.length} matching`);

  console.log('\n==================================================');
  console.log(`FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) process.exit(1);
}

runAudit();
