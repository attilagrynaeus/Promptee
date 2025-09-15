// Mock pg to use an in-memory database for tests
jest.mock('pg', () => {
  const { newDb } = require('pg-mem');
  const db = newDb();
  const { Pool } = db.adapters.createPg();
  return { Pool };
});

process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/test';

const { handler } = require('../auth');

describe('auth function', () => {
  test('register endpoint returns new user data', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/register',
      body: JSON.stringify({ email: 'first@example.com', password: 'secret' })
    };

    const res = await handler(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(201);
    expect(body).toHaveProperty('email', 'first@example.com');
    expect(body).toHaveProperty('id');
  });

  test('login and token verification succeed after registration', async () => {
    // Arrange: register the user
    await handler({
      httpMethod: 'POST',
      path: '/register',
      body: JSON.stringify({ email: 'second@example.com', password: 'secret' })
    });

    // Act: login
    const loginRes = await handler({
      httpMethod: 'POST',
      path: '/login',
      body: JSON.stringify({ email: 'second@example.com', password: 'secret' })
    });
    const loginBody = JSON.parse(loginRes.body);

    // Assert token is issued
    expect(loginRes.statusCode).toBe(200);
    expect(typeof loginBody.token).toBe('string');

    // Act: verify token via a protected path
    const verifyRes = await handler({
      httpMethod: 'POST',
      path: '/protected',
      headers: { authorization: `Bearer ${loginBody.token}` }
    });
    const verifyBody = JSON.parse(verifyRes.body);

    // Assert: token resolved to user
    expect(verifyRes.statusCode).toBe(200);
    expect(verifyBody.user.email).toBe('second@example.com');
  });
});
