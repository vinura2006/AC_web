const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');

test('GET /healthz returns status 200 with ok: true', async () => {
  const res = await request(app)
    .get('/healthz')
    .expect('Content-Type', /json/)
    .expect(200);

  assert.strictEqual(res.body.ok, true);
  assert.strictEqual(typeof res.body.db, 'boolean');
});

test('GET / returns status 200 with FrostNet title and layout', async () => {
  const res = await request(app)
    .get('/')
    .expect('Content-Type', /html/)
    .expect(200);

  assert.match(res.text, /FrostNet/);
});
