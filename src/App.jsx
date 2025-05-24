import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from './supabaseClient';
import PromptApp from './PromptApp';
import { DialogProvider } from './context/DialogContext';

export default function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <DialogProvider>
        <PromptApp />
      </DialogProvider>
    </SessionContextProvider>
  );
}