import { useState, useCallback } from 'react';
import { SupabaseClient, Session } from '@supabase/supabase-js';

export default function usePromptDump(
  supabase: SupabaseClient,
  session: Session,
  username: string
): { dump: () => Promise<void>; loading: boolean; error: Error | null } {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const dump = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Use explicit relative path to avoid dev-time alias issues.
      // Fallback to alias import if needed (some setups prefer alias resolution).
      let exportPrompts: (args: any) => Promise<void>;
      try {
        exportPrompts = (await import('../utils/exportPrompts.tsx')).exportPrompts;
      } catch (_) {
        exportPrompts = (await import('utils/exportPrompts')).exportPrompts;
      }
      await exportPrompts({
        supabase,
        userId: session.user.id,
        username,
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [supabase, session, username]);

  return { dump, loading, error };
}
