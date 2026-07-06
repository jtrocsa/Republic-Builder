import { DEFAULT_PROGRESSION_CONFIG, validateProgressionConfig } from './quest-progression-config.js';
import { ALL_STARTER_BADGES, getBadgeById } from './quest-badge-data.js';
import { getStoreItemById } from './quest-store-data.js';

export const PROGRESSION_SCHEMA_VERSION = 1;

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createId(prefix = 'id') {
  const random = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${random}`;
}

function nowIso() {
  return new Date().toISOString();
}

function assertFiniteNonNegative(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative finite number.`);
  }
}

function normalizeProgress(progress) {
  const fallback = createDefaultStudentProgress(progress?.studentId || 'anonymous');
  const next = { ...fallback, ...deepClone(progress || {}) };
  next.completedQuestIds = Array.isArray(next.completedQuestIds) ? next.completedQuestIds : [];
  next.questCompletions = Array.isArray(next.questCompletions) ? next.questCompletions : [];
  next.assessmentResults = Array.isArray(next.assessmentResults) ? next.assessmentResults : [];
  next.transactions = Array.isArray(next.transactions) ? next.transactions : [];
  next.earnedBadgeIds = Array.isArray(next.earnedBadgeIds) ? next.earnedBadgeIds : [];
  next.inventoryItemIds = Array.isArray(next.inventoryItemIds) ? next.inventoryItemIds : [];
  next.badgeProgress = next.badgeProgress && typeof next.badgeProgress === 'object' ? next.badgeProgress : {};
  next.equipped = next.equipped && typeof next.equipped === 'object' ? next.equipped : {};
  next.totalXp = Number(next.totalXp) || 0;
  next.archiveTokens = Number(next.archiveTokens) || 0;
  return next;
}

export function createDefaultStudentProgress(studentId) {
  return {
    schemaVersion: PROGRESSION_SCHEMA_VERSION,
    studentId,
    totalXp: 0,
    archiveTokens: 0,
    completedQuestIds: [],
    questCompletions: [],
    assessmentResults: [],
    badgeProgress: {},
    earnedBadgeIds: [],
    inventoryItemIds: [],
    equipped: {},
    transactions: [],
    updatedAt: nowIso()
  };
}

export function getRawLevelFromXp(totalXp, config = DEFAULT_PROGRESSION_CONFIG) {
  assertFiniteNonNegative(totalXp, 'totalXp');
  const errors = validateProgressionConfig(config);
  if (errors.length) throw new Error(`Invalid progression config: ${errors.join(' ')}`);

  let current = config.levels[0];
  for (const level of config.levels) {
    if (totalXp >= level.cumulativeXp) current = level;
    else break;
  }
  return current;
}

export function getLevelState(progress, config = DEFAULT_PROGRESSION_CONFIG) {
  const normalized = normalizeProgress(progress);
  const rawLevel = getRawLevelFromXp(normalized.totalXp, config);
  const gate = config.masteryGate;
  const masteryBlocked = Boolean(
    gate?.enabled &&
    rawLevel.level >= gate.level &&
    !normalized.earnedBadgeIds.includes(gate.requiredBadgeId)
  );

  const displayLevel = masteryBlocked
    ? config.levels.find((item) => item.level === gate.level - 1) || rawLevel
    : rawLevel;
  const nextLevel = config.levels.find((item) => item.level === displayLevel.level + 1) || null;
  const barStartXp = displayLevel.cumulativeXp;
  const barEndXp = nextLevel ? nextLevel.cumulativeXp : displayLevel.cumulativeXp;
  const progressWithinLevel = nextLevel
    ? Math.max(0, Math.min(1, (normalized.totalXp - barStartXp) / (barEndXp - barStartXp)))
    : 1;

  return {
    level: displayLevel.level,
    title: displayLevel.title,
    rawLevel: rawLevel.level,
    totalXp: normalized.totalXp,
    nextLevel,
    progressWithinLevel,
    masteryBlocked,
    masteryMessage: masteryBlocked ? gate.message : null
  };
}

function appendTransaction(progress, transaction) {
  progress.transactions.push({
    id: createId('txn'),
    createdAt: nowIso(),
    ...transaction
  });
}

