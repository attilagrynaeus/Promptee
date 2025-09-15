import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useDialog } from 'context/DialogContext';
import { t } from 'i18n';
import { updateCategory } from 'utils/categoryService';

// Modal for editing category names. As the user edits the name, it is
// automatically saved to the database (debounced). The modal can be closed
// with Close, or with Save (which also flushes any pending update).
export default function EditCategoryModal({
  open,
  onClose,
  categories = [],
  onUpdated,
}) {
  const supabase = useSupabaseClient();
  const { showDialog } = useDialog();

  const defaultCatId = useMemo(() => categories[0]?.id ?? '', [categories]);
  const [selectedId, setSelectedId] = useState(defaultCatId);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const lastSavedNameRef = useRef('');
  const debounceRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    // Initialize selection and name when opened
    const first = categories.find(c => c.id === defaultCatId) ?? categories[0];
    const id = first?.id ?? '';
    setSelectedId(id);
    setName(first?.name ?? '');
    lastSavedNameRef.current = first?.name ?? '';
  }, [open, categories, defaultCatId]);

  useEffect(() => {
    if (!open) return;
    const cat = categories.find(c => c.id === selectedId);
    setName(cat?.name ?? '');
    lastSavedNameRef.current = cat?.name ?? '';
    clearTimeout(debounceRef.current);
  }, [selectedId]);

  const isDuplicateName = (trimmed) => {
    const existing = categories.some(
      (c) => c.id !== selectedId && (c.name ?? '').trim().toLowerCase() === trimmed.toLowerCase(),
    );
    return existing;
  };

  const flushSave = async () => {
    if (!selectedId) return;
    const trimmed = (name || '').trim();
    if (trimmed.length === 0) {
      showDialog({ title: t('Errors.Error'), message: t('EditCategory.Errors.Empty'), confirmText: t('PromptForm.OK') });
      return;
    }
    if (isDuplicateName(trimmed)) {
      showDialog({ title: t('Errors.Error'), message: t('EditCategory.Errors.Duplicate'), confirmText: t('PromptForm.OK') });
      return;
    }
    if (trimmed === lastSavedNameRef.current) return;
    try {
      setSaving(true);
      const { error } = await updateCategory(supabase, selectedId, trimmed);
      if (error) {
        const msg =
          error.code === '23505' || /unique|duplicate key/i.test(error.message || '')
            ? t('EditCategory.Errors.Duplicate')
            : t('EditCategory.Errors.DbError');
        showDialog({ title: t('Errors.Error'), message: msg, confirmText: t('PromptForm.OK') });
      } else {
        lastSavedNameRef.current = trimmed;
        // Show a lightweight confirmation; keep non-intrusive
        // TODO: If a toast system exists, prefer that over dialog
        if (onUpdated) {
          try { onUpdated(); } catch {}
        }
      }
    } catch (e) {
      showDialog({ title: t('Errors.Error'), message: String(e?.message || e), confirmText: t('PromptForm.OK') });
    } finally {
      setSaving(false);
    }
  };

  const onNameChange = (e) => {
    const newVal = e.target.value;
    setName(newVal);
    clearTimeout(debounceRef.current);
    // Debounced auto-save to avoid excessive updates
    debounceRef.current = setTimeout(() => {
      void flushSave();
    }, 450);
  };

  const handleClose = () => {
    clearTimeout(debounceRef.current);
    onClose?.();
  };

  const handleSaveAndClose = async () => {
    clearTimeout(debounceRef.current);
    await flushSave();
    onClose?.();
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.4)] text-gray-200">
        <div className="h-2 w-full bg-indigo-600" />
        <div className="p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">{t('EditCategory.Title')}</h2>

          {categories.length === 0 ? (
            <p className="text-sm text-gray-400">{t('EditCategory.NoCategories')}</p>
          ) : (
            <>
              <label className="text-sm text-gray-400">
                {t('EditCategory.SelectLabel')}
              </label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="select-dark"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {(c.name ?? '').trim() || '(unnamed category)'}
                  </option>
                ))}
              </select>

              <label className="text-sm text-gray-400">
                {t('EditCategory.NameLabel')}
              </label>
              <input
                value={name}
                onChange={onNameChange}
                className="w-full rounded-lg bg-gray-800 text-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={t('EditCategory.NamePlaceholder')}
              />

              <p className="text-xs text-gray-500">{t('EditCategory.AutoSaveHint')}</p>
            </>
          )}

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-200"
              disabled={saving}
            >
              {t('PromptForm.Close')}
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-md font-semibold shadow disabled:opacity-60"
              disabled={saving || categories.length === 0}
            >
              {t('PromptForm.Save')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
