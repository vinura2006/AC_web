const test = require('node:test');
const assert = require('node:assert');
const { calculatePricing } = require('../src/lib/pricing');
const { getStockStatus } = require('../src/lib/stock');
const { formatPrice, formatDate } = require('../src/lib/format');
const { buildWhatsAppLink } = require('../src/lib/whatsapp');
const { renderMarkdown } = require('../src/lib/markdown');

test('calculatePricing: regular product without sale price', () => {
  const result = calculatePricing(100000);
  assert.strictEqual(result.isOnOffer, false);
  assert.strictEqual(result.currentPrice, 100000);
  assert.strictEqual(result.savings, 0);
  assert.strictEqual(result.discountPercent, 0);
});

test('calculatePricing: valid active offer', () => {
  const future = new Date(Date.now() + 86400000).toISOString();
  const result = calculatePricing(200000, 160000, future);
  assert.strictEqual(result.isOnOffer, true);
  assert.strictEqual(result.currentPrice, 160000);
  assert.strictEqual(result.originalPrice, 200000);
  assert.strictEqual(result.savings, 40000);
  assert.strictEqual(result.discountPercent, 20);
});

test('calculatePricing: expired offer falls back to regular price', () => {
  const past = new Date(Date.now() - 86400000).toISOString();
  const result = calculatePricing(200000, 160000, past);
  assert.strictEqual(result.isOnOffer, false);
  assert.strictEqual(result.currentPrice, 200000);
});

test('calculatePricing: salePrice >= price is ignored', () => {
  const result = calculatePricing(200000, 210000);
  assert.strictEqual(result.isOnOffer, false);
  assert.strictEqual(result.currentPrice, 200000);
});

test('getStockStatus: zero or negative stock', () => {
  const out = getStockStatus(0);
  assert.strictEqual(out.status, 'out_of_stock');
  assert.strictEqual(out.inStock, false);
  assert.strictEqual(out.label, 'Out of stock');
});

test('getStockStatus: low stock threshold', () => {
  const low = getStockStatus(2, 3);
  assert.strictEqual(low.status, 'low_stock');
  assert.strictEqual(low.inStock, true);
  assert.strictEqual(low.label, 'Only 2 left');
});

test('getStockStatus: healthy stock with and without exact count', () => {
  const normal = getStockStatus(15, 3, false);
  assert.strictEqual(normal.label, 'In stock');

  const exact = getStockStatus(15, 3, true);
  assert.strictEqual(exact.label, 'In stock (15 available)');
});

test('formatPrice: formats currency with thousands separators and no decimal when .00', () => {
  assert.strictEqual(formatPrice(189000), 'Rs 189,000');
  assert.strictEqual(formatPrice(189000.5), 'Rs 189,000.50');
});

test('buildWhatsAppLink: builds valid wa.me URL with token replacements', () => {
  const url = buildWhatsAppLink({
    whatsappNumber: '94771234567',
    businessName: 'FrostNet',
    product: 'Daikin AC',
    price: 'Rs 150,000',
    url: 'https://frostnet.lk/product/daikin-ac'
  });

  assert.match(url, /^https:\/\/wa\.me\/94771234567\?text=/);
  assert.ok(url.includes(encodeURIComponent('Daikin AC')));
  assert.ok(url.includes(encodeURIComponent('Rs 150,000')));
});

test('renderMarkdown: strips script tags and renders safe HTML', () => {
  const dirty = '### Specifications\n- Point 1\n<script>alert("xss")</script>';
  const clean = renderMarkdown(dirty);
  assert.ok(!clean.includes('<script>'));
  assert.ok(!clean.includes('alert('));
  assert.ok(clean.includes('<h3>Specifications</h3>'));
  assert.ok(clean.includes('<li>Point 1</li>'));
});

