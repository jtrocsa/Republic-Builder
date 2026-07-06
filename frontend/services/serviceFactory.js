import { QUEST_BACKEND_CONFIG } from '../config/quest-backend.config.js';
import { MockDataService } from './mockDataService.js';
import { SupabaseDataService } from './supabaseDataService.js';

/**
 * Pass a Supabase client created by the host application when using live mode.
 * Example with an ESM CDN:
 *   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
 *   const client = createClient(config.supabaseUrl, config.supabaseAnonKey);
 */
export function createDataService({ supabaseClient = null } = {}) {
  const hasLiveConfig = Boolean(
    QUEST_BACKEND_CONFIG.mode === 'supabase'
    && QUEST_BACKEND_CONFIG.supabaseUrl
    && QUEST_BACKEND_CONFIG.supabaseAnonKey
  );

  if (hasLiveConfig) {
    if (!supabaseClient) throw new Error('Supabase mode is configured but no client was provided.');
    return new SupabaseDataService(supabaseClient);
  }

  return new MockDataService();
}
