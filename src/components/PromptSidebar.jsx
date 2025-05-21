import React from 'react';

export default function PromptSidebar({
  search, setSearch,
  categoryFilter, setCategoryFilter,
  onNew, categories,
}) {
  return (
    <aside className="sidebar-box">
      {/* Heading with violet-pink gradient */}
      <h2 className="
        text-4xl font-extrabold tracking-wide text-transparent bg-clip-text
        bg-gradient-to-r from-accent-pink to-accent-blue text-center
      ">
        Prompts
      </h2>

      {/* New prompt */}
      <button onClick={onNew} className="btn-blue">
        New prompt
      </button>

      {/* Search */}
      <input
        type="text"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value.toLowerCase())}
        className="field-dark"
      />

      {/* Category filter */}
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className="field-dark"
      >
        <option>All Categories</option>
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    </aside>
  );
}
