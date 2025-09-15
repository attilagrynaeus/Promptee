// Netlify function generating Stripe checkout sessions.
// TODO: Set STRIPE_SECRET_KEY, STRIPE_PRICE_ID, SUCCESS_URL, and CANCEL_URL in env vars.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createSession(userId, successUrl, cancelUrl) {
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    subscription_data: { trial_period_days: 7 },
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId }
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  try {
    const { userId, successUrl, cancelUrl } = JSON.parse(event.body || '{}');
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'User ID required' }) };
    }
    const session = await createSession(
      userId,
      successUrl || 'https://example.com/success',
      cancelUrl || 'https://example.com/cancel'
    );
    return { statusCode: 200, body: JSON.stringify({ id: session.id }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
