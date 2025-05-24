import { useState, useEffect } from 'react';
import { fetchCategories, fetchPrompts, savePrompt, deletePrompt, clonePrompt, toggleFavorit } from '../utils/promptService';

export default function usePromptData(supabase, session, showDialog) {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    const { data, error } = await fetchCategories(supabase);
    if (error) {
      showDialog({ title: 'Error', message: error.message, confirmText: 'OK' });
    } else setCategories(data);
  };

  const loadPrompts = async () => {
    const { data, error } = await fetchPrompts(supabase);
    if (error) {
      showDialog({ title: 'Error', message: error.message, confirmText: 'OK' });
    } else setPrompts(data);
  };

  useEffect(() => {
    if (session) {
      loadCategories();
      loadPrompts();
    }
  }, [session]);

  return {
    prompts,
    categories,
    loadPrompts,
    handleSave: async (prompt) => {
      const error = await savePrompt(supabase, prompt, session.user.id);
      if (error) showDialog({ title: 'Error', message: error.message, confirmText: 'OK' });
      else loadPrompts();
    },
    handleDelete: async (id) => {
      const error = await deletePrompt(supabase, id);
      if (error) showDialog({ title: 'Error', message: error.message, confirmText: 'OK' });
      else loadPrompts();
    },
    handleClone: async (prompt) => {
      const error = await clonePrompt(supabase, prompt, session.user.id);
      if (error) showDialog({ title: 'Error', message: error.message, confirmText: 'OK' });
      else loadPrompts();
    },
    handleToggleFavorit: async (prompt) => {
      const error = await toggleFavorit(supabase, prompt);
      if (error) showDialog({ title: 'Error', message: error.message, confirmText: 'OK' });
      else loadPrompts();
    },
  };
}