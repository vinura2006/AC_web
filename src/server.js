const app = require('./app');
const env = require('./config/env');

const server = app.listen(env.PORT, () => {
  console.log(`🚀 FrostNet Catalog server running in [${env.NODE_ENV}] mode on http://localhost:${env.PORT}`);
  console.log(`📡 Health check available at http://localhost:${env.PORT}/healthz`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
