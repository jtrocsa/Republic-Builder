export const QUEST_ACCESS_MODES = Object.freeze({
  DRAFT: 'draft',
  HIDDEN: 'hidden',
  LOCKED: 'locked',
  SCHEDULED: 'scheduled',
  AVAILABLE: 'available',
  REVIEW_ONLY: 'review_only',
  ARCHIVED: 'archived'
});

export const UNIT_STATES = Object.freeze({
  DRAFT: 'draft',
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  REVIEW_ONLY: 'review_only',
  ARCHIVED: 'archived'
});

export function isQuestVisible(accessMode = QUEST_ACCESS_MODES.HIDDEN) {
  return accessMode !== QUEST_ACCESS_MODES.HIDDEN && accessMode !== QUEST_ACCESS_MODES.ARCHIVED && accessMode !== QUEST_ACCESS_MODES.DRAFT;
}

export function canStudentOpen(accessMode = QUEST_ACCESS_MODES.HIDDEN) {
  return accessMode === QUEST_ACCESS_MODES.AVAILABLE || accessMode === QUEST_ACCESS_MODES.REVIEW_ONLY;
}

export function canStudentSubmit(accessMode = QUEST_ACCESS_MODES.HIDDEN) {
  return accessMode === QUEST_ACCESS_MODES.AVAILABLE;
}

export function lockMessageForRule(rule = {}) {
  if (rule.noteToStudent) return rule.noteToStudent;
  if (rule.accessMode === QUEST_ACCESS_MODES.SCHEDULED && rule.unlockAt) {
    return `Unlocks ${new Date(rule.unlockAt).toLocaleString()}`;
  }
  if (rule.prerequisiteQuestIds?.length) {
    return 'Complete required prerequisite quest first.';
  }
  if (rule.accessMode === QUEST_ACCESS_MODES.REVIEW_ONLY) {
    return 'This quest is available for review only.';
  }
  return 'Your teacher has not released this quest yet.';
}
