import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { tokensOf } from '../lib/tokenCounter';
import { supabase } from '../supabaseClient';        

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
  const defCat =
    categories.find((c) => c.name === 'Others')?.id || '';

  const [chains, setChains] = useState([]);
  useEffect(() => {
    supabase
      .from('chains')
      .select('*')
      .then(({ data }) => setChains(data || []));
  }, []);

  const [form, setForm] = useState({
    id: prompt.id || crypto.randomUUID(),
    title: prompt.title || '',
    content: prompt.content || '',
    description: prompt.description || '',
    category_id: prompt.category_id || defCat,
    is_public: prompt.is_public || false,
    next_prompt_id: prompt.next_prompt_id || '',
    chain_id: prompt.chain_id || null,      
    chain_order: prompt.chain_order || '',  
  });

  useEffect(() => {
    setForm((p) => ({
      ...p,
      ...prompt,
      category_id: prompt.category_id || defCat,
      next_prompt_id: prompt.next_prompt_id || '',
      chain_id: prompt.chain_id || null,       
      chain_order: prompt.chain_order || '',   
    }));
  }, [prompt]);

  const tokenCount = tokensOf(form.content);
  const catName =
    categories.find((c) => c.id === form.category_id)?.name ??
    'Others';
  const headColor = hashColor(catName);

  const numbers = Array.from(
    { length: form.content.split('\n').length },
    (_, i) => i + 1,
  ).join('\n');

  const chg = (f) => (e) =>
    setForm({
      ...form,
      [f]:
        e.target.type === 'checkbox'
          ? e.target.checked
          : e.target.type === 'number'
          ? +e.target.value
          : e.target.value,
    });


  const submit = async (e) => {
    e.preventDefault();

    let { chain_id, chain_order } = form;

    if (chain_id) {

      const { count } = await supabase
        .from('prompts')
        .select('id', { head: true, count: 'exact' })
        .eq('chain_id', chain_id);


      if (!chain_order) {
        if (count >= 10) {
          alert('There can be 10 prompts in this chain.');
          return;
        }
        chain_order = count + 1;
      } else {

        if (chain_order < 1 || chain_order > 10) {
          alert('The number can range from 1 to 10.');
          return;
        }
        const { data: dup } = await supabase
          .from('prompts')
          .select('id')
          .eq('chain_id', chain_id)
          .eq('chain_order', chain_order)
          .neq('id', form.id);
        if (dup.length > 0) {
          alert(
            'This number is already taken in this chain!'
          );
          return;
        }
      }
    } else {
      chain_order = null;
    }

    await onSave({
      ...form,
      chain_id: chain_id || null,
      chain_order,
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
                   flex flex-col overflow-y-auto
                   bg-white/5 backdrop-blur-md border border-white/10
                   rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.4)]
                   text-gray-200"
      >
        {/* színes fejléc-csík */}
        <div
          style={{ backgroundColor: headColor }}
          className="h-2 w-full"
        />

        <div className="p-6 flex flex-col flex-1">

          <h2 className="text-2xl font-semibold mb-4">
            {readOnly
              ? 'View Prompt'
              : prompt.id
              ? 'Edit Prompt'
              : 'New Prompt'}
          </h2>

          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={chg('title')}
            disabled={readOnly}
            className="field-dark rounded-none mb-3"
          />

          {/* -----------  Content blokk ------------- */}
          <div
            className="flex flex-1 mb-4 bg-gray-900 rounded
                       max-h-[50vh] overflow-hidden"
          >
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
              onChange={chg('content')}
              className="flex-1 field-dark rounded-none resize-none
                         py-2 pl-0 text-base font-mono leading-7
                         min-h-[18rem]
                         overflow-y-auto
                         scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
            />
          </div>

          {/* token badge */}
          <span
            className="self-end -mt-2 mb-4 bg-indigo-600/90
                       px-3 py-1 rounded-full text-xs font-semibold"
          >
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

          {/* -----------  Chain selector blokk ------------- */}
          {!readOnly && (
            <>
              <label className="flex flex-col gap-1 text-sm mb-4">
                <span className="text-gray-400">🔗 Chain Type  (optional) </span>
                <select
                  value={form.chain_id || ''}
                  onChange={chg('chain_id')}
                  className="field-dark rounded-none"
                >
                  <option value="">— none —</option>
                  {chains.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              {form.chain_id && (
                <label className="flex flex-col gap-1 text-sm mb-4">
                  <span className="text-gray-400">
                    📑 Chain order (1–10)
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.chain_order || ''}
                    onChange={chg('chain_order')}
                    className="field-dark rounded-none"
                  />
                </label>
              )}
            </>
          )}
          {/* ---------------------------------------------------- */}

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