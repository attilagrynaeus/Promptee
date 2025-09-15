import { createClient } from '@supabase/supabase-js';

// Fallback to process.env to remain compatible with Jest.
// TODO: ensure environment variables are provided in production builds.
const url = (typeof process !== 'undefined' && process.env.VITE_SUPABASE_URL) || 'http://localhost';
const anon = (typeof process !== 'undefined' && process.env.VITE_SUPABASE_ANON) || 'public-anon-key';

export const supabase = createClient(url, anon);
