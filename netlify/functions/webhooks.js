// Netlify function processing Stripe webhook events.
// TODO: Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET env vars.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function updateUser(session) {
  const userId = session.metadata && session.metadata.userId;
  if (!userId) return;
  await pool.query(
    `UPDATE users SET stripe_customer_id=$1, stripe_subscription_id=$2, subscription_status=$3, subscription_active=$4 WHERE id=$5`,
    [session.customer, session.subscription, 'active', true, userId]
  );
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  const signature = event.headers['stripe-signature'];
  if (!signature) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing signature' }) };
  }
  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
  }
  if (stripeEvent.type === 'checkout.session.completed') {
    await updateUser(stripeEvent.data.object);
  }
  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
