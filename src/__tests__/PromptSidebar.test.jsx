// src/__tests__/PromptSidebar.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromptSidebar from '../components/PromptSidebar';
import { t } from '../i18n';

jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => ({}),
  useSession: () => ({ user: { id: 'uid-1' } }),
}));

jest.mock('../hooks/usePromptDump', () => {
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
  categories: ['All Categories', 'Translate', 'Others'],
  user: { email: 'testuser@example.com' },
  favoriteOnly: false,
  setFavoriteOnly: jest.fn(),
  chainViewActive: false,
  deactivateChainView: jest.fn(),
});

describe('PromptSidebar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders username correctly', () => {
    render(<PromptSidebar {...baseProps()} />);
    expect(screen.getByText(t('PromptSidebar.LoggedInAs'))).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('fires onNew on button click', () => {
    const props = baseProps();
    render(<PromptSidebar {...props} />);
    fireEvent.click(screen.getByText(t('PromptSidebar.NewPrompt')));
    expect(props.onNew).toHaveBeenCalled();
  });

  it('updates search input', () => {
    const props = baseProps();
    render(<PromptSidebar {...props} />);
    fireEvent.change(screen.getByPlaceholderText(t('SearchFilters.SearchPlaceholder')), {
      target: { value: 'abc' },
    });
    expect(props.setSearch).toHaveBeenCalledWith('abc');
  });

  it('changes category filter', () => {
    const props = baseProps();
    render(<PromptSidebar {...props} />);
    fireEvent.change(screen.getByDisplayValue('All Categories'), {
      target: { value: 'Translate' },
    });
    expect(props.setCategoryFilter).toHaveBeenCalledWith('Translate');
  });

  it('activates favorites toggle', () => {
    const props = baseProps();
    render(<PromptSidebar {...props} />);
    fireEvent.click(screen.getByText(t('FavoritesToggle.Show')));
    expect(props.setFavoriteOnly).toHaveBeenCalledWith(true);
    expect(props.deactivateChainView).toHaveBeenCalled();
  });

  it('exit-chain button disabled when inactive', () => {
    render(<PromptSidebar {...baseProps()} />);
    expect(screen.getByText(t('PromptSidebar.ExitChain'))).toBeDisabled();
  });

  it('calls dump when "Dump Prompts" clicked', () => {
    render(<PromptSidebar {...baseProps()} />);
    fireEvent.click(screen.getByText(t('PromptSidebar.DumpPrompts')));
    // a mockDump-ot a factory-n belül hoztuk létre → 1 hívás
    expect(require('../hooks/usePromptDump').default().dump).toHaveBeenCalled();
  });
});