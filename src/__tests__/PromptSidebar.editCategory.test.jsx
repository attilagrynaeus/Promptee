import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
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

jest.mock('hooks/usePromptDump', () => {
  const mockDump = jest.fn();
  const mockHook = jest.fn(() => ({
    dump: mockDump,
    loading: false,
    error: null,
  }));
  return {
    __esModule: true,
    default: (...args) => mockHook(...args),
  };
});

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
    { id: 'c', name: 'C' },
  ],
  user: { email: 'user@example.com' },
  favoriteOnly: false,
  setFavoriteOnly: jest.fn(),
  chainViewActive: false,
  deactivateChainView: jest.fn(),
});

describe('PromptSidebar Edit Category integration', () => {
  it('opens modal and shows category names from categoriesData', () => {
    render(
      <UIProvider>
        <PromptSidebar {...baseProps()} />
      </UIProvider>
    );

    fireEvent.click(screen.getByText(t('PromptSidebar.EditCategory')));
    const modal = screen.getByText('Edit Categories').closest('div');
    const options = within(modal).getAllByRole('option');
    const texts = options.map(o => o.textContent);
    expect(texts).toEqual(['A', 'B', 'C']);
  });

  it('limits to max 100 options', () => {
    const many = Array.from({ length: 120 }, (_, i) => ({ id: `c${i}`, name: `Cat ${i}` }));
    const props = baseProps();
    render(
      <UIProvider>
        <PromptSidebar {...props} categoriesData={many} />
      </UIProvider>
    );
    fireEvent.click(screen.getByText(t('PromptSidebar.EditCategory')));
    const modal = screen.getByText('Edit Categories').closest('div');
    const options = within(modal).getAllByRole('option');
    expect(options.length).toBe(100);
  });
});
