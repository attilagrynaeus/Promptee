import React, { useState, useEffect } from 'react';
import { tokensOf } from '../lib/tokenCounter';
import { useDialog } from '../context/DialogContext';
import './PromptCard.css';

const bgMap = {
  default: '#313338',
  blue:    'rgba(30,144,255,0.40)',
  green:   'rgba(50,205,50,0.40)',
  violet:  'rgba(186,85,211,0.40)',
};

export default function PromptCard({
  prompt, currentUserId,
  onCopy, onEdit, onDelete,
  onToggleFavorit, onClone,
  onColorChange, onView
}) {
  const tokenCount = tokensOf(prompt.content);
  const isOwner = prompt.user_id === currentUserId;
  const { showDialog } = useDialog();

  const [color, setColor] = useState(prompt.color || 'default');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setColor(prompt.color || 'default');
  }, [prompt.color]);

  const handleColorSelect = async (e, clr) => {
    e.stopPropagation();
    setColor(clr);
    await onColorChange?.(prompt.id, clr);
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    showDialog({
      title: 'Delete Prompt',
      message: 'Are you sure you want to delete this prompt?',
      confirmText: 'Yes, Delete',
      cancelText: 'No, Cancel',
      onConfirm: () => onDelete(prompt.id),
    });
  };

  const handleToggleFavorit = (e) => {
    e.stopPropagation();
    if (!prompt.id) {
      showDialog({
        title: 'Cannot set favorite',
        message: 'Prompt ID is missing.',
        confirmText: 'OK'
      });
      return;
    }
    onToggleFavorit(prompt);
  };

  return (
    <div
      className="prompt-card"
      style={{ background: bgMap[color] }}
      tabIndex={-1}
      onFocus={(e) => e.currentTarget.blur()}
    >
      <header>
        <h3 className="prompt-title">{prompt.title}</h3>
        {prompt.description && (
          <p className="prompt-description">{prompt.description}</p>
        )}
      </header>

      <div className="prompt-tags mt-auto">
        <span className="tag category-tag">{prompt.category}</span>
        <span className={`tag visibility-tag ${prompt.is_public ? 'public' : 'private'}`}>
          {prompt.is_public ? 'Public' : 'Private'}
        </span>
        <span className="tag token-tag">{tokenCount} tokens</span>
      </div>

      <div className="prompt-actions">
        <button
          onClick={handleToggleFavorit}
          className="favorite-button"
        >
          {prompt.favorit ? '⭐️' : '☆'}
        </button>

        <div className="color-selector ml-2">
          {['blue', 'green', 'violet'].map(clr => (
            <button
              key={clr}
              type="button"
              className={`color-circle ${clr}`}
              onClick={(e) => handleColorSelect(e, clr)}
              aria-label={`Set ${clr} background`}
            />
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="action-button copy relative"
        >
          📋 Copy
          {copied && (
            <span className="copied-tooltip">✅ Copied!</span>
          )}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onClone(prompt); }}
          className="action-button clone"
        >
          🧬 Clone
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); isOwner ? onEdit() : onView(prompt); }}
          className="action-button edit"
        >
          {isOwner ? '✏️ Edit' : '👁️ View'}
        </button>

        {isOwner && (
          <button
            onClick={handleDelete}
            className="action-button delete"
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
}