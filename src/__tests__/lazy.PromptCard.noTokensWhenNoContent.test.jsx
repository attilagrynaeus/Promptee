import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromptCard from 'components/PromptCard';

jest.mock('assets/hover-icon.svg', () => 'icon.svg', { virtual: true });
jest.mock('utils/tokenCounter', () => ({ tokensOf: () => 123 }));
jest.mock('context/DialogContext', () => ({
  useDialog: () => ({ showDialog: jest.fn() }),
}));

describe('PromptCard – no token count when content is lazy', () => {
  it('does not render token badge when content is absent', () => {
    const prompt = {
      id: '1',
      title: 'T',
      description: 'D',
      // no `content` field -> represents list item from fetchPrompts
      user_id: 'u1',
      favorit: false,
      is_public: true,
      category: 'Others',
    };

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
        onArchive={jest.fn()}
        onView={jest.fn()}
      />
    );

    expect(screen.queryByText(/tokens/i)).not.toBeInTheDocument();
  });
});

