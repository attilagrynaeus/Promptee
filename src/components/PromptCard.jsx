import React from 'react';
import { tokensOf } from '../lib/tokenCounter';

export default function PromptCard({ prompt, currentUserId, onCopy, onEdit, onDelete, onToggleFavorit }) {
  const tokenCount = tokensOf(prompt.content);
  const isOwner = prompt.user_id === currentUserId;

  return (
    <div className="bg-gray-900 shadow-xl rounded-xl p-4 flex flex-col gap-3 text-gray-200">
      <div className="flex flex-col gap-2">
        <header>
          <h3 className="text-xl font-semibold tracking-wide">{prompt.title}</h3>
          {prompt.description && (
            <p className="italic text-sm text-gray-400 line-clamp-2">
              {prompt.description}
            </p>
          )}
        </header>

        <textarea
          value={prompt.content}
          readOnly
          className="w-full bg-gray-800 rounded-md px-3 py-2 text-sm resize-y min-h-[80px] text-gray-300 outline-none"
        />

        <div className="flex flex-wrap gap-2 mt-1">
          <span className="bg-indigo-700 text-sm rounded-lg px-3 py-1">
            {prompt.category}
          </span>
          <span className={`text-sm rounded-lg px-3 py-1 ${prompt.is_public ? 'bg-green-700' : 'bg-gray-600'}`}>
            {prompt.is_public ? 'Public' : 'Private'}
          </span>
          <span className="bg-gray-700 text-sm rounded-lg px-3 py-1">
            {tokenCount} tokens
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2 items-center mt-1">
        <button onClick={() => isOwner && onToggleFavorit(prompt)} className={`mr-auto text-xl transition-colors ${!isOwner ? 'opacity-50 cursor-default' : ''}`}>
          {prompt.favorit ? '⭐️' : '☆'}
        </button>

        {!isOwner && prompt.profiles?.email && (
          <span className="text-sm italic text-gray-500"> {/* text-xs → text-sm */}
            {prompt.profiles.email.split('@')[0]}
          </span>
        )}

        <button
          onClick={onCopy}
          className="bg-indigo-700 hover:bg-indigo-600 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors"
        >
          📋 Copy
        </button>

        <button
          onClick={() => isOwner && onEdit()}
          disabled={!isOwner}
          className={`bg-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors ${!isOwner ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
        >
          ✏️ Edit
        </button>

        {isOwner && (
          <button
            onClick={() => confirm('Delete?') && onDelete(prompt.id)}
            className="bg-red-700 hover:bg-red-600 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors"
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
}