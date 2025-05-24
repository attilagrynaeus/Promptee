export const fetchCategories = (supabase) => supabase.from('categories').select('*');

export const fetchPrompts = (supabase) =>
  supabase.from('prompts').select(`
    *, categories(name), favorit, profiles(email), next_prompt:next_prompt_id(title)
  `).order('inserted_at', { ascending: false });

export const savePrompt = async (supabase, prompt, userId) => {
  const { error } = await supabase.from('prompts').upsert({
    ...prompt,
    user_id: userId,
    next_prompt_id: prompt.next_prompt_id || null,
  });
  return error;
};

export const deletePrompt = async (supabase, id) => {
  const { error } = await supabase.from('prompts').delete().eq('id', id);
  return error;
};

export const clonePrompt = async (supabase, prompt, userId) => {
  const clonedPrompt = {
    title: `${prompt.title} (clone)`,
    content: prompt.content,
    description: prompt.description,
    category_id: prompt.category_id || null,
    next_prompt_id: prompt.next_prompt_id || null,
    is_public: false,
    favorit: false,
    user_id: userId,
    inserted_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('prompts').insert(clonedPrompt);
  return error;
};


export const toggleFavorit = async (supabase, prompt) => {
  const { error } = await supabase.from('prompts').update({ favorit: !prompt.favorit }).eq('id', prompt.id);
  return error;
};