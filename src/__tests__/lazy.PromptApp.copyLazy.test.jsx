import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UIProvider } from 'context/UIContext';
import PromptApp from 'PromptApp';

jest.mock('assets/hover-icon.svg', () => 'icon.svg', { virtual: true });

const supabase = {
  from: () => ({
    select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
    order: () => Promise.resolve({ data: [], error: null }),
  }),
};

jest.mock('supabaseClient', () => ({
  supabase,
}));

jest.mock('@supabase/auth-helpers-react', () => ({
  useSession: () => ({ user: { id: 'u1' } }),
}));

jest.mock('hooks/useProfile', () => ({
  __esModule: true,
  default: () => ({ profile: { role: 'User', subscription_active: true }, loading: false }),
}));

const mockPrompts = [
  {
    id: 'p1',
    user_id: 'u1',
    title: 'A',
    description: 'd',
    is_public: true,
    sort_order: 0,
    favorit: false,
    categories: { name: 'Others' },
    color: 'default',
  },
];

const mockCategories = [{ id: 'c1', name: 'Others' }];

const mockUsePromptData = {
  prompts: mockPrompts,
  categories: mockCategories,
  handleSave: jest.fn(),
  handleDelete: jest.fn(),
  handleClone: jest.fn(),
  handleArchive: jest.fn(),
  fetchPrompts: jest.fn(),
};

jest.mock('hooks/usePromptData', () => ({
  __esModule: true,
  default: () => mockUsePromptData,
}));

jest.mock('context/DialogContext', () => ({
  useDialog: () => ({ showDialog: jest.fn() }),
}));

jest.mock('utils/promptService', () => {
  const api = {
    toggleFavorit: jest.fn(),
    fetchPromptContent: jest.fn(async () => ({ content: 'LAZY', error: null })),
  };
  return api;
});

describe('PromptApp – copy uses lazy content fetch', () => {
  const { fetchPromptContent } = require('utils/promptService');

  beforeEach(() => {
    fetchPromptContent.mockClear();
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  it('fetches content on copy and writes to clipboard', async () => {
    render(
      <UIProvider>
        <PromptApp />
      </UIProvider>
    );

    fireEvent.click(screen.getByTitle('Copy'));

    await waitFor(() => expect(fetchPromptContent).toHaveBeenCalled());
    expect(fetchPromptContent).toHaveBeenCalledWith(expect.any(Object), 'p1');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('LAZY');
  });
});
