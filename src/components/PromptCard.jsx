import { tokensOf } from '../lib/tokenCounter';

export default function PromptCard({ prompt, onCopy, onEdit, onDelete }) {

  const tokenCount = tokensOf(prompt.content);

  return (
    <div className="border-2 border-slate-300 rounded-xl p-6 bg-white shadow-lg flex flex-col gap-4">
      {}
      <header>
        <h3 className="text-xl font-bold leading-tight">{prompt.title}</h3>
        {prompt.description && (
          <p className="italic text-slate-600 mt-1">{prompt.description}</p>
        )}
      </header>

      {/* ───── Tokenbadge ───── */}
      <div>
        <span
          className="
            inline-block rounded-full bg-slate-100 px-2 py-0.5
            text-xs font-medium text-slate-600
          "
        >
          {tokenCount} token
        </span>
      </div>

      {}
      <div className="flex flex-wrap gap-2">
        <span className="tag-badge bg-fuchsia-600">{prompt.category}</span>
        <span
          className={`tag-badge ${
            prompt.isPublic ? 'bg-teal-500' : 'bg-amber-400 text-black'
          }`}
        >
          {prompt.isPublic ? 'Public' : 'Private'}
        </span>
      </div>

      {}
      <div className="flex flex-wrap gap-2 justify-end">
        <button
          onClick={onCopy}
          className="btn-3d bg-fuchsia-600 hover:bg-fuchsia-700"
        >
          Copy
        </button>

        <button
          onClick={onEdit}
          className="btn-3d bg-gray-200 hover:bg-gray-300 text-gray-800"
        >
          Edit
        </button>

        <button
          onClick={onDelete}
          className="btn-3d bg-red-500 hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}