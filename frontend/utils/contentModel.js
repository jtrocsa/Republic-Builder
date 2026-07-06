/**
 * Minimal client-side shape validation. Database rules remain authoritative.
 * Keep this intentionally small so the editor can show friendly errors before save.
 */

export function validateQuestContent(content) {
  const errors = [];
  if (!content || typeof content !== 'object') {
    return ['Quest content is required.'];
  }

  if (!Number.isInteger(content.schemaVersion)) {
    errors.push('schemaVersion must be an integer.');
  }

  const identity = content.identity ?? {};
  if (!identity.title?.trim()) errors.push('Quest title is required.');
  if (!identity.questType?.trim()) errors.push('Quest type is required.');

  const assessments = Array.isArray(content.assessments) ? content.assessments : [];
  const ids = new Set();
  for (const assessment of assessments) {
    if (!assessment.id) errors.push('Every assessment requires an id.');
    if (ids.has(assessment.id)) errors.push(`Duplicate assessment id: ${assessment.id}`);
    ids.add(assessment.id);

    const questionIds = new Set();
    for (const question of assessment.questions ?? []) {
      if (!question.id) errors.push(`Question without an id in ${assessment.id}.`);
      if (questionIds.has(question.id)) errors.push(`Duplicate question id: ${question.id}`);
      questionIds.add(question.id);
      if (!question.prompt?.trim()) errors.push(`Question ${question.id || '(unnamed)'} needs a prompt.`);
      if (!Number.isFinite(question.maxPoints)) errors.push(`Question ${question.id || '(unnamed)'} needs maxPoints.`);
    }
  }

  return errors;
}

export function makeEmptyQuestContent({ title = 'Untitled Quest', questType = 'evidence' } = {}) {
  return {
    schemaVersion: 1,
    identity: {
      title,
      subtitle: '',
      questType,
      xpReward: 0,
      location: '',
      mapMarker: { x: 50, y: 50, icon: 'quest', label: title },
    },
    presentation: { heroKicker: '', heroDescription: '', theme: 'standard' },
    sources: [],
    assessments: [],
    rubrics: {},
    rewards: { xp: 0, items: [], historianSkillAwards: [] },
  };
}
