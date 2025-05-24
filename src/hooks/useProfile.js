import { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

export default function useProfile() {
  const [profile, setProfile] = useState(null);
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (session) fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!error) setProfile(data);
    else console.error("Profile fetch error:", error);
  };

  return profile;
}