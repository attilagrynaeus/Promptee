import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { tokensOf } from '../lib/tokenCounter';

export default function PromptFormModal({ prompt, categories, onClose, onSave }) {
  const [form, setForm] = useState({
    id: prompt.id || crypto.randomUUID(),
    title: prompt.title || '',
    content: prompt.content || '',
    description: prompt.description || '',
    category_id: prompt.category_id || '',
    is_public: prompt.is_public || false,
  });

  useEffect(() => setForm(prev => ({ ...prev, ...prompt })), [prompt]);

  const tokenCount = tokensOf(form.content);

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
          {prompt.id ? 'Edit Prompt' : 'New Prompt'}
        </h2>

        <input required placeholder="Title" value={form.title} onChange={handleChange('title')} className="field-dark" />

        <textarea required placeholder="Prompt text" value={form.content} onChange={handleChange('content')} className="field-dark h-32 resize-y" />

        <span className="text-xs self-end bg-gray-700 px-3 py-1 rounded-full">{tokenCount} tokens</span>

        <input placeholder="Short description" value={form.description} onChange={handleChange('description')} className="field-dark" />

        <select required value={form.category_id} onChange={handleChange('category_id')} className="field-dark">
          <option value="">Select a Category</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_public} onChange={handleChange('is_public')} />
          Public
        </label>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-red">Cancel</button>
          <button type="submit" className="btn-green">Save</button>
        </div>
      </form>
    </div>,
    document.body
  );
}