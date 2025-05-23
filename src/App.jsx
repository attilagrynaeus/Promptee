import { useState, useEffect, useMemo } from 'react';
import supabase from 'supabaseClient';
import PromptSidebar from './components/PromptSidebar';
import PromptCard from './components/PromptCard';
import PromptFormModal from './components/PromptFormModal';

export default function App() {
  const [prompts, setPrompts] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [editingPrompt, setEditingPrompt] = useState(null);

  // Load prompts from Supabase
  useEffect(() => {
    const fetchPrompts = async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('inserted_at', { ascending: false });

      if (error) {
        alert(`Failed to load prompts: ${error.message}`);
      } else {
        setPrompts(data);
      }
    };

    fetchPrompts();
  }, []);

  // Filter logic
  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return prompts.filter(p =>
      (p.title.toLowerCase().includes(lowerSearch) || p.content.toLowerCase().includes(lowerSearch)) &&
      (categoryFilter === 'All Categories' || p.category === categoryFilter)
    );
  }, [prompts, search, categoryFilter]);

  // Save or update prompt
  const handleSave = async (prompt) => {
    const { data, error } = await supabase
      .from('prompts')
      .upsert(prompt)
      .select();

    if (error) {
      alert(`Failed to save prompt: ${error.message}`);
      return;
    }

    setPrompts(prev => {
      const exists = prev.some(p => p.id === data[0].id);
      return exists
        ? prev.map(p => (p.id === data[0].id ? data[0] : p))
        : [data[0], ...prev];
    });
  };

  // Delete prompt
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) {
      alert(`Failed to delete prompt: ${error.message}`);
      return;
    }

    setPrompts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-page-bg p-8 gap-8">
      <PromptSidebar
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onNew={() => setEditingPrompt({})}
        categories={[...new Set(prompts.map(p => p.category))]}
      />

      <div className="flex-1 overflow-y-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(prompt => (
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
