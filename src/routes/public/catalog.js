const express = require('express');
const router = express.Router();
const { getHomeData, getPublishedProducts, getProductBySlug } = require('../../services/products');
const { getCategoryBySlug } = require('../../services/categories');

// GET / - Category Gateway (Full-viewport split screen)
router.get('/', async (req, res, next) => {
  try {
    const { offers, featured, categories } = await getHomeData();
    res.render('public/index', {
      layout: 'layouts/public',
      currentTheme: 'neutral',
      hideHeader: true, // Split gateway has its own clean integrated top bar
      hideFooter: true,
      title: 'Cooling & Enterprise Networking Gateway',
      offers,
      featured,
      categories
    });
  } catch (err) {
    next(err);
  }
});

// GET /products - Full catalog (Neutral theme)
router.get('/products', async (req, res, next) => {
  try {
    const { q, sort = 'newest', page = 1 } = req.query;
    const limit = 12;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * limit;

    const { products, total } = await getPublishedProducts({
      search: q,
      orderBy: sort,
      limit,
      offset
    });

    res.render('public/products', {
      layout: 'layouts/public',
      currentTheme: 'neutral',
      title: q ? `Search results for "${q}"` : 'Equipment Catalog',
      products,
      total,
      searchQuery: q || '',
      currentCategory: null,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
});

// GET /category/:slug - Category filtered catalog with scoped theme!
router.get('/category/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { sort = 'newest', page = 1 } = req.query;
    const limit = 12;
    const offset = (Math.max(1, parseInt(page, 10)) - 1) * limit;

    const category = await getCategoryBySlug(slug);
    if (!category) {
      return res.status(404).render('errors/404', {
        layout: 'layouts/public',
        currentTheme: 'neutral',
        title: 'Category Not Found'
      });
    }

    const { products, total } = await getPublishedProducts({
      categorySlug: slug,
      orderBy: sort,
      limit,
      offset
    });

    // Theme assignment based on category (Cooling vs Networking)
    const categoryTheme = slug === 'air-conditioners' ? 'cooling' : (slug === 'access-points' ? 'networking' : 'neutral');

    res.render('public/products', {
      layout: 'layouts/public',
      currentTheme: categoryTheme,
      title: `${category.name} Catalog`,
      products,
      total,
      searchQuery: '',
      currentCategory: category,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
});

// GET /product/:slug - Product detail page (Themed by category)
router.get('/product/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return res.status(404).render('errors/404', {
        layout: 'layouts/public',
        currentTheme: 'neutral',
        title: 'Product Not Found'
      });
    }

    const { products: related } = await getPublishedProducts({
      categorySlug: product.category_slug,
      limit: 4
    });

    const productTheme = product.category_slug === 'air-conditioners' ? 'cooling' : (product.category_slug === 'access-points' ? 'networking' : 'neutral');

    res.render('public/product-detail', {
      layout: 'layouts/public',
      currentTheme: productTheme,
      title: product.name,
      description: product.short_description,
      product,
      related: related.filter((p) => p.id !== product.id).slice(0, 4),
      hideFloatingWa: true
    });
  } catch (err) {
    next(err);
  }
});

// GET /offers - Weekly discount deals
router.get('/offers', async (req, res, next) => {
  try {
    const { products, total } = await getPublishedProducts({
      isWeeklyOffer: true,
      limit: 24
    });

    res.render('public/offers', {
      layout: 'layouts/public',
      currentTheme: 'neutral',
      title: 'Weekly Discount Deals',
      products,
      total
    });
  } catch (err) {
    next(err);
  }
});

// GET /about
router.get('/about', (req, res) => {
  res.render('public/about', {
    layout: 'layouts/public',
    currentTheme: 'neutral',
    title: 'About FrostNet Technologies'
  });
});

// GET /contact
router.get('/contact', (req, res) => {
  res.render('public/contact', {
    layout: 'layouts/public',
    currentTheme: 'neutral',
    title: 'Contact Us & Showroom'
  });
});

module.exports = router;
