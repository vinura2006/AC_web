const { pool, query } = require('../config/db');

let cache = null;
let lastFetched = 0;
const TTL = 60 * 1000; // 60s cache

const DEFAULTS = {
  business_name: 'FrostNet Technologies',
  tagline: 'Cooling and networking solutions, delivered',
  whatsapp_number: '94771234567',
  phone: '+94 77 123 4567',
  email: 'info@frostnet.lk',
  address: 'No. 42 Galle Road, Colombo 03, Sri Lanka',
  hours: 'Mon to Sat, 9:00 AM to 6:00 PM',
  currency_code: 'LKR',
  currency_symbol: 'Rs',
  timezone: 'Asia/Colombo',
  show_exact_stock: false,
  whatsapp_message_template: "Hi {business}, I'm interested in {product} ({price}). {url}",
  hero_title: 'Cooling and networking solutions, delivered',
  hero_subtitle: 'Direct distributor prices with genuine warranty and immediate WhatsApp quotes.',
  about_title: 'About FrostNet Technologies',
  about_body: 'Founded in Colombo, FrostNet Technologies specializes in providing premium commercial & residential air conditioning solutions alongside carrier-grade wireless networking hardware.'
};

async function getSettings() {
  const now = Date.now();
  if (cache && now - lastFetched < TTL) {
    return cache;
  }

  if (!pool) {
    return DEFAULTS;
  }

  try {
    const res = await query('SELECT key, value FROM site_settings');
    const settings = { ...DEFAULTS };
    for (const row of res.rows) {
      settings[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
    }
    cache = settings;
    lastFetched = now;
    return cache;
  } catch (err) {
    console.error('Error fetching settings, falling back to defaults:', err.message);
    return DEFAULTS;
  }
}

function invalidateSettingsCache() {
  cache = null;
  lastFetched = 0;
}

module.exports = {
  getSettings,
  invalidateSettingsCache,
  DEFAULTS
};

