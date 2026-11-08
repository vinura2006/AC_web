const fs = require('fs');
const path = require('path');
const { DEMO_PRODUCTS } = require('../src/db/seed-demo');

const sourceDir = path.join(__dirname, '../images_for ac');
const destDir = path.join(__dirname, '../public/uploads/demo');
fs.mkdirSync(destDir, { recursive: true });

// Copy images
const files = fs.readdirSync(sourceDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
files.forEach(f => {
  fs.copyFileSync(path.join(sourceDir, f), path.join(destDir, f));
});

console.log(`Copied ${files.length} real AC images into public/uploads/demo!`);

