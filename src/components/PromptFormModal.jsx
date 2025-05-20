/**
 * PromptFormModal.jsx
 */
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import useTokenCount from '../hooks/useTokenCount'; // ⬅️ saját hook

export default function PromptFormModal({ prompt, onClose, onSave }) {
  /* ──  form-state ────────────────────────────────────────────────────── */
  const [form, setForm] = useState({
    id: prompt.id || crypto.randomUUID(),
    title: '',
    content: '',
    description: '',
    category: 'Illustration',
    isPublic: false,
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, ...prompt }));
  }, [prompt]);

  const tokenCount = useTokenCount(form.content); // debounce + idle-callback

  const handleChange =
    (field) =>
    (e) =>
      setForm({
        ...form,
        [field]:
          e.target.type === 'checkbox' ? e.target.checked : e.target.value,
      });

  /* ── 4. save ───────────────────────── */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  /* ── 5. render ────────────────── */
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold mb-2">
          {prompt.id ? 'Edit prompt' : 'New prompt'}
        </h2>

        {/* ─────── Title ─────── */}
        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={handleChange('title')}
          className="bg-gray-100 rounded-lg p-2"
        />

        {/* ─────── Prompt ─────── */}
        <textarea
          required
          placeholder="Prompt text"
          value={form.content}
          onChange={handleChange('content')}
          className="bg-gray-100 rounded-lg p-2 h-24 resize-y"
        />

        <span className="text-sm text-slate-500">Token count:</span>
        <input
          readOnly
          tabIndex={-1}
          value={`${tokenCount} token`}
          className="
            w-40 self-end
            bg-gray-200 text-right text-sm px-2 py-1
            rounded border border-gray-300
            select-none cursor-default
          "
        />

        {}
        <input
          placeholder="Short description (optional)"
          value={form.description}
          onChange={handleChange('description')}
          className="bg-gray-100 rounded-lg p-2"
        />

        {}
        <div className="flex gap-2">
          <select
            value={form.category}
            onChange={handleChange('category')}
            className="bg-gray-100 rounded-lg p-2 flex-1"
          >
            <option>Illustration</option>
            <option>Jokes & Humor</option>
            <option>SEO Optimization</option>
            <option>Other</option>
          </select>

          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={handleChange('isPublic')}
            />
            Public
          </label>
        </div>

        {}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 rounded-lg py-1 px-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg py-1 px-4"
          >
            Save
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}