
import { SupabaseClient } from '@supabase/supabase-js';

export const fetchCategories = (supabase: SupabaseClient) =>
  supabase.from('categories').select('*');

export const fetchPrompts = async (
  supabase: SupabaseClient,
  archived = false,
) => {
  // Exclude heavy 'content' to keep list lightweight
  const base = supabase
    .from('prompts')
    .select(`
      id, user_id, title, description, is_public, inserted_at,
      category_id, favorit, next_prompt_id, color, sort_order,
      model_id, chain_id, chain_order, archived_at,
      categories(name),
      profiles(email),
      next_prompt:next_prompt_id(title)
    `)
    .order('sort_order', { ascending: true });

  const { data, error } = archived
    ? await base.not('archived_at', 'is', null)
    : await base.is('archived_at', null);

  return { data: data ?? [], error };
};

export const fetchPromptContent = async (
  supabase: SupabaseClient,
  id: string,
) => {
  const { data, error } = await supabase
    .from('prompts')
    .select('content')
    .eq('id', id)
    .single();
  return { content: data?.content ?? '', error };
};

export const savePrompt = async (
  supabase: SupabaseClient,
  prompt: any,
  userId: string,
): Promise<any> => {
  const { categories, profiles, next_prompt, ...cleanPrompt } = prompt;

  const { error } = await supabase.from('prompts').upsert({
    ...cleanPrompt,
    user_id: userId,
    next_prompt_id: prompt.next_prompt_id || null,
  });

  return error;
};

export const deletePrompt = async (supabase: SupabaseClient, id: string) => {
  const { error } = await supabase.from('prompts').delete().eq('id', id);
  return error;
};

export const clonePrompt = async (
  supabase: SupabaseClient,
  prompt: any,
  userId: string,
): Promise<any> => {
  let content = prompt.content;
  if (!content && prompt.id) {
    const { data } = await supabase
      .from('prompts')
      .select('content')
      .eq('id', prompt.id)
      .single();
    content = data?.content || '';
  }

  const clonedPrompt = {
    title: `${prompt.title} (clone)`,
    content,
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

export const toggleFavorit = async (
  supabase: SupabaseClient,
  prompt: any,
  userId: string,
): Promise<{ error: string | null }> => {
  if (!prompt.favorit) {
    const { data, error } = await supabase.rpc('set_favorite_with_limit', {
      prompt_id: prompt.id,
      user_uuid: userId
    });

    if (error || data === 'limit_reached') {
      return { error: error ? error.message : 'Maximum number of favorites reached (25).' };
    }
  } else {
    const { error } = await supabase.rpc('bump_sort_order', { p_id: prompt.id });
    if (error) return { error: error.message };
  }

  return { error: null };
};

export const updatePrompt = async (
  supabase: SupabaseClient,
  fields: { id: string; [key: string]: any },
) => {
  const { id, ...rest } = fields;
  const { error } = await supabase.from('prompts').update(rest).eq('id', id);
  return error;
};

export const updatePromptOrder = async (
  supabase: SupabaseClient,
  reorderedPrompts: any[],
) => {
  const updates = reorderedPrompts.map((prompt, index) =>
    supabase
      .from('prompts')
      .update({ sort_order: index })
      .eq('id', prompt.id)
  );

  const results = await Promise.all(updates);
  return results.find(res => res.error)?.error || null;
};

export const archivePrompt = async (
  supabase: SupabaseClient,
  prompt: any,
) => {
  const fields = {
    id: prompt.id,
    archived_at: new Date().toISOString(),
    favorit: false,
    color: 'default',
    chain_id: null,
    chain_order: null,
  };

  const { error } = await supabase.from('prompts').update(fields).eq('id', prompt.id);
  return error;
};
