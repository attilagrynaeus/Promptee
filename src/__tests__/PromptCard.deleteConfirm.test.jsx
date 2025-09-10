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
const { showDialogMock } = require('context/DialogContext');

jest.mock('assets/hover-icon.svg', () => 'icon.svg', { virtual: true });
jest.mock('utils/tokenCounter', () => ({ tokensOf: () => 3 }));

describe('PromptCard – delete confirm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('prompts and calls onDelete after confirm', () => {
    const prompt = {
      id: 'xyz',
      title: 'T',
      description: 'D',
      content: 'C',
      user_id: 'u1',
      favorit: false,
      is_public: true,
      category: 'General',
      color: 'default',
      archived_at: null,
    };

    const onDelete = jest.fn();
    render(
      <PromptCard
        prompt={prompt}
        currentUserId="u1"
        onCopy={jest.fn()}
        onEdit={jest.fn()}
        onDelete={onDelete}
        onToggleFavorit={jest.fn()}
        onClone={jest.fn()}
        onColorChange={jest.fn()}
        onArchive={jest.fn()}
        onView={jest.fn()}
      />
    );

    fireEvent.click(screen.getByTitle('Delete'));
    expect(showDialogMock).toHaveBeenCalled();
    const args = showDialogMock.mock.calls[0][0];
    args.onConfirm();
    expect(onDelete).toHaveBeenCalledWith('xyz');
  });
});

