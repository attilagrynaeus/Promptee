import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromptFormModal from '../components/PromptFormModal';
import { t } from '../i18n';

// React-DOM portal mock
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node) => node,
}));

jest.mock('../utils/tokenCounter', () => ({
  tokensOf: () => 42,
}));

describe('PromptFormModal', () => {
  const baseProps = {
    prompt: {},
    categories: [{ id: 'c1', name: 'Others' }],
    prompts: [],
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  it('updates inputs and calls onSave & onClose', async () => {
    render(<PromptFormModal {...baseProps} />);

    fireEvent.change(screen.getByPlaceholderText(t('PromptForm.TitlePlaceholder')), { target: { value: 'My title' } });
    fireEvent.change(screen.getByPlaceholderText(t('PromptForm.ContentPlaceholder')), { target: { value: 'Hello' } });

    fireEvent.click(screen.getByText(t('PromptForm.Save')));

    await waitFor(() => {
      expect(baseProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'My title', content: 'Hello' })
      );
      expect(baseProps.onClose).toHaveBeenCalled();
    });
  });
});