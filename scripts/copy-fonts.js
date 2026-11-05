const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, '../public/fonts');
const cssDir = path.join(__dirname, '../public/css');

if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}
if (!fs.existsSync(cssDir)) {
  fs.mkdirSync(cssDir, { recursive: true });
}

const fontConfigs = [
  {
    family: 'Space Grotesk',
    pkg: 'space-grotesk',
    weights: [400, 500, 600, 700]
  },
  {
    family: 'Inter',
    pkg: 'inter',
    weights: [400, 500, 600, 700]
  },
  {
    family: 'JetBrains Mono',
    pkg: 'jetbrains-mono',
    weights: [400, 500, 600]
  }
];

let cssRules = [];

fontConfigs.forEach(({ family, pkg, weights }) => {
  const sourceFilesDir = path.join(__dirname, `../node_modules/@fontsource/${pkg}/files`);
  if (!fs.existsSync(sourceFilesDir)) {
    console.warn(`Font directory not found: ${sourceFilesDir}`);
    return;
  }

  weights.forEach(weight => {
    const fileName = `${pkg}-latin-${weight}-normal.woff2`;
    const srcPath = path.join(sourceFilesDir, fileName);
    const destPath = path.join(fontsDir, fileName);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      cssRules.push(`
@font-face {
  font-family: '${family}';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url('/fonts/${fileName}') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}`);
    }
  });
});

const fontsCssPath = path.join(cssDir, 'fonts.css');
fs.writeFileSync(fontsCssPath, cssRules.join('\n') + '\n');
console.log('✅ Self-hosted fonts copied to public/fonts and fonts.css generated.');
