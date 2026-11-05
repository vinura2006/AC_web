const { spawn } = require('child_process');
const path = require('path');

// Ensure fonts are copied before starting
require('./copy-fonts');

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

console.log('⚡ Starting development environment (Nodemon + Tailwind Watcher)...');

const tailwind = spawn(npxCmd, [
  'tailwindcss',
  '-i', './public/css/input.css',
  '-o', './public/css/output.css',
  '--watch'
], {
  stdio: 'inherit',
  shell: true
});

const server = spawn(npxCmd, [
  'nodemon',
  '--watch', 'src',
  '--ext', 'js,ejs,json',
  'src/server.js'
], {
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log('\n🛑 Shutting down dev servers...');
  if (tailwind && !tailwind.killed) tailwind.kill();
  if (server && !server.killed) server.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
