/**
 * Default, teacher-editable progression configuration.
 * Keep these numbers in one configuration source. UI components should never hard-code them.
 */
export const DEFAULT_LEVELS = [
  { level: 1, title: 'Apprentice Historian', cumulativeXp: 0 },
  { level: 2, title: 'Apprentice Historian', cumulativeXp: 75 },
  { level: 3, title: 'Apprentice Historian', cumulativeXp: 175 },
  { level: 4, title: 'Apprentice Historian', cumulativeXp: 300 },
  { level: 5, title: 'Developing Historian', cumulativeXp: 450 },
  { level: 6, title: 'Developing Historian', cumulativeXp: 625 },
  { level: 7, title: 'Developing Historian', cumulativeXp: 825 },
  { level: 8, title: 'Developing Historian', cumulativeXp: 1050 },
  { level: 9, title: 'Capable Historian', cumulativeXp: 1300 },
  { level: 10, title: 'Capable Historian', cumulativeXp: 1575 },
  { level: 11, title: 'Capable Historian', cumulativeXp: 1875 },
  { level: 12, title: 'Capable Historian', cumulativeXp: 2200 },
  { level: 13, title: 'Accomplished Historian', cumulativeXp: 2550 },
  { level: 14, title: 'Accomplished Historian', cumulativeXp: 2925 },
  { level: 15, title: 'Accomplished Historian', cumulativeXp: 3325 },
  { level: 16, title: 'Accomplished Historian', cumulativeXp: 3750 },
  { level: 17, title: 'Senior Historian', cumulativeXp: 4200 },
  { level: 18, title: 'Senior Historian', cumulativeXp: 4675 },
  { level: 19, title: 'Senior Historian', cumulativeXp: 5175 },
  { level: 20, title: 'Master Historian', cumulativeXp: 5700 }
];

export const DEFAULT_REWARD_PRESETS = Object.freeze({
  warmup: { label: 'Warm-up / Check-in', xp: 10, tokens: 1 },
  practice: { label: 'Practice Activity', xp: 20, tokens: 2 },
  core: { label: 'Core Quest', xp: 30, tokens: 3 },
  major: { label: 'Major Task', xp: 45, tokens: 4 },
  boss: { label: 'Boss Battle', xp: 60, tokens: 6 },
  revision: { label: 'Revision Task', xp: 35, tokens: 3 },
  optional: { label: 'Optional Review', xp: 15, tokens: 1 },
  badgeBronze: { label: 'Bronze Badge', xp: 40, tokens: 5 },
  badgeSilver: { label: 'Silver Badge', xp: 60, tokens: 8 },
  badgeGold: { label: 'Gold Badge', xp: 80, tokens: 12 },
  unitBadge: { label: 'Unit Badge', xp: 25, tokens: 3 },
  unitSeal: { label: 'Unit Master Seal', xp: 60, tokens: 8 }
});

export const DEFAULT_ECONOMY_GUARDRAILS = Object.freeze({
  recommendedQuestTokenMax: 6,
  absoluteQuestTokenMax: 10,
  recommendedQuestXpMax: 60,
  absoluteQuestXpMax: 100,
  targetTokensPerUnit: { min: 38, max: 65 },
  targetYearEndTokens: { min: 350, max: 550 },
  recommendedStorePrice: { min: 4, max: 99 }
});

export const DEFAULT_PROGRESSION_CONFIG = Object.freeze({
  schemaVersion: 1,
  currency: {
    name: 'Archive Tokens',
    singularName: 'Archive Token',
    iconPath: 'assets/badges/ui/archive-token.svg'
  },
  levels: DEFAULT_LEVELS,
  rewardPresets: DEFAULT_REWARD_PRESETS,
  economyGuardrails: DEFAULT_ECONOMY_GUARDRAILS,
  masteryGate: {
    enabled: true,
    level: 20,
    requiredBadgeId: 'unit-9-master-seal',
    message: 'Master Historian is unlocked after earning the Unit 9 Master Seal.'
  },
  unitXpTargets: {
    'unit-1': 500,
    'unit-2': 550,
    'unit-3': 600,
    'unit-4': 600,
    'unit-5': 650,
    'unit-6': 650,
    'unit-7': 700,
    'unit-8': 700,
    'unit-9': 800
  }
});

/**
 * Validates the parts of a progression configuration that can break level calculations.
 * Returns a list of human-readable errors so the teacher dashboard can display them.
 */
export function validateProgressionConfig(config) {
  const errors = [];
  if (!config || !Array.isArray(config.levels)) {
    return ['Configuration must include a levels array.'];
  }
  if (config.levels.length !== 20) {
    errors.push('The default game design expects exactly 20 levels.');
  }

  let previousXp = -1;
  config.levels.forEach((level, index) => {
    if (!Number.isInteger(level.level) || level.level !== index + 1) {
      errors.push(`Level row ${index + 1} must be numbered ${index + 1}.`);
    }
    if (!Number.isFinite(level.cumulativeXp) || level.cumulativeXp < 0) {
      errors.push(`Level ${index + 1} needs a non-negative cumulative XP value.`);
    }
    if (level.cumulativeXp <= previousXp && index > 0) {
      errors.push(`Level ${index + 1} must require more XP than Level ${index}.`);
    }
    previousXp = level.cumulativeXp;
  });

  return errors;
}
