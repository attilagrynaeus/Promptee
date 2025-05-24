import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, useEffect, useMemo } from 'react';
import PromptSidebar from './components/PromptSidebar';
import PromptCard from './components/PromptCard';
import PromptFormModal from './components/PromptFormModal';
import LoginForm from './components/LoginForm';
import useProfile from './hooks/useProfile';
import useIdleTimeout from './hooks/useIdleTimeout';

export default function PromptApp() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const profile = useProfile();

  useIdleTimeout(30); // Session timeout: 30 perc

  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [editingPrompt, setEditingPrompt] = useState(null);

  useEffect(() => {
    if (session) {
      fetchCategories();
      fetchPrompts();
    }
  }, [session]);

  async function fetchCategories() {
    const { data, error } = await supabase.from('categories').select('*');
    if (!error) setCategories(data);
    else alert(`Failed to load categories: ${error.message}`);
  }

  async function fetchPrompts() {
    const { data, error } = await supabase
      .from('prompts')
      .select('*, categories(name)')
      .order('inserted_at', { ascending: false });

    if (error) alert(`Failed to load prompts: ${error.message}`);
    else setPrompts(data);
  }

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return prompts.filter(p =>
      (p.title.toLowerCase().includes(lowerSearch) || p.content.toLowerCase().includes(lowerSearch)) &&
      (categoryFilter === 'All Categories' || p.categories?.name === categoryFilter)
    );
  }, [prompts, search, categoryFilter]);

async function handleSave(prompt) {
  const promptToSave = {
    id: prompt.id,
    title: prompt.title,
    description: prompt.description,
    content: prompt.content,
    category_id: prompt.category_id,
    is_public: prompt.is_public,
    user_id: session.user.id,
  };

  const { error } = await supabase
    .from('prompts')
    .upsert(promptToSave);

  if (error) alert(`Failed to save prompt: ${error.message}`);
  else fetchPrompts();
  setEditingPrompt(null);
}

  async function handleDelete(id) {
    const { error } = await supabase.from('prompts').delete().eq('id', id);
    if (error) alert(`Failed to delete prompt: ${error.message}`);
    else fetchPrompts();
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
            onCopy={() => navigator.clipboard.writeText(prompt.content)}
            onEdit={() => setEditingPrompt(prompt)}
            onDelete={() => handleDelete(prompt.id)}
          />
        ))}
      </div>

      {editingPrompt && (
        <PromptFormModal
          prompt={editingPrompt}
          categories={categories}
          onClose={() => setEditingPrompt(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}