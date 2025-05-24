/**
 * Export every prompt that belongs to userId into a TXT download.
 * Re-throws Supabase errors so the caller/hook jeleníti meg.
 */
export async function exportPrompts({ supabase, userId, username }) {
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('title, description, content')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  const header = `Prompt Dump (${prompts.length})\n\n`;
  const body   = prompts
    .map((p, i) => [
      `Prompt #${i + 1}`,
      `Title: ${p.title}`,
      `Description: ${p.description || 'N/A'}`,
      `Content:\n${p.content}`,
      '--------------------------------------\n'
    ].join('\n'))
    .join('\n');

  const blob = new Blob([header + body], {
    type: 'text/plain;charset=utf-8'
  });

  const a   = document.createElement('a');
  a.href    = URL.createObjectURL(blob);
  a.download = `${username}_prompts_${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
}