function addRewards(progress, { xp = 0, tokens = 0, reason, sourceType, sourceId }) {
  assertFiniteNonNegative(xp, 'xp');
  assertFiniteNonNegative(tokens, 'tokens');
  if (xp === 0 && tokens === 0) return;
  progress.totalXp += xp;
  progress.archiveTokens += tokens;
  appendTransaction(progress, { type: 'earn', amount: tokens, xpAmount: xp, reason, sourceType, sourceId });
}

function ensureBadgeProgress(progress, badgeId) {
  if (!progress.badgeProgress[badgeId]) {
    progress.badgeProgress[badgeId] = { metrics: {}, tier: null, awardedTiers: [], updatedAt: nowIso() };
  }
  return progress.badgeProgress[badgeId];
}

function evaluateCondition(metrics, condition) {
  const current = Number(metrics?.[condition.metric] || 0);
  switch (condition.operator) {
    case '>=': return current >= Number(condition.value);
    case '>': return current > Number(condition.value);
    case '===': return current === Number(condition.value);
    case '<=': return current <= Number(condition.value);
    case '<': return current < Number(condition.value);
    default: throw new Error(`Unsupported badge condition operator: ${condition.operator}`);
  }
}

function evaluateTieredBadge(progress, badge, config) {
  const state = ensureBadgeProgress(progress, badge.id);
  const awarded = [];
  const tiers = badge.tiers || [];

  // A student who meets a higher tier directly should receive the visual and reward
  // history for the lower tiers. This prevents a Gold result from showing a blank
  // Bronze/Silver path simply because the lower criteria used repeated-practice counts.
  const highestQualifiedIndex = tiers.reduce((highest, tier, index) => {
    const qualifies = (tier.conditions || []).every((condition) => evaluateCondition(state.metrics, condition));
    return qualifies ? index : highest;
  }, -1);

  if (highestQualifiedIndex < 0) {
    state.updatedAt = nowIso();
    return awarded;
  }

  for (let index = 0; index <= highestQualifiedIndex; index += 1) {
    const tier = tiers[index];
    if (state.awardedTiers.includes(tier.id)) continue;
    const reward = config.rewardPresets[tier.rewardPreset];
    if (!reward) throw new Error(`Missing reward preset: ${tier.rewardPreset}`);
    state.awardedTiers.push(tier.id);
    addRewards(progress, {
      xp: reward.xp,
      tokens: reward.tokens,
      reason: `${badge.name} — ${tier.label} unlocked`,
      sourceType: 'badge',
      sourceId: `${badge.id}:${tier.id}`
    });
    awarded.push({ badgeId: badge.id, tierId: tier.id, reward });
  }

  state.tier = tiers[highestQualifiedIndex].id;
  state.updatedAt = nowIso();
  return awarded;
}

function evaluateUnitBadge(progress, badge, config) {
  if (progress.earnedBadgeIds.includes(badge.id)) return null;
  const complete = (badge.prerequisites || []).every((questId) => progress.completedQuestIds.includes(questId));
  if (!complete) return null;
  const reward = config.rewardPresets[badge.rewardPreset];
  if (!reward) throw new Error(`Missing reward preset: ${badge.rewardPreset}`);
  progress.earnedBadgeIds.push(badge.id);
  addRewards(progress, {
    xp: reward.xp,
    tokens: reward.tokens,
    reason: `${badge.name} earned`,
    sourceType: 'badge',
    sourceId: badge.id
  });
  return { badgeId: badge.id, reward };
}

function evaluateMasterSeal(progress, badge, config) {
  if (progress.earnedBadgeIds.includes(badge.id)) return null;
  const earnedCount = (badge.requiredBadgeIds || []).filter((badgeId) => progress.earnedBadgeIds.includes(badgeId)).length;
  if (earnedCount < badge.requiredCount) return null;
  const reward = config.rewardPresets[badge.rewardPreset];
  if (!reward) throw new Error(`Missing reward preset: ${badge.rewardPreset}`);
  progress.earnedBadgeIds.push(badge.id);
  addRewards(progress, {
    xp: reward.xp,
    tokens: reward.tokens,
    reason: `${badge.name} earned`,
    sourceType: 'badge',
    sourceId: badge.id
  });
  return { badgeId: badge.id, reward };
}

