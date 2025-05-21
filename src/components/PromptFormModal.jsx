import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import useTokenCount from '../hooks/useTokenCount';

export default function PromptFormModal({ prompt, onClose, onSave }) {
  const [form, setForm] = useState({
    id: prompt.id || crypto.randomUUID(),
    title: '',
    content: '',
    description: '',
    category: 'Illustration',
    isPublic: false,
  });

  useEffect(() => setForm((p) => ({ ...p, ...prompt })), [prompt]);
  const tokenCount = useTokenCount(form.content);

  const handleChange = (field) => (e) =>
    setForm({
      ...form,
      [field]: e.target.type === 'checkbox'
        ? e.target.checked
        : e.target.value,
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="panel max-w-md w-full"
      >
        {/* Modal header */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {prompt.id ? 'Edit prompt' : 'New prompt'}
        </h2>

        {/* Title */}
        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={handleChange('title')}
          className="field-dark"
        />

        {/* Prompt text */}
        <textarea
          required
          placeholder="Prompt text"
          value={form.content}
          onChange={handleChange('content')}
          className="field-dark h-24 resize-y"
        />

        {/* Token count */}
        <span className="tag-token self-end">{tokenCount} token</span>

        {/* Description */}
        <input
          placeholder="Short description (optional)"
          value={form.description}
          onChange={handleChange('description')}
          className="field-dark"
        />

        {/* Category + public */}
        <div className="flex gap-2">
          <select
            value={form.category}
            onChange={handleChange('category')}
            className="field-dark flex-1"
          >
            <option>Illustration</option>
            <option>Jokes & Humor</option>
            <option>SEO Optimization</option>
            <option>Other</option>
          </select>

          <label className="flex items-center gap-1 text-gray-800">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={handleChange('isPublic')}
              className="mr-1"
            />
            Public
          </label>
        </div>

        {/* Footer buttons */}
        <div className="flex gap-4 justify-end mt-4">
          <button type="button" onClick={onClose} className="btn-edit">
            Cancel
          </button>
          <button type="submit" className="btn-blue">
            Save
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
