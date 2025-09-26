import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Global singleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get the singleton Supabase client instance
 * This prevents multiple GoTrueClient instances in the same browser context
 */
export function getSupabaseClient(): SupabaseClient {
  // Check if we already have an instance
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Create single instance for all operations (auth and data)
  supabaseInstance = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey,
    {
      auth: {
        persistSession: true, // Enable session persistence
        autoRefreshToken: true, // Enable auto refresh
        detectSessionInUrl: false, // Disable URL session detection
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'intelligem-supabase-auth' // Custom storage key to avoid conflicts
      }
    }
  );
  
  return supabaseInstance;
}

/**
 * Get the same client for auth operations (same as main client)
 */
export function getAuthClient(): SupabaseClient {
  return getSupabaseClient(); // Use same singleton instance
}