export function evaluateAllBadges(progress, { badges = ALL_STARTER_BADGES, config = DEFAULT_PROGRESSION_CONFIG } = {}) {
  const next = normalizeProgress(progress);
  const awards = [];

  // General badges first. They may earn tier rewards after quest metrics are applied.
  for (const badge of badges.filter((item) => item.type === 'tiered')) {
    awards.push(...evaluateTieredBadge(next, badge, config));
  }
  // Unit collection badges second.
  for (const badge of badges.filter((item) => item.type === 'collection')) {
    const result = evaluateUnitBadge(next, badge, config);
    if (result) awards.push(result);
  }
  // Master seals last, because they depend on collection badges.
  for (const badge of badges.filter((item) => item.type === 'master-seal')) {
    const result = evaluateMasterSeal(next, badge, config);
    if (result) awards.push(result);
  }

  next.updatedAt = nowIso();
  return { progress: next, awards };
}

/**
 * Completes a quest once and applies rewards. For replayable activities, set
 * replayRewardPolicy to "repeat_xp_only" or "repeat_full_reward" intentionally.
 */
export function awardQuestCompletion(progress, quest, {
  badges = ALL_STARTER_BADGES,
  config = DEFAULT_PROGRESSION_CONFIG,
  completionMetadata = {}
} = {}) {
  if (!quest?.id) throw new Error('Quest completion requires a quest with an id.');
  const next = normalizeProgress(progress);
  const alreadyCompleted = next.completedQuestIds.includes(quest.id);
  const replayPolicy = quest.replayRewardPolicy || 'first_completion_only';

  if (alreadyCompleted && replayPolicy === 'first_completion_only') {
    return { progress: next, awarded: false, reason: 'already_completed', badgeAwards: [] };
  }

  const xp = Number(quest.xpReward || 0);
  const tokens = replayPolicy === 'repeat_xp_only' && alreadyCompleted ? 0 : Number(quest.tokenReward || 0);
  assertFiniteNonNegative(xp, 'quest.xpReward');
  assertFiniteNonNegative(tokens, 'quest.tokenReward');

  if (!alreadyCompleted) next.completedQuestIds.push(quest.id);
  next.questCompletions.push({
    id: createId('quest_completion'),
    questId: quest.id,
    unitId: quest.unitId || null,
    completedAt: nowIso(),
    replay: alreadyCompleted,
    metadata: completionMetadata
  });

  addRewards(next, {
    xp,
    tokens,
    reason: `${quest.activityType || 'Quest'}: ${quest.title || quest.id}`,
    sourceType: 'quest',
    sourceId: quest.id
  });

  for (const link of quest.badgeLinks || []) {
    const badge = getBadgeById(link.badgeId, badges);
    if (!badge || !link.metric) continue;
    const state = ensureBadgeProgress(next, link.badgeId);
    state.metrics[link.metric] = Number(state.metrics[link.metric] || 0) + Number(link.amount ?? 1);
    state.updatedAt = nowIso();
  }

  const evaluation = evaluateAllBadges(next, { badges, config });
  return { progress: evaluation.progress, awarded: true, reason: null, badgeAwards: evaluation.awards };
}

/**
 * Records a scored assessment result and updates standard metrics for starter badges.
 * Custom teacher metrics can be added through metricOverrides.
 */
