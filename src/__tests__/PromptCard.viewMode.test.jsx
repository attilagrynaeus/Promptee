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

describe('PromptCard – viewer mode', () => {
  it('shows View and calls onView for non-owner', () => {
    const prompt = {
      id: '1',
      title: 'T',
      description: 'D',
      content: 'C',
      user_id: 'owner',
      favorit: false,
      is_public: false,
      category: 'General',
      color: 'default',
      archived_at: null,
    };

    const onView = jest.fn();
    render(
      <PromptCard
        prompt={prompt}
        currentUserId="other-user"
        onCopy={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onToggleFavorit={jest.fn()}
        onClone={jest.fn()}
        onColorChange={jest.fn()}
        onArchive={jest.fn()}
        onView={onView}
      />
    );

    const btn = screen.getByTitle('View');
    fireEvent.click(btn);
    expect(onView).toHaveBeenCalledWith(prompt);
  });
});
