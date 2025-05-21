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
        <span className={prompt.isPublic ? 'tag-primary' : 'tag-secondary'}>
          {prompt.isPublic ? 'Public' : 'Private'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 justify-end">
        <button onClick={onCopy}   className="btn-blue">Copy</button>
        <button onClick={onEdit}   className="btn-edit">Edit</button>
        <button onClick={onDelete} className="btn-delete">Delete</button>
      </div>
    </div>
  );
}
