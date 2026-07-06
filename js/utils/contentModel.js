export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function validateQuestDraft(draft) {
  const errors = [];
  if (!draft?.identity?.title?.trim()) errors.push('Quest title is required.');
  if (!draft?.identity?.questType?.trim()) errors.push('Quest type is required.');
  if (!Array.isArray(draft?.assessments)) errors.push('Assessments must be an array.');
  return errors;
}

export function sanitizeQuestPatch(input = {}) {
  const output = {};
  const allowed = ['identity', 'presentation', 'sources', 'assessments', 'rubrics', 'rewards'];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(input, key)) output[key] = clone(input[key]);
  }
  return output;
}

export function createVersionSnapshot({ questId, versionNumber, content, changeNote, state = 'draft' }) {
  return {
    id: `qv-${questId}-${versionNumber}-${Math.random().toString(36).slice(2, 8)}`,
    questId,
    versionNumber,
    state,
    content: clone(content),
    changeNote: changeNote || '',
    createdAt: new Date().toISOString()
  };
}
