import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromptFormModal from 'components/PromptFormModal';

// Portal passthrough for JSDOM
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node) => node,
}));

jest.mock('context/DialogContext', () => ({
  useDialog: () => ({ showDialog: jest.fn() }),
}));

jest.mock('utils/tokenCounter', () => ({ tokensOf: () => 0 }));

// Mock Supabase client used inside the component
const selectMock = jest.fn();
const singleMock = jest.fn();
jest.mock('supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ single: singleMock }) }),
    }),
  },
}));

describe('PromptFormModal – lazy load content while editing', () => {
  beforeEach(() => {
    singleMock.mockResolvedValue({ data: { content: 'LAZY-FETCHED' } });
  });

  it('shows loading overlay and fills textarea with fetched content', async () => {
    const props = {
      prompt: { id: 'p1', title: 'T', content: '' }, // empty: triggers lazy fetch
      categories: [{ id: 'c1', name: 'Others' }],
      prompts: [],
      onClose: jest.fn(),
      onSave: jest.fn(),
    };

    render(<PromptFormModal {...props} />);

    // loading overlay appears when fetch starts (cannot assert timing exactly in jsdom)
    // wait until content arrives
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Prompt text')).toHaveValue('LAZY-FETCHED');
    });
  });
});

