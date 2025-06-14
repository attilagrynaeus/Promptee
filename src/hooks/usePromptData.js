// hooks/usePromptData.js
import { useState, useEffect, useCallback } from 'react';
import { fetchCategories, fetchPrompts, savePrompt, deletePrompt, clonePrompt, toggleFavorit, updatePrompt, archivePrompt } from '../utils/promptService';
import { t } from '../i18n';

export default function usePromptData(supabase, session, showDialog, archiveMode) {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    const { data, error } = await fetchCategories(supabase);
    if (error) showDialog({ title: t('Errors.Error'), message: error.message, confirmText: t('PromptCard.OK') });
    else setCategories(data);
  };

  const loadPrompts = useCallback(async () => {
    const { data, error } = await fetchPrompts(supabase, archiveMode);
    if (error) showDialog({ title: t('Errors.Error'), message: error.message, confirmText: t('PromptCard.OK') });
    else setPrompts(data);
  }, [supabase, showDialog, archiveMode]);

  useEffect(() => {
    if (session) {
      loadCategories();
      loadPrompts();
    }
  }, [session, loadPrompts]);

  return {
    prompts,
    categories,
    fetchPrompts: loadPrompts,

    handleSave: async (prompt) => {
      const isNewPrompt = !prompt.id;
      const promptToSave = {
        ...prompt,
        favorit: isNewPrompt ? false : prompt.favorit,
        user_id: session.user.id,
      };

      const error = await savePrompt(supabase, promptToSave, session.user.id);
      if (error) {
        showDialog({ title: t('Errors.Error'), message: error.message, confirmText: t('PromptCard.OK') });
      } else {
        loadPrompts();
      }
    },

    handleDelete: async (id) => {
      const error = await deletePrompt(supabase, id);
      if (error) showDialog({ title: t('Errors.Error'), message: error.message, confirmText: t('PromptCard.OK') });
      else loadPrompts();
    },

    handleClone: async (prompt) => {
      const error = await clonePrompt(supabase, prompt, session.user.id);
      if (error) showDialog({ title: t('Errors.Error'), message: error.message, confirmText: t('PromptCard.OK') });
      else loadPrompts();
    },

    handleArchive: async (prompt) => {
      const archiving = !prompt.archived_at;
      const error = archiving
        ? await archivePrompt(supabase, prompt)
        : await updatePrompt(supabase, { id: prompt.id, archived_at: null });

      if (error) {
        showDialog({ title: t('Errors.Error'), message: error.message, confirmText: t('PromptCard.OK') });
      } else {
        loadPrompts();
      }
    },

    handleToggleFavorit: async (prompt) => {
      const error = await toggleFavorit(supabase, prompt, session.user.id);
      if (error) showDialog({ title: t('Errors.Error'), message: error.message, confirmText: t('PromptCard.OK') });
      else loadPrompts();
    },
  };
}