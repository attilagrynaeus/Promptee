import { useState, useCallback } from 'react';
import { exportPrompts } from 'utils/exportPrompts';
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
