import React, { useState, useEffect } from 'react';
import { tokensOf } from '../lib/tokenCounter';
import { useDialog } from '../context/DialogContext';
import './PromptCard.css';

const bgMap = {
  default: 'rgba(255,255,255,0.15)',
  blue:    'rgba( 30,144,255,0.40)',
  green:   'rgba( 50,205, 50,0.40)',
  violet:  'rgba(186, 85,211,0.40)',
};

export default function PromptCard({
  prompt, currentUserId,
  onCopy, onEdit, onDelete,
  onToggleFavorit, onClone,
  onColorChange, onView
}) {
  const tokenCount = tokensOf(prompt.content);
  const isOwner    = prompt.user_id === currentUserId;
  const { showDialog } = useDialog();

  const [color, setColor] = useState(prompt.color || 'default');
  useEffect(() => { setColor(prompt.color || 'default'); }, [prompt.color]);

  const handleColorSelect = async (e, clr) => {
    e.stopPropagation();
    setColor(clr);      
    await onColorChange?.(prompt.id, clr);
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
        {prompt.description && <p className="prompt-description">{prompt.description}</p>}
      </header>

      <div className="prompt-tags mt-auto">
        <span className="tag category-tag">{prompt.category}</span>
        <span className={`tag visibility-tag ${prompt.is_public ? 'public':'private'}`}>
          {prompt.is_public ? 'Public' : 'Private'}
        </span>
        <span className="tag token-tag">{tokenCount} tokens</span>
      </div>

      <div className="prompt-actions">
        <button
          onClick={(e)=>{e.stopPropagation(); onToggleFavorit(prompt);}}
          className="favorite-button"
        >
          {prompt.favorit ? '⭐️' : '☆'}
        </button>

        <div className="color-selector ml-2">
          {['blue','green','violet'].map(clr=>(
            <button
              key={clr}
              type="button"
              className={`color-circle ${clr}`}
              onClick={(e)=>handleColorSelect(e, clr)}
              aria-label={`Set ${clr} background`}
            />
          ))}
        </div>

        <button onClick={(e)=>{e.stopPropagation(); onCopy();}}  className="action-button copy">📋 Copy</button>
        <button onClick={(e)=>{e.stopPropagation(); onClone(prompt);}} className="action-button clone">🧬 Clone</button>
        <button
          onClick={(e)=>{e.stopPropagation(); isOwner ? onEdit() : onView(prompt);}}
          className="action-button edit"
        >
          {isOwner ? '✏️ Edit' : '👁️ View'}
        </button>
        {isOwner && (
          <button onClick={(e)=>{e.stopPropagation(); onDelete(prompt.id);}} className="action-button delete">🗑️ Delete</button>
        )}
      </div>
    </div>
  );
}
