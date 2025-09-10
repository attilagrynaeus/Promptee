import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

describe('PromptCard – copy tooltip behaviour', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

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
    archived_at: null,
  };

  it('shows and hides the Copied tooltip', async () => {
    const onCopy = jest.fn(() => new Promise((res) => setTimeout(res, 10)));
    render(
      <PromptCard
        prompt={prompt}
        currentUserId="u1"
        onCopy={onCopy}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onToggleFavorit={jest.fn()}
        onClone={jest.fn()}
        onColorChange={jest.fn()}
        onArchive={jest.fn()}
        onView={jest.fn()}
      />
    );

    const btn = screen.getByTitle('Copy');
    fireEvent.click(btn);
    // resolve onCopy
    await act(async () => {
      jest.advanceTimersByTime(12);
    });

    expect(screen.getByText(/Copied/i)).toBeInTheDocument();

    // tooltip auto hide
    await act(async () => {
      jest.advanceTimersByTime(1600);
    });
    expect(screen.queryByText(/Copied/i)).not.toBeInTheDocument();
  });
});
