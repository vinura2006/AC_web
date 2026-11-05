const express = require('express');
const path = require('path');
const compression = require('compression');
const morgan = require('morgan');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const env = require('./config/env');
const { checkAuth } = require('./middleware/auth');
const settingsMiddleware = require('./middleware/settings');
const healthzRouter = require('./routes/healthz');
const catalogRouter = require('./routes/public/catalog');
const publicApiRouter = require('./routes/public/api');
const adminAuthRouter = require('./routes/admin/auth');
const adminDashboardRouter = require('./routes/admin/dashboard');

const app = express();

if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(compression());

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Session support for Admin Authentication
app.use(
  session({
    secret: env.SESSION_SECRET || 'cyber-secret-development-key-32-chars-long-12345',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  })
);

app.use(express.static(path.join(__dirname, '../public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/public');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

app.use(healthzRouter);
app.use('/api', publicApiRouter);

// Global settings & categories middleware for SSR pages
app.use(settingsMiddleware);

// Public catalog routes
app.use('/', catalogRouter);

// Admin authentication routes (login / logout)
app.use('/admin', adminAuthRouter);

// Protected Admin Console (Protected by checkAuth middleware)
app.use('/admin', checkAuth, adminDashboardRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('errors/404', {
    layout: 'layouts/public',
    title: 'Page Not Found'
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).render('errors/500', {
    layout: 'layouts/public',
    title: 'Server Error'
  });
});

module.exports = app;
