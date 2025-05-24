import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

export default function PromptSidebar({
  search, setSearch,
  categoryFilter, setCategoryFilter,
  onNew, categories,
  user, favoriteOnly, setFavoriteOnly
}) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const username = user?.email?.split('@')[0] || 'Guest';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert('Successfully logged out.');
  };

  const handleDumpPrompts = async () => {
    const { data: prompts, error } = await supabase
      .from('prompts')
      .select('title, description, content')
      .eq('user_id', session.user.id);

    if (error) {
      alert(`Error fetching prompts: ${error.message}`);
      return;
    }

    const promptCount = prompts.length;
    let dumpContent = `Prompt Dump (${promptCount} prompts)\n\n`;

    prompts.forEach((p, idx) => {
      dumpContent += `Prompt #${idx + 1}\n`;
      dumpContent += `Title: ${p.title}\n`;
      dumpContent += `Description: ${p.description || 'N/A'}\n`;
      dumpContent += `Content:\n${p.content}\n`;
      dumpContent += `--------------------------------------\n`;
    });

    const blob = new Blob([dumpContent], { type: 'text/plain;charset=utf-8' });
    const downloadLink = document.createElement('a');
    const date = new Date().toISOString().slice(0,10);
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${username}_prompts_${date}.txt`;
    downloadLink.click();
  };

  const toggleFavoriteOnly = () => {
    setFavoriteOnly(!favoriteOnly);
    if (!favoriteOnly) { 
      setSearch('');
      setCategoryFilter('All Categories');
    }
  };

  return (
    <aside className="sidebar-box flex flex-col justify-between h-full min-h-full">
      <div>
        <h2 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-center">
          Prompts
        </h2>

        <button onClick={onNew} className="btn-blue mt-4 w-full">
          New prompt
        </button>

        {!favoriteOnly && (
          <>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value.toLowerCase())}
              className="field-dark mt-4 w-full"
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="field-dark mt-2 w-full"
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </>
        )}

        <button
          onClick={toggleFavoriteOnly}
          className={`mt-4 w-full py-2 rounded-lg transition-colors font-semibold ${
            favoriteOnly ? 'bg-yellow-500 text-gray-800' : 'bg-gray-700 text-gray-200'
          }`}
        >
          {favoriteOnly ? '⭐ Showing Favorites' : '☆ Show Favorites'}
        </button>

        <div className="border-t border-gray-700 my-4" />

        <div className="text-center text-sm text-gray-400">
          Logged in as <span className="font-semibold text-indigo-400">{username}</span>
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
          onClick={handleDumpPrompts}
          className="mt-2 ml-2 text-sm bg-gray-700 hover:bg-gray-600 transition-colors text-white rounded-lg py-1 px-3"
        >
          📥Dump Prompts
        </button>
      </div>
    </aside>
  );
}