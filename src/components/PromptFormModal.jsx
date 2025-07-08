import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { tokensOf } from 'utils/tokenCounter';
import { supabase } from 'supabaseClient';
import { useDialog } from 'context/DialogContext';
import { t } from 'i18n';

/* util for colored header */
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
  /* default category */
  const defCat =
    categories.find((c) => c.name === 'Others')?.id || '';

  const { showDialog } = useDialog();

  /* chains list */
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
  }, [prompt, defCat]);

  /* 
     AUTOSAVE 
  */

  /* stable storage key based on current form id */
  const draftKey = useMemo(() => `draft-${form.id}`, [form.id]);

  /* Re-hydrate form from storage on mount */
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(draftKey);
      if (saved) {
        setForm(JSON.parse(saved));
      }
    } catch {
      /* ignore corrupt JSON */
    }
  }, []);

  /*  Autosave on every state change (debounced) */
  useEffect(() => {
    const h = setTimeout(() => {
      try {
        sessionStorage.setItem(draftKey, JSON.stringify(form));
      } catch {
        /* quota or other errors – ignore */
      }
    }, 400); // debounce 0.4 s
    return () => clearTimeout(h);
  }, [form, draftKey]);

  /* Save immediately when tab loses visibility */
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') {
        try {
          sessionStorage.setItem(draftKey, JSON.stringify(form));
        } catch {}
      }
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [form, draftKey]);

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
          showDialog({
            title: t('PromptForm.Warning'),
            message: t('PromptForm.ChainLimit'),
            confirmText: t('PromptForm.OK'),
          });
          return;
        }
        chain_order = count + 1;
      } else {
        if (chain_order < 1 || chain_order > 10) {
          showDialog({
            title: t('PromptForm.Warning'),
            message: t('PromptForm.ChainRange'),
            confirmText: t('PromptForm.OK'),
          });
          return;
        }
        const { data: dup } = await supabase
          .from('prompts')
          .select('id')
          .eq('chain_id', chain_id)
          .eq('chain_order', chain_order)
          .neq('id', form.id);
        if (dup.length > 0) {
          showDialog({
            title: t('PromptForm.Warning'),
            message: t('PromptForm.ChainDup'),
            confirmText: t('PromptForm.OK'),
          });
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

    /* clear draft after successful save */
    sessionStorage.removeItem(draftKey);
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
        {/* colored header stripe */}
        <div
          style={{ backgroundColor: headColor }}
          className="h-2 w-full"
        />

        <div className="p-6 flex flex-col flex-1">
          <h2 className="text-2xl font-semibold mb-4">
            {readOnly
              ? t('PromptForm.View')
              : prompt.id
              ? t('PromptForm.Edit')
              : t('PromptForm.New')}
          </h2>

          <input
            required
            placeholder={t('PromptForm.TitlePlaceholder')}
            value={form.title}
            onChange={chg('title')}
            disabled={readOnly}
            className="field-dark rounded-none mb-3"
          />

          {/* -----------  Content block ------------- */}
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
              placeholder={t('PromptForm.ContentPlaceholder')}
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
            {tokenCount} {t('PromptForm.TokensSuffix')}
          </span>

          {/* description + category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              placeholder={t('PromptForm.DescriptionPlaceholder')}
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

          {/* -----------  Chain selector block ------------- */}
          {!readOnly && (
            <>
              <label className="flex flex-col gap-1 text-sm mb-4">
                <span className="text-gray-400">{t('PromptForm.ChainType')}</span>
                <select
                  value={form.chain_id || ''}
                  onChange={chg('chain_id')}
                  className="field-dark rounded-none"
                >
                  <option value="">{t('PromptForm.ChainNone')}</option>
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
                    {t('PromptForm.ChainOrderLabel')}
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

          {/* public toggle */}
          <label className="flex items-center gap-2 text-sm mb-4">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={chg('is_public')}
              disabled={readOnly}
            />
            {t('PromptForm.Public')}
          </label>

          <div className="mt-auto flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200"
            >
              {readOnly ? t('PromptForm.Close') : t('PromptForm.Cancel')}
            </button>
            {!readOnly && (
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-500 px-6 py-2
                           rounded-md font-semibold shadow"
              >
                {t('PromptForm.Save')}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>,
    document.body,
  );
}
