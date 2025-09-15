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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`);
  const { Pool } = db.adapters.createPg();
  return { Pool };
});

const mockConstructEvent = jest.fn().mockReturnValue({
  type: 'checkout.session.completed',
  data: { object: { metadata: { userId: '1' }, customer: 'cus_123', subscription: 'sub_123' } }
});
jest.mock('stripe', () => () => ({
  webhooks: { constructEvent: mockConstructEvent }
}));

process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/test';
const { Pool } = require('pg');
const { handler } = require('../webhooks');

describe('webhooks function', () => {
  test('updates user on checkout.session.completed', async () => {
    const pool = new Pool();
    await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1,$2)',
      ['a@example.com', 'hash']
    );
    const res = await handler({
      httpMethod: 'POST',
      headers: { 'stripe-signature': 'sig' },
      body: '{}'
    });
    expect(res.statusCode).toBe(200);
    const { rows } = await pool.query('SELECT * FROM users');
    expect(rows[0]).toMatchObject({
      stripe_customer_id: 'cus_123',
      stripe_subscription_id: 'sub_123',
      subscription_status: 'active'
    });
  });
});
