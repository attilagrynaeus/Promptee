import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, useMemo } from 'react';
import PromptSidebar from './components/PromptSidebar';
import PromptCard from './components/PromptCard';
import PromptFormModal from './components/PromptFormModal';
import LoginForm from './components/LoginForm';
import useProfile from './hooks/useProfile';
import useIdleTimeout from './hooks/useIdleTimeout';
import { useDialog } from './context/DialogContext';
import usePromptData from './hooks/usePromptData';
import { filterPrompts } from './utils/promptFilter';

export default function PromptApp() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const profile = useProfile();
  const { showDialog } = useDialog();

  useIdleTimeout(60);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  const {
    prompts, categories, handleSave, handleDelete,
    handleClone, handleToggleFavorit, fetchPrompts
  } = usePromptData(supabase, session, showDialog);

  const [chainViewActive, setChainViewActive] = useState(false);
  const [currentChain, setCurrentChain] = useState([]);

  // Rendezés explicit sort_order szerint
  const filtered = useMemo(() => {
    const result = filterPrompts({
      session, prompts, search, categoryFilter, favoriteOnly, chainViewActive, currentChain
    });

    return result.sort((a, b) => a.sort_order - b.sort_order);
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

  if (!session) return <LoginForm />;
  if (!profile) return <div className="p-8 text-center text-gray-500">Loading...</div>;

 return (
    <div className="flex min-h-screen h-screen p-8 gap-8 items-stretch"
         style={{ background: 'linear-gradient(135deg, #2b1055, #7597de)' }}>
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
        toggleChainView={() => setChainViewActive(!chainViewActive)}
      />

      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start content-start">
        {profile.role === 'pro' && (
          <div className="col-span-full px-4 py-2 bg-gray-900 rounded-lg shadow text-gray-200 font-medium text-center">
            🎖️ Pro Features Enabled! Welcome, {profile.email.split('@')[0]}!
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