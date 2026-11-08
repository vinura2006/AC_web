const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const { memoryProducts, memoryCategories } = require('../src/db/mock-data');
const { enhanceProduct } = require('../src/services/products');

const templatePath = path.join(__dirname, '../src/views/public/products.ejs');
const str = fs.readFileSync(templatePath, 'utf8');

const apCat = memoryCategories.find(c => c.slug === 'access-points');
const apProducts = memoryProducts.filter(p => p.category_slug === 'access-points').map(p => enhanceProduct(p));

try {
  const html = ejs.render(str, {
    currentTheme: 'networking',
    currentCategory: apCat,
    categories: memoryCategories,
    products: apProducts,
    total: apProducts.length,
    searchQuery: '',
    page: 1,
    totalPages: 1,
    formatPrice: (p) => 'Rs ' + p,
    waLink: () => '#',
    filename: templatePath
  });
  console.log('RENDER SUCCESSFUL! Length:', html.length);
} catch (err) {
  console.error('EJS RENDER ERROR:', err);
}

