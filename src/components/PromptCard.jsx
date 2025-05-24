import React from 'react';
import { tokensOf } from '../lib/tokenCounter';

export default function PromptCard({ prompt, onCopy, onEdit, onDelete }) {
  const tokenCount = tokensOf(prompt.content);

  return (
    <div className="panel">
      {/* Title & description */}
      <header>
        <h3 className="text-xl font-bold">{prompt.title}</h3>
        {prompt.description && (
          <p className="italic text-gray-600 mt-1">{prompt.description}</p>
        )}
      </header>

      {/* Token badge */}
      <span className="tag-token">{tokenCount} token</span>

 <input
  type="text"
  value={prompt.content}
  readOnly
  className="field-dark"
/>

      {/* Category & visibility badges */}
      <div className="flex flex-wrap gap-2">
        <span className="tag-primary">{prompt.category}</span>
        <span className={prompt.is_Public ? 'tag-primary' : 'tag-secondary'}>
          {prompt.is_Public ? 'Public' : 'Private'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <button onClick={onCopy}   className="btn-blue">Copy</button>
        <button onClick={onEdit}   className="btn-edit">Edit</button>
        <button
          onClick={() => {
          if (confirm('Are you sure you want to delete this prompt?')) {
            onDelete();
          }
          }}
            className="btn-delete"
          >
          Delete 🗑️
      </button>
      </div>
    </div>
  );
}
