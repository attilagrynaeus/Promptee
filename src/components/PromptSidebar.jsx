import { useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import usePromptDump from '../hooks/usePromptDump';

import ChainModeToggle from '../utils/ChainModeToggle';
import SearchFilters   from './SearchFilters';
import FavoritesToggle from './FavoritesToggle';

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

  /* default chain */
  useEffect(() => {
    if (chainView && !chainFilter && chains.length) {
      setChainFilter(chains[0].id);
    }
  }, [chainView, chainFilter, chains, setChainFilter]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert('Successfully logged out.');
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
    <aside className="sidebar-box flex flex-col justify-between sticky top-0 self-start min-h-screen">

      <div>
        <h2 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-center">
          PrompTee 🍵
        </h2>

        <button onClick={onNew} className="btn-blue mt-4 w-full shadow-lg">
          New prompt
        </button>

        <ChainModeToggle
          chainView={chainView}
          setChainView={setChainView}
          chainFilter={chainFilter}
          setChainFilter={setChainFilter}
          chains={chains}
        />

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

        {/* Exit Chain View */}
        <button
          onClick={deactivateChainView}
          disabled={!chainViewActive}
          className={`mt-4 w-full py-2 rounded-lg transition-colors font-semibold ${
            chainViewActive
              ? 'bg-teal-600 text-white hover:bg-teal-500'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          🔗 Exit Chain View
        </button>

        {/* user info */}
        <div className="border-t border-gray-700 my-4" />
        <div className="text-center text-sm text-gray-400">
          Logged in as{' '}
          <span className="font-semibold text-indigo-400">{username}</span>
        </div>
      </div>

      <div className="mt-auto pt-4 text-center text-sm text-gray-400 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="mt-2 text-sm font-semibold bg-red-700 hover:bg-red-600 transition-colors text-white rounded-lg py-1 px-3"
        >
          Logout
        </button>

        <button
          onClick={dump}
          disabled={dumpLoading}
          className="mt-2 ml-2 text-sm bg-gray-700 hover:bg-gray-600 transition-colors text-white rounded-lg py-1 px-3"
        >
          {dumpLoading ? '⏳ Dumping…' : '📥 Dump Prompts'}
        </button>

        {dumpError && (
          <p className="text-red-400 mt-1">⚠️ {dumpError.message}</p>
        )}
      </div>
    </aside>
  );
}