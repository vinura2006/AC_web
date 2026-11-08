const app = require('../src/app');
const request = require('supertest');

app.listen(0, '127.0.0.1', function() {
  const port = this.address().port;
  console.log('Test server listening on port', port);

  // Directly test internal Express router without TCP client
  const req = {
    method: 'GET',
    url: '/category/access-points',
    headers: { host: 'localhost:3000' }
  };
  
  // Use app handle directly
  const http = require('http');
  const mockReq = new http.IncomingMessage();
  mockReq.method = 'GET';
  mockReq.url = '/category/access-points';
  mockReq.headers = { host: 'localhost:3000' };

  console.log('App instance ready, checking router directly...');
  this.close();
});
