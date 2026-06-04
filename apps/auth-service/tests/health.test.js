const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-for-auth-service';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DATABASE_URL =
  'postgresql://cloudguard_user:cloudguard_password@localhost:5432/cloudguard_auth_test_db?schema=public';

const app = require('../src/app');

describe('Health and readiness API', () => {
  test('GET /health should return liveness details', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.service).toBe('auth-service');
    expect(response.body.timestamp).toEqual(expect.any(String));
    expect(response.body.uptimeSeconds).toEqual(expect.any(Number));
  });

  test('GET /ready should return readiness structure', async () => {
    const response = await request(app).get('/ready');

    expect([200, 503]).toContain(response.statusCode);
    expect(['ready', 'not_ready']).toContain(response.body.status);
    expect(response.body.service).toBe('auth-service');
    expect(['connected', 'disconnected']).toContain(response.body.database);
    expect(response.body.timestamp).toEqual(expect.any(String));
  });

  test('GET /health/db should return database health structure', async () => {
    const response = await request(app).get('/health/db');

    expect([200, 503]).toContain(response.statusCode);
    expect(['healthy', 'unhealthy']).toContain(response.body.status);
    expect(['connected', 'disconnected']).toContain(response.body.database);
    expect(response.body.timestamp).toEqual(expect.any(String));
  });
});
