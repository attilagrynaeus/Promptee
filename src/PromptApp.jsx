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
import useChainView from './hooks/useChainView';
import { filterPrompts } from './utils/promptFilter';

export default function PromptApp() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const profile = useProfile();
  const { showDialog } = useDialog();

  useIdleTimeout(30);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  const {
    prompts, categories, handleSave, handleDelete,
    handleClone, handleToggleFavorit
  } = usePromptData(supabase, session, showDialog);

  const [chainViewActive, setChainViewActive] = useState(false);
  const [currentChain, setCurrentChain] = useState([]);

  const filtered = useMemo(() => filterPrompts({
    session, prompts, search, categoryFilter, favoriteOnly, chainViewActive, currentChain
  }), [session, prompts, search, categoryFilter, favoriteOnly, chainViewActive, currentChain]);

  // ChainView logikák külön:
  const activateChainView = (startPrompt) => {
    const chain = [];
    let current = startPrompt;
    while (current) {
      chain.push(current);
      current = prompts.find(p => p.id === current.next_prompt_id);
    }
    setCurrentChain(chain);
    setChainViewActive(true);
    setSearch('');
    setFavoriteOnly(false);
    setCategoryFilter('All Categories');
  };

  const deactivateChainView = () => {
    setChainViewActive(false);
    setCurrentChain([]);
  };

  const toggleChainView = () => {
    if (chainViewActive) {
      deactivateChainView();
    } else if (filtered.length > 0) {
      activateChainView(filtered[0]);
    } else {
      showDialog({
        title: 'No prompts available',
        message: 'You need at least one prompt to activate chain view.',
        confirmText: 'OK',
      });
    }
  };

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
          chainViewActive={chainViewActive}
          deactivateChainView={deactivateChainView}
          toggleChainView={toggleChainView}
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
            prompt={{ ...prompt, category: prompt.categories?.name || 'Uncategorized' }}
            currentUserId={session.user.id}
            onCopy={() => navigator.clipboard.writeText(prompt.content)}
            onEdit={() => setEditingPrompt(prompt)}
            onDelete={() => handleDelete(prompt.id)}
            chainViewActive={chainViewActive}
            onToggleFavorit={handleToggleFavorit}
            onClone={handleClone}
            activateChainView={activateChainView}
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