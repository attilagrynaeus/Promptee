import { SupabaseClient } from '@supabase/supabase-js';

// Adds a new category. According to backup-2025-06-07.sql,
// the categories table has only: id (uuid, default) and name (text, not null)
// plus a UNIQUE(name) constraint. No user_id or sort_order required.
export async function addCategory(
  supabase: SupabaseClient,
  name: string,
) {
  return supabase.from('categories').insert({ name });
}

// Updates category name by id. Respects UNIQUE(name) constraint.
export async function updateCategory(
  supabase: SupabaseClient,
  id: string,
  name: string,
) {
  return supabase.from('categories').update({ name }).eq('id', id);
}
