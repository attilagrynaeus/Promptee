import React from 'react';
import { t } from 'i18n';

export default function SearchFilters({
  search, setSearch,
  categoryFilter, setCategoryFilter,
  categories = [],
  clearFilters
}) {
  const shortcutLabel = ['⌘'];

  return (
    <>
      <div className="relative mt-4">
        <input
          type="text"
          placeholder={t('SearchFilters.SearchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
          className="field-dark w-full pr-20"
        />
        <div className="absolute inset-y-0 right-3 flex items-center gap-1 pointer-events-none">
          {shortcutLabel.map((c) => (
            <span key={c} className="keycap">
              {c}
            </span>
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
        {t('SearchFilters.Clear')}
      </button>
    </>
  );
}