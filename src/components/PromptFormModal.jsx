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
    isPublic: prompt.isPublic || false,
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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="panel max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2">
          {isNewPrompt ? 'New Prompt' : 'Edit Prompt'}
        </h2>

        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={handleChange('title')}
          className="field-dark"
        />

        <textarea
          required
          placeholder="Prompt text"
          value={form.content}
          onChange={handleChange('content')}
          className="field-dark h-24 resize-y"
        />

        <span className="tag-token self-end">{tokenCount} token</span>

        <input
          placeholder="Short description (optional)"
          value={form.description}
          onChange={handleChange('description')}
          className="field-dark"
        />

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

          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={handleChange('isPublic')}
            />
            Public
          </label>
        </div>

        <div className="flex gap-4 justify-end mt-4">
          <button type="button" onClick={onClose} className="btn-edit">Cancel</button>
          <button type="submit" className="btn-blue">Save</button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
