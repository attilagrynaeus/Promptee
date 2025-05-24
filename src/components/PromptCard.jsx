import React from 'react';
import { tokensOf } from '../lib/tokenCounter';
import { useDialog } from '../context/DialogContext';

export default function PromptCard({
  prompt,
  currentUserId,
  onCopy,
  onEdit,
  onDelete,
  onToggleFavorit,
  onClone,
  activateChainView,
  chainViewActive
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
      onCancel: () => {},
    });
  };

  return (
    <div className="bg-gray-900 shadow-xl rounded-xl p-4 flex flex-col gap-3 text-gray-200 relative">
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
        <button
          onClick={() => isOwner && onToggleFavorit(prompt)}
          className={`mr-auto text-xl transition-colors ${!isOwner ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
        >
          {prompt.favorit && isOwner ? '⭐️' : '☆'}
        </button>

        {!isOwner && prompt.profiles?.email && (
          <span className="text-sm italic text-gray-500">
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
          onClick={() => onClone(prompt)}
          className="bg-teal-600 hover:bg-teal-500 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors"
        >
          🧬 Clone
        </button>

        <button
          onClick={() => isOwner && onEdit()}
          disabled={!isOwner}
          className={`bg-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors ${
            !isOwner ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'
          }`}
        >
          ✏️ Edit
        </button>

        {isOwner && (
          <button
            onClick={handleDelete}
            className="bg-red-900 hover:bg-red-800 opacity-75 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors"
          >
            🗑️ Delete
          </button>
        )}

        {!chainViewActive && prompt.next_prompt_id && (
          <button
            onClick={() => activateChainView(prompt)}
            className="bg-purple-700 hover:bg-purple-600 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors"
          >
            🔗 Chain
          </button>
        )}
      </div>

   {chainViewActive && prompt.next_prompt_id && (
  <div className="chain-connector absolute -bottom-16 left-1/2 transform -translate-x-1/2"></div>
   )}

    </div>
  );
}