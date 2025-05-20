export default function PromptSidebar({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  onNew,
  categories,
}) {
  return (
    <aside className="w-72 bg-slate-200 rounded-xl p-4 flex flex-col gap-4 shadow-inner">
      {}
      <h2 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text 
       bg-gradient-to-r from-fuchsia-600 to-amber-400 drop-shadow-md text-center">Promptee</h2>

      {}
      <button onClick={onNew} className="btn-3d bg-fuchsia-600 hover:bg-fuchsia-700">
        New prompt
      </button>

      {}
      <input
        type="text"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value.toLowerCase())}
        className="bg-white rounded-lg p-2 focus:ring-2 ring-fuchsia-500"
      />

      {}
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="bg-white rounded-lg p-2"
      >
        <option>All Categories</option>
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    </aside>
  );
}