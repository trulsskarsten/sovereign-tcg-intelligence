import { createClient } from "@supabase/supabase-js";

const getEnv = (name: string) => {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === 'production') {
    // In production, we want to know about missing variables immediately but safely
    console.warn(`[Supabase Config] Warning: ${name} is not defined.`);
  }
  return value || '';
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

// Client for use in the browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for use in server-side functions (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
