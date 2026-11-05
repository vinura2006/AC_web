const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { pool, query } = require('../../config/db');

// Strict Rate Limiting on Login: 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts from this IP, please try again after 15 minutes.'
});

// GET /admin/login
router.get('/login', (req, res) => {
  if (req.session && req.session.adminUser) {
    return res.redirect('/admin');
  }
  res.render('admin/login', {
    layout: false,
    title: 'Portal Access | Admin Sign In',
    error: null
  });
});

// POST /admin/login with rate limiter
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('admin/login', {
      layout: false,
      title: 'Portal Access | Admin Sign In',
      error: 'Please enter both email and password.'
    });
  }

  // 1. Check live PostgreSQL database if connected
  if (pool) {
    try {
      const result = await query(
        'SELECT id, name, email, password_hash, role, is_active FROM admin_users WHERE email = $1',
        [email.toLowerCase().trim()]
      );

      const user = result.rows[0];
      if (user && user.is_active) {
        const matches = await bcrypt.compare(password, user.password_hash);
        if (matches) {
          req.session.adminUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          };
          return res.redirect('/admin');
        }
      }
    } catch (err) {
      console.error('Database login error:', err);
    }
  }

  // 2. Default credentials for local development & demonstration:
  // Username: admin@frostnet.lk / Password: adminpassword123
  if (
    email.toLowerCase().trim() === 'admin@frostnet.lk' &&
    password === 'adminpassword123'
  ) {
    req.session.adminUser = {
      id: 1,
      name: 'System Administrator',
      email: 'admin@frostnet.lk',
      role: 'owner'
    };
    return res.redirect('/admin');
  }

  // Invalid credentials
  return res.render('admin/login', {
    layout: false,
    title: 'Portal Access | Admin Sign In',
    error: 'Invalid credentials. Please verify your email and password.'
  });
});

// GET /admin/logout
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect('/admin/login');
    });
  } else {
    res.redirect('/admin/login');
  }
});

module.exports = router;
