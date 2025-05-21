import { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import PromptSidebar from './components/PromptSidebar';
import PromptCard from './components/PromptCard';
import PromptFormModal from './components/PromptFormModal';

/*const initialPrompts = [
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
];*/

export default function App() {
  const [prompts, setPrompts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [editingPrompt, setEditingPrompt] = useState(null);

  // Fetch prompts from Supabase on initial load
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('inserted_at', { ascending: false });
      
      if (!error && data) {
        setPrompts(data);
      }
    })();
  }, []);

  // Filter prompts based on search & category
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

  // Save or update prompt in Supabase
  const handleSave = async (prompt) => {
    const { data, error } = await supabase
      .from('prompts')
      .upsert(prompt)
      .select();

    if (!error && data) {
      setPrompts((prev) =>
        prev.some((p) => p.id === data[0].id)
          ? prev.map((p) => (p.id === data[0].id ? data[0] : p))
          : [data[0], ...prev]
      );
    }
  };

  // Delete prompt from Supabase
  const handleDelete = async (id) => {
    const { error } = await supabase.from('prompts').delete().eq('id', id);

    if (!error) {
      setPrompts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="flex min-h-screen bg-page-bg p-8 gap-8">
      <PromptSidebar
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onNew={() => setEditingPrompt({})}
        categories={[...new Set(prompts.map((p) => p.category))]}
      />

      <div className="flex-1 overflow-y-auto grid sm:grid-cols-2 lg:grid-cols-3 auto-rows-min items-start gap-8">
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