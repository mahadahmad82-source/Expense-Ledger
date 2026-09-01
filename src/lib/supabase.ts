import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialized Supabase Client
let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  const url = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
    localStorage.getItem('expensepk_supabase_url');

  const anonKey = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
    localStorage.getItem('expensepk_supabase_anon_key');

  if (url && anonKey) {
    try {
      clientInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
      return clientInstance;
    } catch (err) {
      console.warn('Supabase initialization failed:', err);
      return null;
    }
  }

  return null;
}

export function saveSupabaseConfig(url: string, key: string) {
  if (url && key) {
    localStorage.setItem('expensepk_supabase_url', url);
    localStorage.setItem('expensepk_supabase_anon_key', key);
    clientInstance = null; // force reload
    return getSupabaseClient();
  }
  return null;
}
