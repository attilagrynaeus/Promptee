import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, useEffect, useMemo } from 'react';
import PromptSidebar from './components/PromptSidebar';
import PromptCard from './components/PromptCard';
import PromptFormModal from './components/PromptFormModal';
import LoginForm from './components/LoginForm';
import useProfile from './hooks/useProfile';
import useIdleTimeout from './hooks/useIdleTimeout';
import { useDialog } from './context/DialogContext';

export default function PromptApp() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const profile = useProfile();
  const { showDialog } = useDialog();

  useIdleTimeout(30);

  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  useEffect(() => {
    if (session) {
      fetchCategories();
      fetchPrompts();
    }
  }, [session]);

  async function fetchCategories() {
    const { data, error } = await supabase.from('categories').select('*');
    if (!error) setCategories(data);
    else {
      showDialog({
        title: 'Error',
        message: `Failed to load categories: ${error.message}`,
        confirmText: 'OK',
        cancelText: null,
        onConfirm: () => {},
      });
    }
  }

  async function fetchPrompts() {
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        categories(name),
        favorit,
        profiles(email),
        next_prompt:next_prompt_id(title)
      `)
      .order('inserted_at', { ascending: false });

    if (error) {
      showDialog({ title: 'Error', message: `Failed: ${error.message}`, confirmText: 'OK' });
    } else setPrompts(data);
  }


  const filtered = useMemo(() => {
    if (!session || !session.user) return [];
    if (favoriteOnly) {
      return prompts.filter(p => p.favorit && p.user_id === session.user.id);
    }

    const lowerSearch = search.toLowerCase();
    return prompts.filter(p =>
      (p.title.toLowerCase().includes(lowerSearch) || p.content.toLowerCase().includes(lowerSearch)) &&
      (categoryFilter === 'All Categories' || p.categories?.name === categoryFilter)
    );
  }, [prompts, search, categoryFilter, favoriteOnly, session]);

    async function handleSave(prompt) {
      const promptToSave = {
        id: prompt.id,
        title: prompt.title,
        description: prompt.description,
        content: prompt.content,
        category_id: prompt.category_id,
        is_public: prompt.is_public,
        user_id: session.user.id,
        next_prompt_id: prompt.next_prompt_id || null, // ← fontos új sor!
      };

      const { error } = await supabase.from('prompts').upsert(promptToSave);

      if (error) {
        showDialog({
          title: 'Error',
          message: `Failed to save prompt: ${error.message}`,
          confirmText: 'OK',
        });
      } else fetchPrompts();

      setEditingPrompt(null);
    }


  async function handleToggleFavorit(prompt) {
    const { error } = await supabase
      .from('prompts')
      .update({ favorit: !prompt.favorit })
      .eq('id', prompt.id);

    if (error) {
      showDialog({
        title: 'Error',
        message: `Failed to update favorite: ${error.message}`,
        confirmText: 'OK',
        cancelText: null,
        onConfirm: () => {},
      });
    } else fetchPrompts();
  }

  async function handleDelete(id) {
    const { error } = await supabase.from('prompts').delete().eq('id', id);
    if (error) {
      showDialog({
        title: 'Error',
        message: `Failed to delete prompt: ${error.message}`,
        confirmText: 'OK',
        cancelText: null,
        onConfirm: () => {},
      });
    } else fetchPrompts();
  }

  async function handleClonePrompt(prompt) {
    const clonedPrompt = {
      title: prompt.title + ' (clone)',
      content: prompt.content,
      description: prompt.description,
      category_id: prompt.category_id,
      is_public: false,
      favorit: false,
      user_id: session.user.id,
      inserted_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('prompts').insert(clonedPrompt);

    if (error) {
      showDialog({
        title: 'Error',
        message: `Failed to clone prompt: ${error.message}`,
        confirmText: 'OK',
        cancelText: null,
        onConfirm: () => {},
      });
    } else fetchPrompts();
  }

  if (!session) return <LoginForm />;
  if (!profile) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-page-bg p-8 gap-8 items-stretch">
      <div className="flex-shrink-0 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
        <PromptSidebar
          search={search}
          setSearch={setSearch}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          onNew={() => setEditingPrompt({})}
          categories={['All Categories', ...categories.map(c => c.name)]}
          user={profile}
          favoriteOnly={favoriteOnly}
          setFavoriteOnly={setFavoriteOnly}
        />
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start content-start">
        {profile.role === 'pro' && (
          <div className="col-span-full px-4 py-2 bg-gray-900 rounded-lg shadow text-gray-200 font-medium text-center">
            🎖️ Pro Features Enabled! Welcome, {profile.email.split('@')[0]}!
          </div>
        )}

        {filtered.map(prompt => (
          <PromptCard
            key={prompt.id}
            prompt={{
              ...prompt,
              category: prompt.categories?.name || 'Uncategorized',
            }}
            currentUserId={session.user.id}
            onCopy={() => navigator.clipboard.writeText(prompt.content)}
            onEdit={() => setEditingPrompt(prompt)}
            onDelete={() => handleDelete(prompt.id)}
            onToggleFavorit={handleToggleFavorit}
            onClone={handleClonePrompt}
          />
        ))}
      </div>

      {editingPrompt && (
        <PromptFormModal
          prompt={editingPrompt}
          categories={categories}
          prompts={prompts}
          onClose={() => setEditingPrompt(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}