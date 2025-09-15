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

process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/test';
const { Pool } = require('pg');
const { expireTrials } = require('../scripts/expireTrials');

describe('expireTrials function', () => {
  test('disables trials older than seven days', async () => {
    const pool = new Pool();
    await pool.query(
      `INSERT INTO users (email, password_hash, trial_started_at, subscription_active) VALUES ($1,$2,NOW() - INTERVAL '8 days', true)`,
      ['c@example.com', 'hash']
    );
    await expireTrials();
    const { rows } = await pool.query('SELECT subscription_active FROM users');
    expect(rows[0].subscription_active).toBe(false);
  });
});
