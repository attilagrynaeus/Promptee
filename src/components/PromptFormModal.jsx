import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import useTokenCount from '../hooks/useTokenCount';

export default function PromptFormModal({ prompt, onClose, onSave }) {
  const isNewPrompt = !prompt.id;

  const [form, setForm] = useState({
    id: prompt.id || crypto.randomUUID(),
    title: prompt.title || '',
    content: prompt.content || '',
    description: prompt.description || '',
    category: prompt.category || 'Illustration',
    is_public: prompt.is_public || false,
  });

  useEffect(() => setForm(prev => ({ ...prev, ...prompt })), [prompt]);

  const tokenCount = useTokenCount(form.content);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(form);
    onClose();
  };

   return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md flex flex-col gap-4 text-gray-200">

        <h2 className="text-xl font-semibold">
          {isNewPrompt ? 'New Prompt' : 'Edit Prompt'}
        </h2>

        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={handleChange('title')}
          className="bg-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200"
        />

        <textarea
          required
          placeholder="Prompt text"
          value={form.content}
          onChange={handleChange('content')}
          className="bg-gray-700 rounded-lg px-4 py-2 h-32 resize-y text-sm text-gray-200"
        />

        <span className="bg-gray-600 text-xs self-end rounded-full px-3 py-1">
          {tokenCount} token
        </span>

        <input
          placeholder="Short description (optional)"
          value={form.description}
          onChange={handleChange('description')}
          className="bg-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200"
        />

        <div className="flex gap-2 items-center">
          <select
            value={form.category}
            onChange={handleChange('category')}
            className="bg-gray-700 rounded-lg px-3 py-2 text-sm flex-1 text-gray-200"
          >
            <option>Illustration</option>
            <option>Jokes & Humor</option>
            <option>SEO Optimization</option>
            <option>Other</option>
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={handleChange('is_public')}
              className="rounded"
            />
            Public
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="bg-gray-600 rounded-full px-4 py-2 hover:bg-gray-500">
            Cancel
          </button>
          <button type="submit" className="bg-green-600 rounded-full px-4 py-2 hover:bg-green-500">
            Save
          </button>
        </div>

      </form>
    </div>,
    document.body,
  );
}
