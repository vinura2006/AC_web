const fs = require('fs');
const path = require('path');
const { DEMO_PRODUCTS } = require('../src/db/seed-demo');

function createSvgPlaceholder(name, categoryName, color1 = '#0E1626', color2 = '#22D3EE') {
  return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cyber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" stop-opacity="0.3" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22D3EE" stroke-opacity="0.1" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="#070B14" />
  <rect width="100%" height="100%" fill="url(#cyber-grad)" />
  <rect width="100%" height="100%" fill="url(#grid)" />
  <circle cx="400" cy="250" r="120" fill="none" stroke="${color2}" stroke-width="2" stroke-dasharray="8 6" opacity="0.4"/>
  <text x="400" y="240" font-family="sans-serif" font-weight="700" font-size="28" fill="#E6EDF7" text-anchor="middle">${categoryName}</text>
  <text x="400" y="280" font-family="monospace" font-size="16" fill="${color2}" text-anchor="middle">${name}</text>
  <text x="400" y="550" font-family="sans-serif" font-size="13" fill="#8FA3BF" text-anchor="middle">FrostNet Technologies</text>
</svg>`;
}

const dir = path.join(__dirname, '../public/uploads/demo');
fs.mkdirSync(dir, { recursive: true });

for (const p of DEMO_PRODUCTS) {
  const cat = p.category_slug === 'air-conditioners' ? 'Air Conditioners' : 'Access Points';
  fs.writeFileSync(path.join(dir, `${p.slug}-1.svg`), createSvgPlaceholder(p.model, cat, '#0E1626', '#22D3EE'));
  fs.writeFileSync(path.join(dir, `${p.slug}-2.svg`), createSvgPlaceholder(p.brand, cat, '#141F36', '#8B5CF6'));
}

console.log('Generated demo SVG placeholder images successfully!');

