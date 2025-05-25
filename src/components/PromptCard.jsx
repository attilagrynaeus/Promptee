import React from 'react';
import { tokensOf } from '../lib/tokenCounter';
import { useDialog } from '../context/DialogContext';
import './PromptCard.css';

const cardColors = {
  default: 'card-default',
  blue: 'card-blue',
  green: 'card-green',
  violet: 'card-violet'
};

export default function PromptCard({
  prompt,
  currentUserId,
  onCopy,
  onEdit,
  onDelete,
  onToggleFavorit,
  onClone,
  activateChainView,
  chainViewActive,
  onColorChange
}) {
  const tokenCount = tokensOf(prompt.content);
  const isOwner = prompt.user_id === currentUserId;
  const { showDialog } = useDialog();

  const handleDelete = () => {
    showDialog({
      title: 'Delete Prompt',
      message: 'Are you sure you want to delete this prompt?',
      confirmText: 'Yes, Delete',
      cancelText: 'No, Cancel',
      onConfirm: () => onDelete(prompt.id),
    });
  };

  const handleColorSelect = async (color) => {
    if (onColorChange) { // itt nincs többé isOwner feltétel!
      await onColorChange(prompt.id, color);
    }
  };

  return (
    <div className={`prompt-card ${cardColors[prompt.color] || cardColors.default}`}>
      <div className="prompt-card-content flex-grow">
        <header>
          <h3 className="prompt-title">{prompt.title}</h3>
          {prompt.description && (
            <p className="prompt-description">{prompt.description}</p>
          )}
        </header>

        <div style={{ marginTop: 'auto' }}></div>

        <div className="prompt-tags">
          <span className="tag category-tag">{prompt.category}</span>
          <span className={`tag visibility-tag ${prompt.is_public ? 'public' : 'private'}`}>
            {prompt.is_public ? 'Public' : 'Private'}
          </span>
          <span className="tag token-tag">{tokenCount} tokens</span>
        </div>
      </div>

      <div className="prompt-actions">
        <button
          onClick={() => isOwner && onToggleFavorit(prompt)}
          className={`favorite-button ${!isOwner ? 'disabled' : ''}`}
        >
          {prompt.favorit ? '⭐️' : '☆'}
        </button>

        {!isOwner && prompt.profiles?.email && (
          <span className="prompt-owner">
            {prompt.profiles.email.split('@')[0]}
          </span>
        )}

        <button onClick={onCopy} className="action-button copy">📋 Copy</button>
        <button onClick={() => onClone(prompt)} className="action-button clone">🧬 Clone</button>
        <button
          onClick={() => isOwner && onEdit()}
          disabled={!isOwner}
          className={`action-button edit ${!isOwner ? 'disabled' : ''}`}
        >
          ✏️ Edit
        </button>
        {isOwner && (
          <button onClick={handleDelete} className="action-button delete">🗑️ Delete</button>
        )}
      </div>

      {/* Itt vettük ki az isOwner feltételt */}
      <div className="color-selector">
        <span className="color-circle blue" onClick={() => handleColorSelect('blue')}></span>
        <span className="color-circle green" onClick={() => handleColorSelect('green')}></span>
        <span className="color-circle violet" onClick={() => handleColorSelect('violet')}></span>
      </div>
    </div>
  );
}