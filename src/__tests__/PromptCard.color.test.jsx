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

describe('PromptCard – color stripe and picker', () => {
  const base = {
    id: 'p1',
    title: 'T',
    description: 'D',
    content: 'C',
    user_id: 'u1',
    favorit: false,
    is_public: true,
    category: 'General',
    color: 'blue',
    archived_at: null,
  };

  it('applies CSS custom property for stripe color', () => {
    const { container } = render(
      <PromptCard
        prompt={base}
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

    const root = container.querySelector('.promptcard');
    expect(root).toBeInTheDocument();
    const style = root.getAttribute('style') || '';
    expect(style).toMatch(/--stripe-color:\s*rgba\(30,144,255,0.40\)/);
  });

  it('opens the color picker and calls onColorChange', () => {
    const onColorChange = jest.fn();
    const { container } = render(
      <PromptCard
        prompt={base}
        currentUserId="u1"
        onCopy={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        onToggleFavorit={jest.fn()}
        onClone={jest.fn()}
        onColorChange={onColorChange}
        onArchive={jest.fn()}
        onView={jest.fn()}
      />
    );

    // Open
    fireEvent.click(screen.getByTitle('Color'));
    expect(container.querySelector('.color-picker-menu')).toBeInTheDocument();

    // Choose green (index 2: default, blue, green, ...)
    const items = container.querySelectorAll('.color-picker-item');
    expect(items.length).toBeGreaterThan(2);
    fireEvent.click(items[2]);

    expect(onColorChange).toHaveBeenCalledWith('p1', 'green');
    // Menu closes
    expect(container.querySelector('.color-picker-menu')).not.toBeInTheDocument();
  });
});
