import React from 'react';
import { tokensOf } from '../lib/tokenCounter';

export default function PromptCard({ prompt, onCopy, onEdit, onDelete }) {
  const tokenCount = tokensOf(prompt.content);

  return (
    <div className="bg-gray-900 shadow-xl rounded-xl p-4 flex flex-col gap-3 text-gray-200">

      <div className="flex flex-col gap-2">
        {/* Title and description */}
        <header>
          <h3 className="text-xl font-semibold tracking-wide">{prompt.title}</h3>
          {prompt.description && (
            <p className="italic text-sm text-gray-400 line-clamp-2">
              {prompt.description}
            </p>
          )}
        </header>

        {/* Content textarea */}
        <textarea
          value={prompt.content}
          readOnly
          className="w-full bg-gray-800 rounded-md px-3 py-2 text-sm resize-y min-h-[80px] text-gray-300 outline-none"
        />

        {/* Badges (kategória, public/private, tokenek) */}
        <div className="flex flex-wrap gap-2 mt-1">
          <span className="bg-indigo-700 text-sm rounded-lg px-3 py-1">
            {prompt.category}
          </span>
          <span className={`text-sm rounded-lg px-3 py-1 ${prompt.is_public ? 'bg-green-700' : 'bg-gray-600'}`}>
            {prompt.is_public ? 'Public' : 'Private'}
          </span>
          <span className="bg-gray-700 text-sm rounded-lg px-3 py-1">
            {tokenCount} {tokenCount > 1 ? 'tokens' : 'token'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-1">
        <button
          onClick={onCopy}
          className="bg-indigo-700 hover:bg-indigo-600 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors"
        >
          📋 Copy
        </button>

        <button
          onClick={onEdit}
          className="bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors"
        >
          ✏️ Edit
        </button>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this prompt?')) {
              onDelete();
            }
          }}
          className="bg-red-700 hover:bg-red-600 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors"
        >
          🗑️ Delete
        </button>
      </div>

    </div>
  );
}