export function recordAssessmentResult(progress, result, {
  badges = ALL_STARTER_BADGES,
  config = DEFAULT_PROGRESSION_CONFIG,
  metricOverrides = {}
} = {}) {
  if (!result?.assessmentType) throw new Error('Assessment result requires assessmentType.');
  assertFiniteNonNegative(Number(result.earnedPoints), 'result.earnedPoints');
  assertFiniteNonNegative(Number(result.possiblePoints), 'result.possiblePoints');
  if (Number(result.possiblePoints) <= 0) throw new Error('result.possiblePoints must be greater than zero.');

  const next = normalizeProgress(progress);
  const percent = Number.isFinite(result.percent)
    ? Number(result.percent)
    : (Number(result.earnedPoints) / Number(result.possiblePoints)) * 100;
  const recorded = {
    id: result.id || createId('assessment'),
    questId: result.questId || null,
    assessmentType: String(result.assessmentType).toUpperCase(),
    earnedPoints: Number(result.earnedPoints),
    possiblePoints: Number(result.possiblePoints),
    percent: Number(percent.toFixed(2)),
    unitId: result.unitId || null,
    submittedAt: result.submittedAt || nowIso(),
    isRevision: Boolean(result.isRevision),
    metadata: result.metadata || {}
  };
  next.assessmentResults.push(recorded);

  const increment = (badgeId, metric, amount = 1) => {
    const state = ensureBadgeProgress(next, badgeId);
    state.metrics[metric] = Number(state.metrics[metric] || 0) + amount;
    state.updatedAt = nowIso();
  };

  if (recorded.assessmentType === 'MCQ') {
    const isQualifying = recorded.metadata.questionCount ? Number(recorded.metadata.questionCount) >= 8 : true;
    const isUnitLength = Boolean(recorded.metadata.isUnitLength || recorded.metadata.isCumulative);
    if (isQualifying && recorded.percent >= 60) increment('mcq-mastery', 'mcqSetsAt60');
    if (isQualifying && recorded.percent >= 70) increment('mcq-mastery', 'mcqSetsAt70');
    if (isQualifying && isUnitLength && recorded.percent >= 85) increment('mcq-mastery', 'mcqSetsAt85UnitLength');
  }
  if (recorded.assessmentType === 'SAQ') {
    if (recorded.possiblePoints === 3 && recorded.earnedPoints >= 2) increment('saq-mastery', 'saqAtTwoOfThree');
    if (recorded.possiblePoints === 3 && recorded.earnedPoints >= 3) increment('saq-mastery', 'saqAtThreeOfThree');
    if (recorded.metadata.goldEvidence) increment('saq-mastery', 'saqGoldEvidence');
  }
  if (recorded.assessmentType === 'DBQ') {
    if (recorded.possiblePoints === 7 && recorded.earnedPoints >= 3) increment('dbq-mastery', 'dbqAtThreeOfSeven');
    if (recorded.possiblePoints === 7 && recorded.earnedPoints >= 5) increment('dbq-mastery', 'dbqAtFiveOfSeven');
    if (recorded.possiblePoints === 7 && recorded.earnedPoints >= 6) increment('dbq-mastery', 'dbqGoldEvidence');
    if (recorded.isRevision && recorded.metadata.improvedFromPoints === 5 && recorded.earnedPoints >= 6) increment('dbq-mastery', 'dbqGoldEvidence');
  }
  if (recorded.assessmentType === 'LEQ') {
    if (recorded.possiblePoints === 6 && recorded.earnedPoints >= 3) increment('leq-mastery', 'leqAtThreeOfSix');
    if (recorded.possiblePoints === 6 && recorded.earnedPoints >= 4) increment('leq-mastery', 'leqAtFourOfSix');
    if (recorded.possiblePoints === 6 && recorded.earnedPoints >= 5) increment('leq-mastery', 'leqGoldEvidence');
    if (recorded.metadata.goldEvidence) increment('leq-mastery', 'leqGoldEvidence');
  }
  if (recorded.assessmentType === 'VOCAB') {
    if (recorded.percent >= 70) increment('vocabulary-mastery', 'vocabSetsAt70');
    if (recorded.percent >= 80) increment('vocabulary-mastery', 'vocabSetsAt80');
    if (recorded.percent >= 90) increment('vocabulary-mastery', 'vocabSetsAt90');
  }
  if (recorded.assessmentType === 'TIMELINE') {
    increment('timeline-mastery', 'timelineTasksCompleted');
    if (recorded.percent >= 80) increment('timeline-mastery', 'timelineSetsAt80');
    if (recorded.percent >= 90) increment('timeline-mastery', 'timelineGoldEvidence');
  }
  if (recorded.assessmentType === 'HIPP') {
    if (Number(recorded.metadata.criteriaMet || 0) >= 3) increment('hipp-mastery', 'hippAtThreeOfFour');
    if (recorded.metadata.appliedInWriting) increment('hipp-mastery', 'appliedSourcingInWriting');
  }
  if (recorded.assessmentType === 'REVISION') {
    increment('revision-mastery', 'verifiedRevisions');
    if (Number(recorded.metadata.rubricPointImprovement || 0) >= 1) increment('revision-mastery', 'revisionOnePointImprovements');
    if (Number(recorded.metadata.rubricPointImprovement || 0) >= 2 && recorded.metadata.hasReflection) increment('revision-mastery', 'revisionGoldEvidence');
  }

  for (const [badgeId, metrics] of Object.entries(metricOverrides || {})) {
    for (const [metric, amount] of Object.entries(metrics || {})) {
      increment(badgeId, metric, Number(amount));
    }
  }

  const evaluation = evaluateAllBadges(next, { badges, config });
  return { progress: evaluation.progress, result: recorded, badgeAwards: evaluation.awards };
}

