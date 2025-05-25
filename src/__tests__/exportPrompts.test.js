// src/__tests__/exportPrompts.test.js
import { exportPrompts } from '../utils/exportPrompts';

describe('exportPrompts util', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    global.URL.createObjectURL = jest.fn(() => 'blob:url');
  });

  it('triggers Blob download', async () => {
    const supabaseMock = {
      from: () => ({
        select: () => ({
          eq: () => ({ data: [], error: null })
        })
      })
    };

    await exportPrompts({
      supabase: supabaseMock,
      userId: 'u1',
      username: 'tester'
    });

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  });
});