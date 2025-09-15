import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromptSidebar from 'components/PromptSidebar';
import { UIProvider } from 'context/UIContext';
import { t } from 'i18n';

jest.mock('context/DialogContext', () => ({
  useDialog: () => ({ showDialog: jest.fn() }),
}));

jest.mock('@supabase/auth-helpers-react', () => ({
  useSession: () => ({ user: { id: 'uid-1' } }),
}));

jest.mock('utils/categoryService', () => ({
  updateCategory: jest.fn(() => Promise.resolve({ error: null })),
}));

import { updateCategory } from 'utils/categoryService';

const baseProps = () => ({
  search: '',
  setSearch: jest.fn(),
  categoryFilter: 'All Categories',
  setCategoryFilter: jest.fn(),
  onNew: jest.fn(),
  categories: ['All Categories', 'A', 'B'],
  categoriesData: [
    { id: 'a', name: 'A' },
    { id: 'b', name: 'B' },
  ],
  reloadCategories: jest.fn(),
  user: { email: 'user@example.com' },
  favoriteOnly: false,
  setFavoriteOnly: jest.fn(),
  chainViewActive: false,
  deactivateChainView: jest.fn(),
});

describe('PromptSidebar Edit Category refresh', () => {
  it('calls reloadCategories after successful save', async () => {
    const props = baseProps();
    render(
      <UIProvider>
        <PromptSidebar {...props} />
      </UIProvider>
    );

    fireEvent.click(screen.getByText(t('PromptSidebar.EditCategory')));
    const input = screen.getByPlaceholderText('Category name');
    fireEvent.change(input, { target: { value: 'A new' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => expect(updateCategory).toHaveBeenCalled());
    expect(props.reloadCategories).toHaveBeenCalled();
  });
});

