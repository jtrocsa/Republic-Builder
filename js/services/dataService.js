import { QUEST_BACKEND_CONFIG } from '../config/quest-backend.config.js';
import { MockDataService } from './mockDataService.js';
import { SupabaseDataService } from './supabaseDataService.js';

let cachedService = null;

export function createDataService(mode = QUEST_BACKEND_CONFIG.mode) {
  if (mode === 'supabase') {
    return new SupabaseDataService();
  }
  return new MockDataService();
}

export function getDataService() {
  if (!cachedService) {
    cachedService = createDataService();
  }
  return cachedService;
}

export function getDataModeLabel() {
  return QUEST_BACKEND_CONFIG.mode === 'supabase' ? 'Supabase' : 'Local Demo';
}
