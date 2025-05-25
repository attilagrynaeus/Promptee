import { useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useDialog } from '../context/DialogContext';

export default function useIdleTimeout(timeoutMinutes = 30) {
  const supabase = useSupabaseClient();
  const { showDialog, hideDialog } = useDialog();

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    showDialog({
      title: 'Session Expired',
      message: 'You have been logged out due to inactivity.',
      confirmText: 'OK',
      onConfirm: hideDialog,
    });
  }, [supabase, showDialog, hideDialog]);

  useEffect(() => {
    let timeoutId;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleLogout, timeoutMinutes * 60 * 1000);
    };

    const activityEvents = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];

    activityEvents.forEach((event) => window.addEventListener(event, resetTimeout));
    resetTimeout();

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimeout));
      clearTimeout(timeoutId);
    };
  }, [handleLogout, timeoutMinutes]);
}