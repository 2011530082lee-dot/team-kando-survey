import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('Supabase environment variables are not set.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabasePublishableKey || 'sb_publishable_placeholder');
