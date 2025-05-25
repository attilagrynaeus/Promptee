export const fetchCategories = (supabase) => 
  supabase.from('categories').select('*');

export const fetchPrompts = (supabase) =>
  supabase
    .from('prompts')
    .select(`
      *,
      categories(name),
      favorit,
      profiles(email),
      next_prompt:next_prompt_id(title)
    `)
    .order('sort_order', { ascending: true }); // ⬅️ sort_order alapján rendezve

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

export const toggleFavorit = async (supabase, prompt, userId) => {
  if (!prompt.favorit) {
    const { data, error } = await supabase.rpc('set_favorite_with_limit', {
      prompt_id: prompt.id,
      user_uuid: userId
    });

    if (error || data === 'limit_reached') {
      return { error: error ? error.message : 'Maximum number of favorites reached (25).' };
    }
  } else {
    // If the prompt was already a favourite, take it out of the favourites and put it at the end
    const { data: maxOrder } = await supabase
      .from('prompts')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const newOrder = maxOrder ? maxOrder.sort_order + 1 : 1000;

    const { error } = await supabase
      .from('prompts')
      .update({ favorit: false, sort_order: newOrder })
      .eq('id', prompt.id);

    if (error) return { error: error.message };
  }

  return { error: null };
};


export const updatePromptOrder = async (supabase, reorderedPrompts) => {
  const updates = reorderedPrompts.map((prompt, index) =>
    supabase
      .from('prompts')
      .update({ sort_order: index })
      .eq('id', prompt.id)
  );

  const results = await Promise.all(updates);
  return results.find(res => res.error)?.error || null;
};
