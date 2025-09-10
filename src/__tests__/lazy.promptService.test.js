import { fetchPrompts, fetchPromptContent, clonePrompt } from 'utils/promptService';

describe('Lazy loading in promptService', () => {
  test('fetchPrompts excludes heavy content field', async () => {
    const calls = { selectArg: null };
    const mockClient = {
      from: () => ({
        select: (arg) => {
          calls.selectArg = arg;
          return {
            order: () => ({ is: async () => ({ data: [], error: null }), not: async () => ({ data: [], error: null }) }),
          };
        },
      }),
    };

    await fetchPrompts(mockClient, false);
    expect(calls.selectArg).toBeTruthy();
    expect(String(calls.selectArg)).not.toMatch(/\bcontent\b/);
  });

  test('fetchPromptContent returns only content lazily', async () => {
    const mockClient = {
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: { content: 'hello' }, error: null }) }) }),
      }),
    };

    const { content, error } = await fetchPromptContent(mockClient, 'p1');
    expect(error).toBeNull();
    expect(content).toBe('hello');
  });

  test('clonePrompt lazily fetches content when missing', async () => {
    const captured = { inserted: null, selectedId: null };
    const mockClient = {
      from: (table) => {
        if (table === 'prompts') {
          return {
            select: () => ({ eq: (col, id) => ({ single: async () => { captured.selectedId = id; return { data: { content: 'CLONED-CONTENT' } }; } }) }),
            insert: (obj) => { captured.inserted = obj; return { error: null }; },
          };
        }
        return {};
      },
    };

    const error = await clonePrompt(
      mockClient,
      { id: 'abc', title: 'X', description: 'D' },
      'user-1'
    );

    expect(error).toBeNull();
    expect(captured.selectedId).toBe('abc');
    expect(captured.inserted).toEqual(
      expect.objectContaining({ content: 'CLONED-CONTENT', title: 'X (clone)' })
    );
  });
});

