import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('context/DialogContext', () => ({
  useDialog: () => ({ showDialog: jest.fn() }),
}));

jest.mock('utils/categoryService', () => ({
  updateCategory: jest.fn(() => Promise.resolve({ error: null })),
}));

import EditCategoryModal from 'components/EditCategoryModal';
import { updateCategory } from 'utils/categoryService';

describe('EditCategoryModal', () => {
  it('lists category names in dropdown', () => {
    const cats = [
      { id: 'c1', name: 'One' },
      { id: 'c2', name: 'Two' },
      { id: 'c3', name: 'Three' },
    ];
    render(<EditCategoryModal open onClose={() => {}} categories={cats} />);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('One');
    expect(options[1]).toHaveTextContent('Two');
    expect(options[2]).toHaveTextContent('Three');
  });

  it('saves rename when clicking Save (flush)', async () => {
    const cats = [
      { id: 'c1', name: 'Alpha' },
      { id: 'c2', name: 'Beta' },
    ];
    render(<EditCategoryModal open onClose={() => {}} categories={cats} />);

    const input = screen.getByPlaceholderText('Category name');
    fireEvent.change(input, { target: { value: 'Alpha Prime' } });

    // Click Save to flush any pending change immediately
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(updateCategory).toHaveBeenCalled());

    const [supabaseArg, idArg, nameArg] = updateCategory.mock.calls[0];
    expect(idArg).toBe('c1');
    expect(nameArg).toBe('Alpha Prime');
    expect(typeof supabaseArg).toBe('object');
  });
});
