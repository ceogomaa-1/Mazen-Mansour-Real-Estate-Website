export const environment = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

export const isSupabaseConfigured = Boolean(environment.supabaseUrl && environment.supabaseAnonKey);
