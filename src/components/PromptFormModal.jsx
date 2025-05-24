import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { tokensOf } from '../lib/tokenCounter';

export default function PromptFormModal({ prompt, categories, prompts, onClose, onSave }) {
  const defaultCategory = categories.find(c => c.name === 'Others')?.id || '';

  const [form, setForm] = useState({
    id: prompt.id || crypto.randomUUID(),
    title: prompt.title || '',
    content: prompt.content || '',
    description: prompt.description || '',
    category_id: prompt.category_id || defaultCategory,
    is_public: prompt.is_public || false,
    next_prompt_id: prompt.next_prompt_id || '',
  });

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      ...prompt,
      category_id: prompt.category_id || defaultCategory,
      next_prompt_id: prompt.next_prompt_id || '',
    }));
  }, [prompt, defaultCategory]);

  const tokenCount = tokensOf(form.content);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [field]: value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  const promptToSave = {
    id: form.id,
    title: form.title,
    content: form.content,
    description: form.description,
    category_id: form.category_id || null,
    is_public: form.is_public,
    next_prompt_id: form.next_prompt_id || null,
  };

  await onSave(promptToSave);
  onClose();
};


  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md flex flex-col gap-4 text-gray-200">
        <h2 className="text-xl font-semibold">
          {prompt.id ? 'Edit Prompt' : 'New Prompt'}
        </h2>

        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={handleChange('title')}
          className="field-dark rounded-none"
        />

        <textarea
          required
          placeholder="Prompt text"
          value={form.content}
          onChange={handleChange('content')}
          className="field-dark h-32 resize-y rounded-none"
        />

        <span className="text-xs self-end bg-gray-700 px-3 py-1 rounded-full">
          {tokenCount} tokens
        </span>

        <input
          placeholder="Short description"
          value={form.description}
          onChange={handleChange('description')}
          className="field-dark rounded-none"
        />

        <select
          required
          value={form.category_id}
          onChange={handleChange('category_id')}
          className="field-dark rounded-none"
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_public}
            onChange={handleChange('is_public')}
          />
          Public
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-400">🔗 Next Prompt (optional)</span>
          <select
            value={form.next_prompt_id}
            onChange={handleChange('next_prompt_id')}
            className="field-dark rounded-none"
          >
            <option value="">🔹 No next prompt</option>
            {prompts
              .filter(p => p.id !== form.id)
              .map(p => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
          </select>
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md shadow-md transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}