import { useState, useMemo } from 'react';
import PromptSidebar from './components/PromptSidebar';
import PromptCard from './components/PromptCard';
import PromptFormModal from './components/PromptFormModal';

const initialPrompts = [
  {
    id: crypto.randomUUID(),
    title: 'tital',
    content: 'wuwuw',
    description: 'desc',
    category: 'Illustration',
    isPublic: false,
  },
  {
    id: crypto.randomUUID(),
    title: 'sdfsdf ziziz',
    content: 'sdfsdf',
    description: '',
    category: 'Jokes & Humor',
    isPublic: true,
  },
  {
    id: crypto.randomUUID(),
    title: 'LitRpg Szöveg Bővít 2',
    content: 'sdfdsdfghfgh\nsdfghfg',
    description: '',
    category: 'SEO Optimization',
    isPublic: false,
  },
];

export default function App() {
  const [prompts, setPrompts] = useState(initialPrompts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [editingPrompt, setEditingPrompt] = useState(null);

  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search) ||
        p.content.toLowerCase().includes(search);
      const matchesCategory =
        categoryFilter === 'All Categories' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [prompts, search, categoryFilter]);

  const handleSave = (prompt) => {
    setPrompts((prev) => {
      const exists = prev.find((p) => p.id === prompt.id);
      return exists
        ? prev.map((p) => (p.id === prompt.id ? prompt : p))
        : [...prev, prompt];
    });
  };

  const handleDelete = (id) =>
    setPrompts((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="flex min-h-screen bg-rose-50 p-4 gap-4">
      {/* ─────────── Sidebar ─────────── */}
      <PromptSidebar
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onNew={() => setEditingPrompt({})}
        categories={[
          'Illustration',
          'Jokes & Humor',
          'SEO Optimization',
          ...new Set(prompts.map((p) => p.category)),
        ]}
      />

      {/* ─────────── Kártyarács ─────────── */}
      <div
        className="
          flex-1 overflow-y-auto                 /* görgethető terület */
          grid sm:grid-cols-2 lg:grid-cols-3     /* reszponzív oszlopszám */
          auto-rows-min items-start gap-6        /* változó magasság */
        "
      >
        {filtered.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onCopy={() => navigator.clipboard.writeText(prompt.content)}
            onEdit={() => setEditingPrompt(prompt)}
            onDelete={() => handleDelete(prompt.id)}
          />
        ))}
      </div>

      {/* ─────────── Új / Szerkesztő modal ─────────── */}
      {editingPrompt !== null && (
        <PromptFormModal
          prompt={editingPrompt}
          onClose={() => setEditingPrompt(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}