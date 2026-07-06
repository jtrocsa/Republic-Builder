export const QUEST_ACCESS_MODES = Object.freeze({
  HIDDEN: 'hidden',
  VISIBLE_LOCKED: 'visible_locked',
  SCHEDULED: 'scheduled',
  AVAILABLE: 'available',
  REVIEW_ONLY: 'review_only',
  ARCHIVED: 'archived',
});

export const UNIT_STATES = Object.freeze({
  DRAFT: 'draft',
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  REVIEW_ONLY: 'review_only',
  ARCHIVED: 'archived',
});

export function canRenderQuestCard(access) {
  return Boolean(access?.canSee ?? access?.can_see);
}

export function canOpenQuest(access) {
  return Boolean(access?.canOpen ?? access?.can_open);
}

export function canSubmitQuest(access) {
  return Boolean(access?.canSubmit ?? access?.can_submit);
}

export function getQuestLockMessage(access) {
  const mode = access?.accessMode ?? access?.access_mode;
  const note = access?.noteToStudent ?? access?.note_to_student;
  if (note) return note;

  switch (mode) {
    case QUEST_ACCESS_MODES.VISIBLE_LOCKED:
      return 'This quest is locked.';
    case QUEST_ACCESS_MODES.SCHEDULED:
      return 'This quest unlocks later.';
    case QUEST_ACCESS_MODES.REVIEW_ONLY:
      return 'This quest is available for review only.';
    default:
      return '';
  }
}

export function getAccessBadgeLabel(mode) {
  return {
    hidden: 'Hidden',
    visible_locked: 'Locked',
    scheduled: 'Scheduled',
    available: 'Available',
    review_only: 'Review Only',
    archived: 'Archived',
  }[mode] ?? 'Unknown';
}
