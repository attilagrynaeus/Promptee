import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from 'supabaseClient';
import PromptApp from 'PromptApp';
import { DialogProvider } from 'context/DialogContext';
import { UIProvider } from 'context/UIContext';

export default function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <UIProvider>
        <DialogProvider>
          <PromptApp />
        </DialogProvider>
      </UIProvider>
    </SessionContextProvider>
  );
}