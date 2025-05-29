
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { tokensOf } from '../lib/tokenCounter';

function hashColor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }
  return `hsl(${h % 360}, 70%, 50%)`;       
}

export default function PromptFormModal({
  prompt,
  categories,
  prompts,
  onClose,
  onSave,
  readOnly = false,
}) {

  const defCat = categories.find((c) => c.name === 'Others')?.id || '';

  const [form, setForm] = useState({
    id: prompt.id || crypto.randomUUID(),
    title: prompt.title || '',
    content: prompt.content || '',
    description: prompt.description || '',
    category_id: prompt.category_id || defCat,
    is_public: prompt.is_public || false,
    next_prompt_id: prompt.next_prompt_id || '',
  });

  useEffect(() => {
    setForm((p) => ({
      ...p,
      ...prompt,
      category_id: prompt.category_id || defCat,
      next_prompt_id: prompt.next_prompt_id || '',
    }));
    // eslint-disable-next-line
  }, [prompt]);


  const tokenCount = tokensOf(form.content);
  const catName =
    categories.find((c) => c.id === form.category_id)?.name ?? 'Others';
  const headColor = hashColor(catName);

  const numbers = Array.from(
    { length: form.content.split('\n').length },
    (_, i) => i + 1,
  ).join('\n');

  const chg = (f) => (e) =>
    setForm({
      ...form,
      [f]:
        e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });

  const submit = async (e) => {
    e.preventDefault();
    await onSave({
      ...form,
      next_prompt_id: form.next_prompt_id || null,
      favorit: prompt.favorit ?? false,
    });
    onClose();
  };

return ReactDOM.createPortal(
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <form
      onSubmit={submit}
      className="w-full max-w-3xl min-h-[70vh] max-h-[90vh]
                 flex flex-col overflow-y-auto          /* modal scroll */
                 bg-white/5 backdrop-blur-md border border-white/10
                 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.4)]
                 text-gray-200"
    >
      {/* színes fejléc-csík */}
      <div style={{ backgroundColor: headColor }} className="h-2 w-full" />

      <div className="p-6 flex flex-col flex-1">
        {/* fejléc cím */}
        <h2 className="text-2xl font-semibold mb-4">
          {readOnly
            ? "View Prompt"
            : prompt.id
            ? "Edit Prompt"
            : "New Prompt"}
        </h2>

        {/* Title mező */}
        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={chg("title")}
          disabled={readOnly}
          className="field-dark rounded-none mb-3"
        />

        {/* -----------  Content blokk ------------- */}
        <div
          className="flex flex-1 mb-4 bg-gray-900 rounded
                     max-h-[50vh] overflow-hidden"
        >
          {/* sorszámok */}
          <pre
            className="w-16 pr-4 py-2 text-right select-none
                       text-gray-500 text-xs leading-7 overflow-hidden"
          >
            {numbers}
          </pre>

          {/* textarea */}
          <textarea
            required
            wrap="soft"
            disabled={readOnly}
            value={form.content}
            onChange={chg("content")}
            className="flex-1 field-dark rounded-none resize-none
                       py-2 pl-0 text-base font-mono leading-7
                       min-h-[18rem]     /* legalább ~10-14 sor látszik */
                       overflow-y-auto   /* saját scroll */
                       scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
          />
        </div>

          {/* token badge */}
          <span className="self-end -mt-2 mb-4 bg-indigo-600/90
                           px-3 py-1 rounded-full text-xs font-semibold">
            {tokenCount} tokens
          </span>

          {/* description + category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              placeholder="Short description"
              value={form.description}
              onChange={chg('description')}
              disabled={readOnly}
              className="field-dark rounded-none"
            />

            <select
              required
              value={form.category_id}
              onChange={chg('category_id')}
              disabled={readOnly}
              className="field-dark rounded-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* public toggle */}
          <label className="flex items-center gap-2 text-sm mb-4">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={chg('is_public')}
              disabled={readOnly}
            />
            Public
          </label>

          {/* next-prompt selector */}
          {!readOnly && (
            <label className="flex flex-col gap-1 text-sm mb-6">
              <span className="text-gray-400">
                🔗 Next Prompt (optional)
              </span>
              <select
                value={form.next_prompt_id}
                onChange={chg('next_prompt_id')}
                className="field-dark rounded-none"
              >
                <option value="">🔹 No next prompt</option>
                {prompts
                  .filter((p) => p.id !== form.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
              </select>
            </label>
          )}

          <div className="mt-auto flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200"
            >
              {readOnly ? 'Close' : 'Cancel'}
            </button>
            {!readOnly && (
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-500 px-6 py-2
                           rounded-md font-semibold shadow"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </form>
    </div>,
    document.body,
  );
}