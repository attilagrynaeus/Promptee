const mockCreate = jest.fn().mockResolvedValue({ id: 'sess_123' });
jest.mock(
  'stripe',
  () => () => ({
    checkout: { sessions: { create: mockCreate } }
  }),
  { virtual: true }
);

process.env.STRIPE_PRICE_ID = 'price_test';
const { handler } = require('../checkout');

describe('checkout function', () => {
  test('creates session on POST', async () => {
    const res = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ userId: '1' })
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).id).toBe('sess_123');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ subscription_data: { trial_period_days: 7 } })
    );
  });

  test('rejects non-POST', async () => {
    const res = await handler({ httpMethod: 'GET' });
    expect(res.statusCode).toBe(405);
  });
});
