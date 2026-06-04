const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-for-auth-service';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DATABASE_URL =
  'postgresql://cloudguard_user:cloudguard_password@localhost:5432/cloudguard_auth_test_db?schema=public';

const app = require('../src/app');

describe('Prometheus metrics API', () => {
  test('GET /metrics should return Prometheus metrics text', async () => {
    await request(app).get('/health');

    const response = await request(app).get('/metrics');

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.text).toContain('process_cpu_user_seconds_total');
    expect(response.text).toContain('cloudguard_auth_http_requests_total');
  });
});
