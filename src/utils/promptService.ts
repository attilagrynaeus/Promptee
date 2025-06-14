
import { SupabaseClient } from '@supabase/supabase-js';

export const fetchCategories = (supabase: SupabaseClient) =>
  supabase.from('categories').select('*');

export const fetchPrompts = (supabase: SupabaseClient, archived = false) => {
  const query = supabase
    .from('prompts')
    .select(`
      *,
      categories(name),
      favorit,
      profiles(email),
      next_prompt:next_prompt_id(title)
    `)
    .order('sort_order', { ascending: true });

  if (archived) query.not('archived_at', 'is', null);
  else query.is('archived_at', null);

  return query;
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