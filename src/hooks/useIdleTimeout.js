// src/hooks/useIdleTimeout.js
import { useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function useIdleTimeout(timeoutMinutes = 30) {
  const supabase = useSupabaseClient();

  useEffect(() => {
    let timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        supabase.auth.signOut();
        alert('You have been logged out due to inactivity.');
      }, timeoutMinutes * 60 * 1000);
    };

    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];

    events.forEach((event) => window.addEventListener(event, resetTimeout));

    resetTimeout(); // Initialize timeout

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimeout));
      clearTimeout(timeout);
    };
  }, [supabase, timeoutMinutes]);
}