export function getBadgeVisualState(progress, badge) {
  const normalized = normalizeProgress(progress);
  if (badge.type === 'tiered') {
    const state = normalized.badgeProgress[badge.id];
    if (!state) return { status: 'locked', tier: null, metrics: {} };
    const highestTierIndex = (badge.tiers || []).findIndex((tier) => tier.id === state.tier);
    if (highestTierIndex === (badge.tiers || []).length - 1 && state.tier) {
      return { status: 'gold', tier: state.tier, metrics: state.metrics || {} };
    }
    return { status: state.tier ? 'earned' : 'active', tier: state.tier || null, metrics: state.metrics || {} };
  }
  return normalized.earnedBadgeIds.includes(badge.id)
    ? { status: 'earned', tier: null, metrics: {} }
    : { status: 'locked', tier: null, metrics: {} };
}

export function spendArchiveTokens(progress, itemId, {
  storeItems,
  reason = null
} = {}) {
  const next = normalizeProgress(progress);
  const item = getStoreItemById(itemId, storeItems);
  if (!item) throw new Error(`Store item not found: ${itemId}`);
  if (next.inventoryItemIds.includes(item.id)) {
    return { progress: next, purchased: false, reason: 'already_owned', item };
  }
  if (item.requiresBadgeId && !next.earnedBadgeIds.includes(item.requiresBadgeId)) {
    return { progress: next, purchased: false, reason: 'badge_required', item };
  }
  if (next.archiveTokens < item.price) {
    return { progress: next, purchased: false, reason: 'insufficient_tokens', item };
  }

  next.archiveTokens -= item.price;
  next.inventoryItemIds.push(item.id);
  appendTransaction(next, {
    type: 'spend',
    amount: -item.price,
    xpAmount: 0,
    reason: reason || `Purchased ${item.name}`,
    sourceType: 'store_item',
    sourceId: item.id
  });
  next.updatedAt = nowIso();
  return { progress: next, purchased: true, reason: null, item };
}

export function grantTeacherReward(progress, { xp = 0, tokens = 0, reason }) {
  if (!reason?.trim()) throw new Error('Teacher rewards require a reason.');
  const next = normalizeProgress(progress);
  addRewards(next, { xp, tokens, reason: reason.trim(), sourceType: 'teacher_award', sourceId: null });
  next.updatedAt = nowIso();
  return next;
}

export function refundArchiveTokens(progress, { tokens, reason, sourceId = null }) {
  if (!reason?.trim()) throw new Error('Refunds require a reason.');
  assertFiniteNonNegative(tokens, 'tokens');
  const next = normalizeProgress(progress);
  next.archiveTokens += tokens;
  appendTransaction(next, { type: 'refund', amount: tokens, xpAmount: 0, reason: reason.trim(), sourceType: 'refund', sourceId });
  next.updatedAt = nowIso();
  return next;
}

const LOCAL_STORAGE_PREFIX = 'apushQuestProgress';

export const localProgressStorage = {
  get(studentId) {
    try {
      const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}:${studentId}`);
      return raw ? normalizeProgress(JSON.parse(raw)) : createDefaultStudentProgress(studentId);
    } catch (error) {
      console.error('Unable to load local quest progress.', error);
      return createDefaultStudentProgress(studentId);
    }
  },
  save(studentId, progress) {
    try {
      const normalized = normalizeProgress(progress);
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}:${studentId}`, JSON.stringify(normalized));
      return normalized;
    } catch (error) {
      console.error('Unable to save local quest progress.', error);
      throw new Error('Progress could not be saved locally. Check storage permissions or available space.');
    }
  }
};
