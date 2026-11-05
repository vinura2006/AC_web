const express = require('express');
const router = express.Router();
const { pool, query } = require('../config/db');

router.get('/healthz', async (req, res) => {
  let dbOk = false;
  if (pool) {
    try {
      await query('SELECT 1');
      dbOk = true;
    } catch {
      dbOk = false;
    }
  }

  res.status(200).json({
    ok: true,
    db: dbOk,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

