import { useEffect, useCallback, useRef } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useDialog } from '../context/DialogContext';
import { t } from '../i18n';

export default function useIdleTimeout(timeoutMinutes = 30) {
  const supabase = useSupabaseClient();
  const { showDialog, hideDialog } = useDialog();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleLogout = useCallback(async () => {
    clear();
    await supabase.auth.signOut();
    showDialog({
      title: t('IdleTimeout.ExpiredTitle'),
      message: t('IdleTimeout.ExpiredMsg'),
      confirmText: t('IdleTimeout.OK'),
      onConfirm: hideDialog,
    });
  }, [supabase, showDialog, hideDialog]);

  const resetTimeout = useCallback(() => {
    clear();
    timeoutRef.current = setTimeout(handleLogout, timeoutMinutes * 60 * 1000);
  }, [handleLogout, timeoutMinutes]);

  useEffect(() => {
    const events = [
      'mousemove', 'mousedown', 'keydown',
      'touchstart', 'touchmove', 'scroll', 'visibilitychange'
    ];
    events.forEach(e => window.addEventListener(e, resetTimeout));
    resetTimeout();               // start on mount

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimeout));
      clear();
    };
  }, [resetTimeout]);
}