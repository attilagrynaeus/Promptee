import React from 'react';

export default function PromptSidebar({
  search, setSearch,
  categoryFilter, setCategoryFilter,
  onNew, categories,
}) {
  // Ensure unique categories by using a Set
  const uniqueCategories = Array.from(new Set(['Illustration', 'Jokes & Humor', 'SEO Optimization', ...categories]));

  return (
    <aside className="sidebar-box">
      {/* Heading with improved gradient */}
      <h2 className="
        text-4xl font-extrabold tracking-wide text-transparent bg-clip-text
        bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-center
      ">
        Prompts
      </h2>

      {/* New prompt */}
      <button onClick={onNew} className="btn-blue">
        New prompt
      </button>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value.toLowerCase())}
        className="field-dark"
      />

      {/* Category selection */}
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="field-dark"
      >
        <option key="all">All Categories</option>
        {uniqueCategories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    </aside>
  );
}
