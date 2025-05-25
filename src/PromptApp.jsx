import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, useMemo, useEffect } from 'react';
import PromptSidebar from './components/PromptSidebar';
import PromptCard from './components/PromptCard';
import PromptFormModal from './components/PromptFormModal';
import LoginForm from './components/LoginForm';
import useProfile from './hooks/useProfile';
import useIdleTimeout from './hooks/useIdleTimeout';
import { useDialog } from './context/DialogContext';
import usePromptData from './hooks/usePromptData';
import { filterPrompts } from './utils/promptFilter';
import { toggleFavorit } from './utils/promptService';

export default function PromptApp() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const { profile, loading } = useProfile();
  const { showDialog } = useDialog();

  useIdleTimeout(60);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [chainViewActive, setChainViewActive] = useState(false);
  const [currentChain, setCurrentChain] = useState([]);
  const [showWelcome, setShowWelcome] = useState(false);

  const {
    prompts, categories, handleSave, handleDelete,
    handleClone, fetchPrompts
  } = usePromptData(supabase, session, showDialog);

  useEffect(() => {
    if (profile) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  const filtered = useMemo(() => {
    return filterPrompts({
      session, prompts, search, categoryFilter, favoriteOnly, chainViewActive, currentChain
    }).sort((a, b) => a.sort_order - b.sort_order);
  }, [session, prompts, search, categoryFilter, favoriteOnly, chainViewActive, currentChain]);

  const handleColorChange = async (promptId, color) => {
    const { error } = await supabase
      .from('prompts')
      .update({ color })
      .eq('id', promptId);

    if (error) {
      showDialog({ title: 'Error', message: error.message, confirmText: 'OK' });
    } else {
      fetchPrompts();
    }
  };

  const handleToggleFavorit = async (prompt) => {
    const { error } = await toggleFavorit(supabase, prompt, session.user.id);
    if (error) {
      showDialog({
        title: 'Cannot set favorite',
        message: error.message,
        confirmText: 'OK'
      });
    } else {
      fetchPrompts();
    }
  };

  if (!session) return <LoginForm />;
  if (loading || !profile) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="flex min-h-screen h-screen p-8 gap-8 items-stretch bg-gradient-to-br from-indigo-900 to-blue-400">
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
        chainViewActive={chainViewActive}
        deactivateChainView={() => setChainViewActive(false)}
        toggleChainView={() => setChainViewActive(prev => !prev)}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max items-start">
          {showWelcome && profile.role === 'pro' && (
            <div className="col-span-full px-4 py-2 bg-blue-900 rounded-lg shadow text-gray-200 font-extrabold text-center text-2xl animate-fadeOut">
              💜 PRO features enabled! Welcome {profile.email.split('@')[0].toUpperCase()}! 💜
            </div>
          )}

          {filtered.map(prompt => (
            <PromptCard
              key={prompt.id}
              prompt={{ ...prompt, category: prompt.categories?.name || 'Uncategorized' }}
              currentUserId={session.user.id}
              onCopy={() => navigator.clipboard.writeText(prompt.content)}
              onEdit={() => setEditingPrompt(prompt)}
              onDelete={() => handleDelete(prompt.id)}
              chainViewActive={chainViewActive}
              onToggleFavorit={handleToggleFavorit}
              onClone={handleClone}
              activateChainView={() => setChainViewActive(true)}
              onColorChange={handleColorChange}
            />
          ))}
        </div>
      </main>

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