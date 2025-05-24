import { useState, useCallback } from 'react';
import { exportPrompts }        from '../utils/exportPrompts';

export default function usePromptDump(supabase, session, username) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const dump = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await exportPrompts({
        supabase,
        userId:   session.user.id,
        username
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [supabase, session, username]);

  return { dump, loading, error };
}