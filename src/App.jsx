import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from './supabaseClient';
import PromptApp from './PromptApp';

export default function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <PromptApp />
    </SessionContextProvider>
  );
}