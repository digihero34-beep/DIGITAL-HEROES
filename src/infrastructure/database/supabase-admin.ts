import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

/**
 * Privileged administrative client bypassing Row-Level Security.
 * Must NEVER be used directly in client-facing components.
 */
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
