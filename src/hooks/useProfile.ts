import { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

export default function useProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (session) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchProfile = async (): Promise<void> => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!error) {
      setProfile(data);
      setError(null);
    } else {
      console.error("Profile fetch error:", error);
      setError(error);
      setProfile(null);
    }
    setLoading(false);
  };

  return { profile, loading, error };
}