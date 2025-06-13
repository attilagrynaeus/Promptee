import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, useMemo, useEffect } from 'react';
import PromptSidebar from './components/PromptSidebar';
import PromptCard from './components/PromptCard';
import ChainSeparator from './components/ChainSeparator';
import PromptFormModal from './components/PromptFormModal';
import LoginForm from './components/LoginForm';
import useProfile from './hooks/useProfile';
import useIdleTimeout from './hooks/useIdleTimeout';
import { useDialog } from './context/DialogContext';
import usePromptData from './hooks/usePromptData';
import { filterPrompts } from './utils/promptFilter';
import { toggleFavorit } from './utils/promptService';
import { t } from './i18n';

export default function PromptApp() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const { profile, loading } = useProfile();
  const { showDialog } = useDialog();

  useIdleTimeout(90);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [viewingPrompt, setViewingPrompt] = useState(null);
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  const [chainView, setChainView] = useState(false);
  const [chainFilter, setChainFilter] = useState(() => {
    if (typeof sessionStorage === 'undefined') return '';
    return sessionStorage.getItem('chainFilter') || '';
  });
  const [currentChain, setCurrentChain] = useState([]);
  const [chains, setChains] = useState([]);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('chainFilter', chainFilter);
    }
  }, [chainFilter]);

  const {
    prompts, categories, handleSave, handleDelete,
    handleClone, fetchPrompts
  } = usePromptData(supabase, session, showDialog);

  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) {
      setChains([]);
      return;
    }

    supabase
      .from('chains')
      .select('*')
      .eq('user_id', uid)
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error('Chains fetch error', error);
        setChains(data || []);
      });
  }, [session?.user?.id, supabase]);

  useEffect(() => {
    if (chainView && !chainFilter && chains.length) {
      setChainFilter(chains[0].id);
    }

    if (chainView && chainFilter) {
      const chainPrompts = prompts
        .filter(p => p.chain_id === chainFilter)
        .sort((a, b) => (a.chain_order ?? 999) - (b.chain_order ?? 999));
      setCurrentChain(chainPrompts);
    } else {
      setCurrentChain([]);
    }
  }, [chainView, chainFilter, chains, prompts]);

  useEffect(() => {
    if (profile && profile.role === 'Master') {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  const filtered = useMemo(() => {
    if (chainView && chainFilter) {
      return currentChain;
    }

    return filterPrompts({
      session, prompts, search, categoryFilter, favoriteOnly
    }).sort((a, b) => a.sort_order - b.sort_order);
  }, [
    session, prompts, search, categoryFilter,
    favoriteOnly, chainView, chainFilter, currentChain
  ]);

  const handleColorChange = async (promptId, color) => {
    const { error } = await supabase
      .from('prompts')
      .update({ color })
      .eq('id', promptId);
    if (error) {
      showDialog({ title: t('Errors.Error'), message: error.message, confirmText: t('PromptCard.OK') });
    } else {
      fetchPrompts();
    }
  };

  const handleToggleFavorit = async (prompt) => {
    if (!prompt.id || !session.user.id) {
      showDialog({
        title: t('PromptCard.FavErrorTitle'),
        message: t('PromptCard.FavIdMissing'),
        confirmText: t('PromptCard.OK')
      });
      return;
    }
    const { error } = await toggleFavorit(supabase, prompt, session.user.id);
    if (error) {
      showDialog({
        title: t('PromptCard.FavErrorTitle'),
        message: error.message || t('Errors.Error'),
        confirmText: t('PromptCard.OK')
      });
    } else {
      fetchPrompts();
    }
  };

  const handleView = (prompt) => setViewingPrompt(prompt);
  const closeViewModal = () => setViewingPrompt(null);

  if (!session) return <LoginForm />;
  if (loading || !profile) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="flex min-h-screen p-8 gap-8 items-stretch bg-[#1e2024]">
      <PromptSidebar
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        chains={chains}
        onNew={() => setEditingPrompt({})}
        categories={['All Categories', ...categories.map(c => c.name)]}
        user={profile}
        favoriteOnly={favoriteOnly}
        setFavoriteOnly={setFavoriteOnly}
        chainView={chainView}
        setChainView={setChainView}
        chainFilter={chainFilter}
        setChainFilter={setChainFilter}
        chainViewActive={chainView && chainFilter !== ''}
        deactivateChainView={() => {
          setChainView(false);
        }}
      />

      <main className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max items-start">
          {filtered.map((prompt, idx) => (
            <React.Fragment key={prompt.id}>
              <PromptCard
                prompt={{ ...prompt, category: prompt.categories?.name || 'Uncategorized' }}
                currentUserId={session.user.id}
                chainViewActive={chainView}
                onCopy={() => navigator.clipboard.writeText(prompt.content)}
                onEdit={() => setEditingPrompt(prompt)}
                onView={handleView}
                onDelete={() => handleDelete(prompt.id)}
                onToggleFavorit={handleToggleFavorit}
                onClone={handleClone}
                onColorChange={handleColorChange}
              />
              {chainView && idx < filtered.length - 1 && <ChainSeparator />}
            </React.Fragment>
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

      {viewingPrompt && (
        <PromptFormModal
          prompt={viewingPrompt}
          categories={categories}
          prompts={prompts}
          onClose={closeViewModal}
          readOnly={true}
        />
      )}
    </div>
  );
}