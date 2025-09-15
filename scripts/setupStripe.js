// Script to create Stripe product and price for monthly subscription.
// TODO: Run manually with STRIPE_SECRET_KEY set and store resulting price ID.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createProductAndPrice() {
  const product = await stripe.products.create({ name: 'Monthly Subscription' });
  const price = await stripe.prices.create({
    unit_amount: 1000, // TODO: adjust amount
    currency: 'usd',
    recurring: { interval: 'month' },
    product: product.id
  });
  console.log('Created price:', price.id);
}

createProductAndPrice().catch((err) => {
  console.error(err);
  process.exit(1);
});
