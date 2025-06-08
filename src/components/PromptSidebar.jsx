import { useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import usePromptDump from '../hooks/usePromptDump';

export default function PromptSidebar({
  search, setSearch,
  categoryFilter, setCategoryFilter,
  onNew, categories,
  user, favoriteOnly, setFavoriteOnly,
  chains,  // <-- propként érkezik a fő komponensből!

  chainViewActive, deactivateChainView,
  chainView, setChainView,
  chainFilter, setChainFilter
}) {
  const supabase = useSupabaseClient();
  const session  = useSession();
  const username = user?.email?.split('@')[0] || 'Guest';

  useEffect(() => {
    if (chainView && !chainFilter && chains.length) {
      setChainFilter(chains[0].id);
    }
  }, [chainView, chainFilter, chains, setChainFilter]);

  const shortcutLabel = ['⌘'];

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
    error: dumpError
  } = usePromptDump(supabase, session, username);

  /* UI */
  return (
    <aside className="sidebar-box flex flex-col justify-between h-full">

      <div>
        <h2 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-center">
          PrompTee 🍵
        </h2>

        <button onClick={onNew} className="btn-blue mt-4 w-full shadow-lg">
          New prompt
        </button>

        <div className="mt-4">
      <label className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={chainView}
    onChange={(e) => {
      const on = e.target.checked;
      setChainView(on);
      if (!on) {
        setChainFilter('');
      } else if (!chainFilter && chains.length) {
        setChainFilter(chains[0].id);
      }
    }}
  />
  Chain mode
</label>

          {/* dropdown csak, ha a mód aktív */}
          {chainView && (
            <select
              className="mt-2 w-full field-dark"
              value={chainFilter || ''}
              onChange={(e) => setChainFilter(e.target.value)}
            >
              <option value="">— válassz chain-t —</option>
              {chains.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* kereső + kategória – csak ha NEM chain-/favorite-nézet */}
        {!favoriteOnly && !chainView && (
          <>
            <div className="relative mt-4">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value.toLowerCase())
                }
                className="field-dark w-full pr-20"
              />
              <div className="absolute inset-y-0 right-3 flex items-center gap-1 pointer-events-none">
                {shortcutLabel.map((c) => (
                  <span key={c} className="keycap">{c}</span>
                ))}
              </div>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="field-dark mt-2 w-full"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <button
              onClick={clearFilters}
              className="mt-2 w-full py-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors font-semibold"
            >
              🗑️ Clear filters
            </button>
          </>
        )}

        {/* favorites toggle */}
        {!chainViewActive && (
          <button
            onClick={toggleFavoriteOnly}
            className={`mt-4 w-full py-2 rounded-lg transition-colors font-semibold ${
              favoriteOnly
                ? 'bg-yellow-500 text-gray-800'
                : 'bg-gray-700 text-gray-200'
            }`}
          >
            {favoriteOnly ? '⭐ Showing Favorites' : '☆ Show Favorites'}
          </button>
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
