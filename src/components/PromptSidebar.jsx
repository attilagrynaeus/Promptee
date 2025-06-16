import { useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import usePromptDump from 'hooks/usePromptDump';
import { t } from 'i18n';

import { useDialog } from 'context/DialogContext';

import ChainModeToggle   from 'components/ChainModeToggle';
import SearchFilters     from 'components/SearchFilters';
import FavoritesToggle   from 'components/FavoritesToggle';
import ArchivedToggle    from 'components/ArchivedToggle';

export default function PromptSidebar({
  search, setSearch,
  categoryFilter, setCategoryFilter,
  onNew, categories,
  user, favoriteOnly, setFavoriteOnly,
  chains,
  chainViewActive, deactivateChainView,
  chainView, setChainView,
  chainFilter, setChainFilter
}) {
  const supabase = useSupabaseClient();
  const session  = useSession();
  const username = user?.email?.split('@')[0] || 'Guest';
  const { showDialog } = useDialog();

  useEffect(() => {
    if (chainView && !chainFilter && chains.length) {
      setChainFilter(chains[0].id);
    }
  }, [chainView, chainFilter, chains, setChainFilter]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showDialog({
      title: t('PromptSidebar.LogoutTitle'),
      message: t('PromptSidebar.LogoutMsg'),
      confirmText: t('PromptSidebar.OK')
    });
  };

  const toggleFavoriteOnly = () => {
    if (favoriteOnly) {
      setFavoriteOnly(false);
    } else {
      setFavoriteOnly(true);
      setSearch('');
      setCategoryFilter('All Categories');
      deactivateChainView();
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('All Categories');
    deactivateChainView();
    setFavoriteOnly(false);
  };

  const {
    dump,
    loading: dumpLoading,
    error:   dumpError
  } = usePromptDump(supabase, session, username);

  return (
    <aside className="sidebar-box flex flex-col justify-between">
      <div>
        <h2 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-center">
          {t('PromptSidebar.Title')}
        </h2>

        <button onClick={onNew} className="btn-blue mt-4 w-full shadow-lg">
          {t('PromptSidebar.NewPrompt')}
        </button>

        {!favoriteOnly && !chainView && (
          <SearchFilters
            search={search}
            setSearch={setSearch}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categories={categories}
            clearFilters={clearFilters}
          />
        )}

        {!chainViewActive && (
          <FavoritesToggle
            favoriteOnly={favoriteOnly}
            toggleFavoriteOnly={toggleFavoriteOnly}
          />
        )}

        {!chainView && (
          <ChainModeToggle
            chainView={chainView}
            setChainView={setChainView}
            chainFilter={chainFilter}
            setChainFilter={setChainFilter}
            chains={chains}
          />
        )}


        {chainView && chains.length > 0 && (
          <div className="mt-4">
            <label className="block text-xs text-gray-400 mb-1">
              {t('PromptSidebar.ChooseChain')}
            </label>
            <select
              value={chainFilter ?? chains[0].id}
              onChange={e => setChainFilter(e.target.value)}
              className="w-full rounded-lg bg-gray-800 text-sm text-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {chains.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name ?? c.title ?? c.id}
                </option>
              ))}
            </select>
          </div>
        )}

        {!chainView && <ArchivedToggle />}

        <button
          onClick={deactivateChainView}
          disabled={!chainViewActive}
          className={`mt-4 w-full py-2 rounded-lg transition-colors font-semibold ${
            chainViewActive
              ? 'bg-teal-600 text-white hover:bg-teal-500'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {t('PromptSidebar.ExitChain')}
        </button>

        {/* user info */}
        <div className="border-t border-gray-700 my-4" />
        <div className="text-center text-sm text-gray-400">
          {t('PromptSidebar.LoggedInAs')}{' '}
          <span className="font-semibold text-indigo-400">{username}</span>
        </div>
      </div>

      {/* footer */}
      <div className="mt-auto pt-4 text-center text-sm text-gray-400 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="mt-2 text-sm font-semibold bg-red-700 hover:bg-red-600 transition-colors text-white rounded-lg py-1 px-3"
        >
          {t('PromptSidebar.Logout')}
        </button>

        <button
          onClick={dump}
          disabled={dumpLoading}
          className="mt-2 ml-2 text-sm bg-gray-700 hover:bg-gray-600 transition-colors text-white rounded-lg py-1 px-3"
        >
          {dumpLoading ? t('PromptSidebar.Dumping') : t('PromptSidebar.DumpPrompts')}
        </button>

        {dumpError && (
          <p className="text-red-400 mt-1">⚠️ {dumpError.message}</p>
        )}
      </div>
    </aside>
  );
}