/**
 * Low-cost save adapter.
 * This version uses browser localStorage and does not require a database.
 * Replace these methods with Firebase, Supabase, an LMS API, or your own backend later
 * without rewriting the character-creation screens.
 */
export function createStorageAdapter(key) {
  return {
    load(fallback) {
      try {
        const saved = window.localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
      } catch (error) {
        console.warn('Republic Builder save could not be loaded.', error);
        return fallback;
      }
    },
    save(value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('Republic Builder save could not be written.', error);
      }
    },
    clear() {
      try { window.localStorage.removeItem(key); } catch (error) { console.warn('Republic Builder save could not be cleared.', error); }
    }
  };
}
