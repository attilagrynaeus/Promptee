// src/__tests__/PromptCard.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromptCard from 'components/PromptCard';
import { t } from 'i18n';

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

jest.mock('utils/tokenCounter', () => ({
  tokensOf: () => 3
}));

describe('PromptCard Component', () => {
  const prompt = {
    id: '1',
    title: 'Test Prompt',
    description: 'A test description',
    content: 'Prompt content',
    user_id: 'user-1',
    favorit: false,
    is_public: true,
    category: 'General',
    color: 'blue',
    archived_at: null,
  };

  const handlers = {
    onCopy:      jest.fn(),
    onEdit:      jest.fn(),
    onDelete:    jest.fn(),
    onToggleFavorit: jest.fn(),
    onClone:     jest.fn(),
    onColorChange: jest.fn(),
    onArchive: jest.fn(),
  };

  const renderCard = () =>
    render(<PromptCard prompt={prompt} currentUserId="user-1" {...handlers} />);

  beforeEach(() => jest.clearAllMocks());

  it('renders prompt details correctly', () => {
    renderCard();
    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    expect(screen.getByText('A test description')).toBeInTheDocument();
    expect(screen.getByText(t('PromptCard.Public'))).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('calls onToggleFavorit when favorite clicked', () => {
    renderCard();
    fireEvent.click(screen.getByText('☆'));
    expect(handlers.onToggleFavorit).toHaveBeenCalledWith(prompt);
  });


  it('prompts before archiving the prompt', () => {
    renderCard();
    const archiveButton = screen.getByTitle(t('PromptCard.ArchiveTooltip'));
    fireEvent.click(archiveButton);
    expect(showDialogMock).toHaveBeenCalled();
    const args = showDialogMock.mock.calls[0][0];
    args.onConfirm();
    expect(handlers.onArchive).toHaveBeenCalledWith(prompt);
  });

  it('shows restore button when archived', () => {
    const archived = { ...prompt, archived_at: '2021-01-01T00:00:00Z' };
    render(
      <PromptCard prompt={archived} currentUserId="user-1" {...handlers} />
    );
    expect(screen.getByTitle(t('PromptCard.RestoreTooltip'))).toBeInTheDocument();
  });
});