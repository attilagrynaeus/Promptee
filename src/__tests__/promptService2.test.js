import { createInMemoryDb } from './inMemoryDb';

let db, client;
const userId = 'test-user-uuid';

beforeEach(() => {
  db = createInMemoryDb();
  client = db.adapters.createPgPromise();
});
async function createPrompt(fields) {
  const { title, content, user_id, favorit = false, sort_order = 1 } = fields;
  const result = await client.one(`
    INSERT INTO prompts (title, content, user_id, favorit, sort_order)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *;
  `, [title, content, user_id, favorit, sort_order]);
  return { data: result };
}

async function setFavoriteWithLimit(promptId, userId) {
  const result = await client.one(`
    SELECT set_favorite_with_limit($1, $2) AS status;
  `, [promptId, userId]);
  return result.status;
}

describe('Prompt Favorite Logic Integration Tests', () => {
  let promptId;

  beforeEach(async () => {
    const { data } = await createPrompt({
      title: 'Test Prompt',
      content: 'Test content',
      user_id: userId
    });
    promptId = data.id;
  });

  test('Favorite first prompt successfully', async () => {
    const result = await setFavoriteWithLimit(promptId, userId);
    expect(result).toBe('success');

    const data = await client.one(
      `SELECT favorit, sort_order FROM prompts WHERE id=$1`,
      [promptId]
    );

    expect(data.favorit).toBe(true);
    expect(data.sort_order).toBe(1);
  });

  test('Exceed favorite limit', async () => {
    for (let i = 0; i < 25; i++) {
      await createPrompt({
        title: `Prompt ${i}`,
        content: 'content',
        user_id: userId,
        favorit: true,
        sort_order: i + 1
      });
    }

    const newPrompt = await createPrompt({
      title: 'Extra prompt',
      content: 'Extra content',
      user_id: userId
    });

    const result = await setFavoriteWithLimit(newPrompt.data.id, userId);
    expect(result).toBe('limit_reached');
  });

  test('Sort order is conflict-free after multiple favorites', async () => {
    const promptA = await createPrompt({ title: 'A', content: 'A', user_id: userId });
    const promptB = await createPrompt({ title: 'B', content: 'B', user_id: userId });

    await setFavoriteWithLimit(promptA.data.id, userId);
    await setFavoriteWithLimit(promptB.data.id, userId);

    const rows = await client.many(
      `SELECT id, sort_order FROM prompts WHERE user_id=$1 ORDER BY sort_order ASC`,
      [userId]
    );

    const orders = rows.map(r => r.sort_order);
    const uniqueOrders = new Set(orders);

    expect(orders.length).toBe(uniqueOrders.size);
    expect(rows[0].id).toBe(promptB.data.id);
    expect(rows[1].id).toBe(promptA.data.id);
  });
});