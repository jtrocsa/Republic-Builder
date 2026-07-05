/*
  REPUBLIC BUILDER — SAVE ADAPTER
  ------------------------------------------------------------------
  The interface below is the only persistence dependency used by app.js.
  It currently saves to one browser with localStorage. To add cross-device
  accounts later, replace the functions in this file with a secure remote
  adapter while keeping the rest of the game untouched.

  Do not store passwords, school IDs, grades, or sensitive student data in
  localStorage. This starter only stores demo progress and character choices.
*/

window.RepublicBuilderStorage = {
  load(key) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  save(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  clear(key) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};
