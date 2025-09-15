import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockShowDialog = jest.fn();
jest.mock('context/DialogContext', () => ({
  useDialog: () => ({ showDialog: mockShowDialog }),
}));

jest.mock('@supabase/auth-helpers-react', () => ({
  useSupabaseClient: () => ({}),
}));

jest.mock('utils/categoryService', () => ({
  updateCategory: jest.fn(() => Promise.resolve({ error: null })),
}));

import EditCategoryModal from 'components/EditCategoryModal';
import { updateCategory } from 'utils/categoryService';

describe('EditCategoryModal validations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderWithCats() {
    const cats = [
      { id: 'c1', name: 'Alpha' },
      { id: 'c2', name: 'Beta' },
    ];
    render(<EditCategoryModal open onClose={() => {}} categories={cats} />);
  }

  it('prevents empty name and shows error', async () => {
    renderWithCats();
    const input = screen.getByPlaceholderText('Category name');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => expect(updateCategory).not.toHaveBeenCalled());
    expect(mockShowDialog).toHaveBeenCalled();
    expect(mockShowDialog.mock.calls[0][0].message).toMatch(/cannot be empty/i);
  });

  it('prevents duplicate name and shows error', async () => {
    renderWithCats();
    const input = screen.getByPlaceholderText('Category name');
    fireEvent.change(input, { target: { value: 'beta' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => expect(updateCategory).not.toHaveBeenCalled());
    expect(mockShowDialog).toHaveBeenCalled();
    expect(mockShowDialog.mock.calls[0][0].message).toMatch(/already exists/i);
  });

  it('maps DB unique violation to duplicate message', async () => {
    (updateCategory).mockResolvedValueOnce({ error: { code: '23505', message: 'duplicate key value violates unique constraint' } });
    renderWithCats();
    const input = screen.getByPlaceholderText('Category name');
    fireEvent.change(input, { target: { value: 'Gamma' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => expect(updateCategory).toHaveBeenCalled());
    expect(mockShowDialog).toHaveBeenCalled();
    expect(mockShowDialog.mock.calls[0][0].message).toMatch(/already exists/i);
  });
});
