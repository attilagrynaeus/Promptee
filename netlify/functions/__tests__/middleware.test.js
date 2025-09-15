const jwt = require('jsonwebtoken');
jest.mock('pg', () => {
  const { newDb } = require('pg-mem');
  const db = newDb();
  db.public.none(`CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT,
    trial_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    subscription_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`);
  const { Pool } = db.adapters.createPg();
  return { Pool };
});

process.env.JWT_SECRET = 'testsecret';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/test';
const { Pool } = require('pg');
const { handler } = require('../_middleware');

describe('middleware access control', () => {
  test('allows access during active trial', async () => {
    const pool = new Pool();
    await pool.query(
      `INSERT INTO users (email, password_hash, trial_started_at) VALUES ($1,$2,NOW())`,
      ['trial@example.com', 'hash']
    );
    const token = jwt.sign({ id: 1, email: 'trial@example.com' }, process.env.JWT_SECRET);
    const context = {};
    const res = await handler({ path: '/protected', headers: { Authorization: `Bearer ${token}` } }, context);
    expect(res).toBeUndefined();
    expect(context.user).toMatchObject({ id: 1, email: 'trial@example.com' });
  });

  test('blocks access when trial expired and no subscription', async () => {
    const pool = new Pool();
    await pool.query(
      `INSERT INTO users (email, password_hash, trial_started_at) VALUES ($1,$2,NOW() - INTERVAL '8 days')`,
      ['expired@example.com', 'hash']
    );
    const token = jwt.sign({ id: 2, email: 'expired@example.com' }, process.env.JWT_SECRET);
    const res = await handler({ path: '/protected', headers: { Authorization: `Bearer ${token}` } }, {});
    expect(res).toMatchObject({ statusCode: 402 });
  });

  test('allows access with active subscription', async () => {
    const pool = new Pool();
    await pool.query(
      `INSERT INTO users (email, password_hash, trial_started_at, subscription_active) VALUES ($1,$2,NOW() - INTERVAL '8 days', true)`,
      ['sub@example.com', 'hash']
    );
    const token = jwt.sign({ id: 3, email: 'sub@example.com' }, process.env.JWT_SECRET);
    const res = await handler({ path: '/protected', headers: { Authorization: `Bearer ${token}` } }, {});
    expect(res).toBeUndefined();
  });
});
