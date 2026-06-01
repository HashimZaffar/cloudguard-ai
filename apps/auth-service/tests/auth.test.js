const request = require('supertest');

process.env.JWT_SECRET = 'test-secret-for-auth-service';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DATABASE_URL =
  'postgresql://cloudguard_user:cloudguard_password@localhost:5432/cloudguard_auth_test_db?schema=public';

const app = require('../src/app');
const prisma = require('../src/config/prisma');

function uniqueEmail(label) {
  return `${label}-${Date.now()}-${Math.random()}@example.com`;
}

describe('Auth Service API', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  test('GET / should return service running message', async () => {
    const response = await request(app).get('/');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('CloudGuard AI Auth Service is running');
  });

  test('GET /health should return service health', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.service).toBe('auth-service');
  });

  test('GET /api-docs should make Swagger UI available', async () => {
    const response = await request(app).get('/api-docs');

    expect([200, 301, 302]).toContain(response.statusCode);
  });

  test('POST /register should register a valid user', async () => {
    const email = uniqueEmail('register');

    const response = await request(app).post('/register').send({
      name: 'Test User',
      email,
      password: 'password123',
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
    expect(response.body.user).toEqual({
      id: expect.any(Number),
      name: 'Test User',
      email,
    });
  });

  test('POST /register should not return password', async () => {
    const email = uniqueEmail('no-password');

    const response = await request(app).post('/register').send({
      name: 'Private User',
      email,
      password: 'password123',
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  test('POST /register should fail if name is missing', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        email: uniqueEmail('missing-name'),
        password: 'password123',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors).toContain('Name is required');
  });

  test('POST /register should fail if email is invalid', async () => {
    const response = await request(app).post('/register').send({
      name: 'Invalid Email User',
      email: 'invalid-email',
      password: 'password123',
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors).toContain('Email must be valid');
  });

  test('POST /register should fail if password is shorter than 8 characters', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        name: 'Short Password User',
        email: uniqueEmail('short-password'),
        password: 'short',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors).toContain('Password must be at least 8 characters');
  });

  test('POST /register should fail for duplicate email', async () => {
    const email = uniqueEmail('duplicate');

    await request(app).post('/register').send({
      name: 'First User',
      email,
      password: 'password123',
    });

    const response = await request(app).post('/register').send({
      name: 'Second User',
      email,
      password: 'password123',
    });

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe('User already exists');
  });

  test('POST /login should return a real token for correct email and password', async () => {
    const email = uniqueEmail('login');

    await request(app).post('/register').send({
      name: 'Login User',
      email,
      password: 'password123',
    });

    const response = await request(app).post('/login').send({
      email,
      password: 'password123',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(typeof response.body.token).toBe('string');
    expect(response.body.token.length).toBeGreaterThan(0);
    expect(response.body.token).not.toBe('fake-jwt-token-for-learning');
  });

  test('POST /login should fail with wrong password', async () => {
    const email = uniqueEmail('wrong-password');

    await request(app).post('/register').send({
      name: 'Wrong Password User',
      email,
      password: 'password123',
    });

    const response = await request(app).post('/login').send({
      email,
      password: 'wrong-password',
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid email or password');
  });

  test('POST /login should fail when email is missing', async () => {
    const response = await request(app).post('/login').send({
      password: 'password123',
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Validation failed');
    expect(response.body.errors).toContain('Email is required');
  });

  test('GET /profile should succeed when valid Bearer token is provided', async () => {
    const email = uniqueEmail('profile');

    await request(app).post('/register').send({
      name: 'Profile User',
      email,
      password: 'password123',
    });

    const loginResponse = await request(app).post('/login').send({
      email,
      password: 'password123',
    });

    const response = await request(app)
      .get('/profile')
      .set('Authorization', `Bearer ${loginResponse.body.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Profile fetched successfully');
    expect(response.body.user).toEqual({
      id: expect.any(Number),
      name: 'Profile User',
      email,
    });
  });

  test('GET /profile should fail when token is missing', async () => {
    const response = await request(app).get('/profile');

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Authentication token is required');
  });

  test('GET /profile should fail when token is invalid', async () => {
    const response = await request(app)
      .get('/profile')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid or expired token');
  });

  test('GET /profile should never return password or passwordHash', async () => {
    const email = uniqueEmail('profile-private');

    await request(app).post('/register').send({
      name: 'Private Profile User',
      email,
      password: 'password123',
    });

    const loginResponse = await request(app).post('/login').send({
      email,
      password: 'password123',
    });

    const response = await request(app)
      .get('/profile')
      .set('Authorization', `Bearer ${loginResponse.body.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  test('unknown route should return 404', async () => {
    const response = await request(app).get('/unknown-route');

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Route not found');
  });
});
