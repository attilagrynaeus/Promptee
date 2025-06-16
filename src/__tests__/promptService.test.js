// src/__tests__/promptService.test.js
import { toggleFavorit } from 'utils/promptService';

const mockRpc = jest.fn();
const mockFrom = jest.fn();

const mockSupabase = {
  rpc: mockRpc,
  from: mockFrom,
};

describe('toggleFavorit', () => {

  // UUID mock is valid only within this block
  jest.mock('uuid', () => ({ v4: () => 'test-uuid' }), { virtual: true });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully set prompt as favorite', async () => {
    mockRpc.mockResolvedValue({ data: 'success', error: null });

    const prompt = { id: '123', favorit: false };
    const result = await toggleFavorit(mockSupabase, prompt, 'user-uuid');

    expect(mockRpc).toHaveBeenCalledWith('set_favorite_with_limit', {
      prompt_id: '123',
      user_uuid: 'user-uuid',
    });

    expect(result.error).toBeNull();
  });

  it('should handle favorite limit reached error', async () => {
    mockRpc.mockResolvedValue({ data: 'limit_reached', error: null });

    const prompt = { id: '123', favorit: false };
    const result = await toggleFavorit(mockSupabase, prompt, 'user-uuid');

    expect(result.error).toEqual('Maximum number of favorites reached (25).');
  });

  it('should remove prompt from favorites correctly', async () => {
    mockRpc.mockResolvedValue({ error: null });

    const prompt = { id: '123', favorit: true };
    const result = await toggleFavorit(mockSupabase, prompt, 'user-uuid');

    expect(mockRpc).toHaveBeenCalledWith('bump_sort_order', { p_id: '123' });
    expect(result.error).toBeNull();
  });
});
