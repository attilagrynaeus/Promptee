import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromptCard from 'components/PromptCard';

jest.mock('context/DialogContext', () => {
  const showDialogMock = jest.fn();
  return {
    __esModule: true,
    useDialog: () => ({ showDialog: showDialogMock }),
    showDialogMock,
  };
});

jest.mock('assets/hover-icon.svg', () => 'icon.svg', { virtual: true });
jest.mock('utils/tokenCounter', () => ({ tokensOf: () => 3 }));

describe('PromptCard – restore click', () => {
  it('calls onArchive directly when restoring', () => {
    const prompt = {
      id: '1',
      title: 'T',
      description: 'D',
      content: 'C',
      user_id: 'u1',
      favorit: false,
      is_public: true,
      category: 'General',
      color: 'default',
      archived_at: '2024-01-01T00:00:00Z',
    };

    const onArchive = jest.fn();
    render(
      <PromptCard
        prompt={prompt}
        currentUserId="u1"
        onCopy={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onToggleFavorit={jest.fn()}
        onClone={jest.fn()}
        onColorChange={jest.fn()}
        onArchive={onArchive}
        onView={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTitle('Restore'));
    expect(onArchive).toHaveBeenCalledWith(prompt);
  });
});
