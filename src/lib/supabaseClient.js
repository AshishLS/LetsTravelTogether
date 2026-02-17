import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase environment variables are not configured.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'dsn-admin-2026';
