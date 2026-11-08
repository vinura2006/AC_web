const app = require('../src/app');

// Simulate Express request / response to catch the 500 error stack trace
const http = require('http');

app.render('public/products', {
  layout: 'layouts/public',
  currentTheme: 'networking',
  title: 'Access Points Catalog',
  products: require('../src/db/mock-data').memoryProducts.filter(p => p.category_slug === 'access-points').map(require('../src/services/products').enhanceProduct),
  total: 6,
  searchQuery: '',
  currentCategory: require('../src/db/mock-data').memoryCategories.find(c => c.slug === 'access-points'),
  categories: require('../src/db/mock-data').memoryCategories,
  settings: require('../src/services/settings').DEFAULTS,
  currentPath: '/category/access-points',
  formatPrice: (p) => 'Rs ' + p,
  formatDate: (d) => '' + d,
  pricing: require('../src/lib/pricing').calculatePricing,
  stockLabel: (q, t) => require('../src/lib/stock').getStockStatus(q, t),
  waLink: () => '#'
}, (err, html) => {
  if (err) {
    console.error('EXACT 500 RENDER ERROR:');
    console.error(err);
  } else {
    console.log('SUCCESS! Rendered characters:', html.length);
  }
});

