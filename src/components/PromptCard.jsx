import React from 'react';
import { tokensOf } from '../lib/tokenCounter';

export default function PromptCard({ prompt, onCopy, onEdit, onDelete }) {
  const tokenCount = tokensOf(prompt.content);

  return (
    <div className="bg-gray-800 shadow-lg rounded-xl p-4 flex flex-col gap-3 text-gray-200">
      
      <header>
        <h3 className="text-lg font-semibold">{prompt.title}</h3>
        {prompt.description && (
          <p className="italic text-sm text-gray-400 mt-1">{prompt.description}</p>
        )}
      </header>

      <input
        type="text"
        value={prompt.content}
        readOnly
        className="bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"
      />

      <div className="flex flex-wrap gap-2">
        <span className="bg-indigo-500 text-xs rounded-full px-3 py-1">{prompt.category}</span>
        <span className={`text-xs rounded-full px-3 py-1 ${prompt.is_public ? 'bg-green-600' : 'bg-yellow-600'}`}>
          {prompt.is_public ? 'Public' : 'Private'}
        </span>
        <span className="bg-gray-600 text-xs rounded-full px-3 py-1">{tokenCount} token</span>
      </div>

      <div className="flex gap-2 justify-end mt-auto">
        <button onClick={onCopy} className="bg-indigo-600 rounded-full px-4 py-1 text-sm hover:bg-indigo-500">
          Copy
        </button>
        <button onClick={onEdit} className="bg-teal-600 rounded-full px-4 py-1 text-sm hover:bg-teal-500">
          Edit
        </button>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this prompt?')) {
              onDelete();
            }
          }}
          className="bg-red-600 rounded-full px-4 py-1 text-sm hover:bg-red-500"
        >
          Delete 🗑️
        </button>
      </div>

    </div>
  );
}
