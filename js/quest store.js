const KEY = 'republicBuilder.unit1QuestState.v1';

const defaultState = {
  xp: 340,
  completed: {},
  attempts: {},
  inventory: [
    { name: 'Founder’s Compass', note: 'A symbol of beginning the expedition.' },
    { name: 'Archive Seal', note: 'Earned for opening the Unit 1 field archive.' },
    { name: 'Mapmaker’s Pin', note: 'Earned for your first evidence quest.' }
  ],
  skills: {},
  teacherMode: false,
  dispatch: null
};

export function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    return { ...defaultState, ...(stored || {}), completed: { ...(stored?.completed || {}) }, attempts: { ...(stored?.attempts || {}) }, skills: { ...(stored?.skills || {}) } };
  } catch {
    return structuredClone(defaultState);
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(KEY);
  return loadState();
}
