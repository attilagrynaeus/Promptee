// src/__tests__/PromptCard.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromptCard from '../components/PromptCard';

jest.mock('../context/DialogContext', () => ({
  useDialog: () => ({ showDialog: jest.fn() })
}));

jest.mock('../lib/tokenCounter', () => ({
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
    color: 'blue'
  };

  const handlers = {
    onCopy:      jest.fn(),
    onEdit:      jest.fn(),
    onDelete:    jest.fn(),
    onToggleFavorit: jest.fn(),
    onClone:     jest.fn(),
    onColorChange: jest.fn(),
  };

  const renderCard = () =>
    render(<PromptCard prompt={prompt} currentUserId="user-1" {...handlers} />);

  beforeEach(() => jest.clearAllMocks());

  it('renders prompt details correctly', () => {
    renderCard();
    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    expect(screen.getByText('A test description')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('calls onToggleFavorit when favorite clicked', () => {
    renderCard();
    fireEvent.click(screen.getByText('☆'));
    expect(handlers.onToggleFavorit).toHaveBeenCalledWith(prompt);
  });

  it('calls onColorChange when color circle clicked', () => {
    const { container } = renderCard();
    const firstCircle = container.querySelector('.color-circle');
    fireEvent.click(firstCircle);
    expect(handlers.onColorChange).toHaveBeenCalledWith('1', 'blue');
  });
});