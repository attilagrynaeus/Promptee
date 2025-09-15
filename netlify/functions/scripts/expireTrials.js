// Netlify scheduled function disabling expired trials.
// TODO: Ensure DATABASE_URL env var is set.
const { schedule } = require('@netlify/functions');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function expireTrials() {
  await pool.query(
    "UPDATE users SET subscription_active=false WHERE (stripe_subscription_id IS NULL OR stripe_subscription_id='') AND trial_started_at < NOW() - INTERVAL '7 days'"
  );
  return { statusCode: 200, body: 'Expired trials processed' };
}

exports.expireTrials = expireTrials;
exports.handler = schedule('0 0 * * *', expireTrials);
