/**
 * Badge catalog. IDs are permanent keys; visible names and descriptions are safe to edit.
 * Thresholds are defaults, not a grading system. Teachers can adjust them in the dashboard.
 */
export const GENERAL_BADGES = [
  {
    id: 'mcq-mastery', category: 'assessment', type: 'tiered',
    name: 'MCQ Mastery Badge', shortName: 'MCQ Mastery',
    assetPath: 'assets/badges/general/mcq-mastery.svg',
    description: 'Demonstrates growing confidence with AP-style multiple-choice source and evidence questions.',
    unlockMessage: 'Complete one qualifying MCQ Challenge to begin.',
    metricLabel: 'qualifying MCQ sets',
    tiers: [
      { id: 'bronze', label: 'Bronze', rewardPreset: 'badgeBronze', criteriaText: 'Complete 1 qualifying MCQ set at 60% or higher.', conditions: [{ metric: 'mcqSetsAt60', operator: '>=', value: 1 }] },
      { id: 'silver', label: 'Silver', rewardPreset: 'badgeSilver', criteriaText: 'Complete 3 qualifying MCQ sets at 70% or higher.', conditions: [{ metric: 'mcqSetsAt70', operator: '>=', value: 3 }] },
      { id: 'gold', label: 'Gold', rewardPreset: 'badgeGold', criteriaText: 'Earn 85% or higher on a unit-length or cumulative MCQ set.', conditions: [{ metric: 'mcqSetsAt85UnitLength', operator: '>=', value: 1 }] }
    ]
  },
  {
    id: 'hipp-mastery', category: 'assessment', type: 'tiered',
    name: 'HIPP Mastery Badge', shortName: 'HIPP Mastery',
    assetPath: 'assets/badges/general/hipp-mastery.svg',
    description: 'Shows growing ability to analyze historical situation, intended audience, purpose, and point of view.',
    unlockMessage: 'Complete one HIPP Source Analysis to begin.',
    metricLabel: 'successful HIPP analyses',
    tiers: [
      { id: 'bronze', label: 'Bronze', rewardPreset: 'badgeBronze', criteriaText: 'Complete 2 source analyses meeting at least 3 of 4 HIPP criteria.', conditions: [{ metric: 'hippAtThreeOfFour', operator: '>=', value: 2 }] },
      { id: 'silver', label: 'Silver', rewardPreset: 'badgeSilver', criteriaText: 'Complete 5 source analyses meeting at least 3 of 4 HIPP criteria.', conditions: [{ metric: 'hippAtThreeOfFour', operator: '>=', value: 5 }] },
      { id: 'gold', label: 'Gold', rewardPreset: 'badgeGold', criteriaText: 'Apply sourcing effectively in a DBQ or teacher-approved assessed writing task.', conditions: [{ metric: 'appliedSourcingInWriting', operator: '>=', value: 1 }] }
    ]
  },
  {
    id: 'saq-mastery', category: 'assessment', type: 'tiered',
    name: 'SAQ Mastery Badge', shortName: 'SAQ Mastery',
    assetPath: 'assets/badges/general/saq-mastery.svg',
    description: 'Tracks evidence of short-answer writing practice using AP-style scoring expectations.',
    unlockMessage: 'Submit one scored SAQ to begin.', metricLabel: 'SAQ results',
    tiers: [
      { id: 'bronze', label: 'Bronze', rewardPreset: 'badgeBronze', criteriaText: 'Earn 2/3 or higher on one SAQ.', conditions: [{ metric: 'saqAtTwoOfThree', operator: '>=', value: 1 }] },
      { id: 'silver', label: 'Silver', rewardPreset: 'badgeSilver', criteriaText: 'Earn 3/3 on two SAQs.', conditions: [{ metric: 'saqAtThreeOfThree', operator: '>=', value: 2 }] },
      { id: 'gold', label: 'Gold', rewardPreset: 'badgeGold', criteriaText: 'Earn 3/3 on three SAQs across different units, or complete a teacher-approved revision pathway.', conditions: [{ metric: 'saqGoldEvidence', operator: '>=', value: 1 }] }
    ]
  },
  {
    id: 'dbq-mastery', category: 'assessment', type: 'tiered',
    name: 'DBQ Mastery Badge', shortName: 'DBQ Mastery',
    assetPath: 'assets/badges/general/dbq-mastery.svg',
    description: 'Tracks growth on full AP-style Document-Based Questions.',
    unlockMessage: 'Complete one DBQ Writing Challenge to begin.', metricLabel: 'DBQ results',
    tiers: [
      { id: 'bronze', label: 'Bronze', rewardPreset: 'badgeBronze', criteriaText: 'Earn 3/7 or higher on a complete DBQ.', conditions: [{ metric: 'dbqAtThreeOfSeven', operator: '>=', value: 1 }] },
      { id: 'silver', label: 'Silver', rewardPreset: 'badgeSilver', criteriaText: 'Earn 5/7 or higher on a complete DBQ.', conditions: [{ metric: 'dbqAtFiveOfSeven', operator: '>=', value: 1 }] },
      { id: 'gold', label: 'Gold', rewardPreset: 'badgeGold', criteriaText: 'Earn 6/7 or higher, or revise a 5/7 DBQ into a 6/7.', conditions: [{ metric: 'dbqGoldEvidence', operator: '>=', value: 1 }] }
    ]
  },
  {
    id: 'leq-mastery', category: 'assessment', type: 'tiered',
    name: 'LEQ Mastery Badge', shortName: 'LEQ Mastery',
    assetPath: 'assets/badges/general/leq-mastery.svg',
    description: 'Tracks growth on full AP-style Long Essay Questions.',
    unlockMessage: 'Complete one LEQ Writing Challenge to begin.', metricLabel: 'LEQ results',
    tiers: [
      { id: 'bronze', label: 'Bronze', rewardPreset: 'badgeBronze', criteriaText: 'Earn 3/6 or higher on a complete LEQ.', conditions: [{ metric: 'leqAtThreeOfSix', operator: '>=', value: 1 }] },
      { id: 'silver', label: 'Silver', rewardPreset: 'badgeSilver', criteriaText: 'Earn 4/6 or higher on a complete LEQ.', conditions: [{ metric: 'leqAtFourOfSix', operator: '>=', value: 1 }] },
      { id: 'gold', label: 'Gold', rewardPreset: 'badgeGold', criteriaText: 'Earn 5/6 or higher, or complete a teacher-approved revision pathway.', conditions: [{ metric: 'leqGoldEvidence', operator: '>=', value: 1 }] }
    ]
  },
  {
    id: 'vocabulary-mastery', category: 'assessment', type: 'tiered',
    name: 'Vocabulary Mastery Badge', shortName: 'Vocabulary Mastery',
    assetPath: 'assets/badges/general/vocabulary-mastery.svg',
    description: 'Tracks repeated, successful practice with historically meaningful vocabulary.',
    unlockMessage: 'Complete one Vocabulary Challenge to begin.', metricLabel: 'qualifying vocabulary sets',
    tiers: [
      { id: 'bronze', label: 'Bronze', rewardPreset: 'badgeBronze', criteriaText: 'Complete 2 challenge sets at 70% or higher.', conditions: [{ metric: 'vocabSetsAt70', operator: '>=', value: 2 }] },
      { id: 'silver', label: 'Silver', rewardPreset: 'badgeSilver', criteriaText: 'Complete 4 challenge sets at 80% or higher.', conditions: [{ metric: 'vocabSetsAt80', operator: '>=', value: 4 }] },
      { id: 'gold', label: 'Gold', rewardPreset: 'badgeGold', criteriaText: 'Complete 6 challenge sets at 90% or higher.', conditions: [{ metric: 'vocabSetsAt90', operator: '>=', value: 6 }] }
    ]
  },
  {
    id: 'timeline-mastery', category: 'assessment', type: 'tiered',
    name: 'Timeline Mastery Badge', shortName: 'Timeline Mastery',
    assetPath: 'assets/badges/general/timeline-mastery.svg',
    description: 'Tracks historical chronology, sequencing, and causal connections.',
    unlockMessage: 'Complete one Timeline Challenge to begin.', metricLabel: 'timeline tasks',
    tiers: [
      { id: 'bronze', label: 'Bronze', rewardPreset: 'badgeBronze', criteriaText: 'Complete 2 timeline tasks.', conditions: [{ metric: 'timelineTasksCompleted', operator: '>=', value: 2 }] },
      { id: 'silver', label: 'Silver', rewardPreset: 'badgeSilver', criteriaText: 'Complete 4 timeline tasks at 80% or higher.', conditions: [{ metric: 'timelineSetsAt80', operator: '>=', value: 4 }] },
      { id: 'gold', label: 'Gold', rewardPreset: 'badgeGold', criteriaText: 'Complete 6 timeline tasks at 90% or higher or a teacher-approved synthesis task.', conditions: [{ metric: 'timelineGoldEvidence', operator: '>=', value: 1 }] }
    ]
  },
  {
    id: 'revision-mastery', category: 'assessment', type: 'tiered',
    name: 'Revision Mastery Badge', shortName: 'Revision Mastery',
    assetPath: 'assets/badges/general/revision-mastery.svg',
    description: 'Celebrates a thoughtful feedback-and-revision process rather than first-draft perfection.',
    unlockMessage: 'Complete one verified revision to begin.', metricLabel: 'verified revision evidence',
    tiers: [
      { id: 'bronze', label: 'Bronze', rewardPreset: 'badgeBronze', criteriaText: 'Complete one verified revision with reflection.', conditions: [{ metric: 'verifiedRevisions', operator: '>=', value: 1 }] },
      { id: 'silver', label: 'Silver', rewardPreset: 'badgeSilver', criteriaText: 'Improve one rubric point on two tasks.', conditions: [{ metric: 'revisionOnePointImprovements', operator: '>=', value: 2 }] },
      { id: 'gold', label: 'Gold', rewardPreset: 'badgeGold', criteriaText: 'Improve two points on a major writing task and submit a reflection.', conditions: [{ metric: 'revisionGoldEvidence', operator: '>=', value: 1 }] }
    ]
  }
];

export const UNIT_1_BADGES = [
  {
    id: 'u1-atlantic-cartographer', category: 'unit', unitId: 'unit-1', type: 'collection',
    name: 'Atlantic Cartographer', assetPath: 'assets/badges/unit-1/atlantic-cartographer.svg',
    description: 'Completed the Atlantic World geography and mapping challenge.',
    criteriaText: 'Complete the Unit 1 Atlantic World mapping challenge.',
    rewardPreset: 'unitBadge', prerequisites: ['u1-atlantic-world-map']
  },
  {
    id: 'u1-three-worlds-interpreter', category: 'unit', unitId: 'unit-1', type: 'collection',
    name: 'Three Worlds Interpreter', assetPath: 'assets/badges/unit-1/three-worlds-interpreter.svg',
    description: 'Compared Native American, European, and West African societies before contact.',
    criteriaText: 'Complete the Unit 1 three-worlds comparison challenge.',
    rewardPreset: 'unitBadge', prerequisites: ['u1-three-worlds-comparison']
  },
  {
    id: 'u1-exchange-investigator', category: 'unit', unitId: 'unit-1', type: 'collection',
    name: 'Exchange Investigator', assetPath: 'assets/badges/unit-1/exchange-investigator.svg',
    description: 'Analyzed the causes and effects of the Columbian Exchange.',
    criteriaText: 'Complete the Unit 1 Columbian Exchange MCQ Challenge.',
    rewardPreset: 'unitBadge', prerequisites: ['u1-columbian-exchange-mcq']
  },
  {
    id: 'u1-settlement-chronicler', category: 'unit', unitId: 'unit-1', type: 'collection',
    name: 'Settlement Chronicler', assetPath: 'assets/badges/unit-1/settlement-chronicler.svg',
    description: 'Explained early settlement patterns and their consequences.',
    criteriaText: 'Complete the Unit 1 settlement timeline / chronicle challenge.',
    rewardPreset: 'unitBadge', prerequisites: ['u1-settlement-chronicle-timeline']
  },
  {
    id: 'u1-colonial-sourcekeeper', category: 'unit', unitId: 'unit-1', type: 'collection',
    name: 'Colonial Sourcekeeper', assetPath: 'assets/badges/unit-1/colonial-sourcekeeper.svg',
    description: 'Analyzed a Unit 1 primary source using the HIPP framework.',
    criteriaText: 'Complete the Unit 1 HIPP Source Analysis.',
    rewardPreset: 'unitBadge', prerequisites: ['u1-winthrop-hipp']
  },
  {
    id: 'unit-1-master-seal', category: 'unit', unitId: 'unit-1', type: 'master-seal',
    name: 'Foundations of America Seal', assetPath: 'assets/badges/unit-1/foundations-of-america-seal.svg',
    description: 'Collected four Unit 1 badges and completed the Foundations of America collection.',
    criteriaText: 'Earn any 4 of the 5 standard Unit 1 badges.',
    rewardPreset: 'unitSeal', requiredBadgeIds: [
      'u1-atlantic-cartographer', 'u1-three-worlds-interpreter', 'u1-exchange-investigator',
      'u1-settlement-chronicler', 'u1-colonial-sourcekeeper'
    ], requiredCount: 4
  }
];

export const ALL_STARTER_BADGES = [...GENERAL_BADGES, ...UNIT_1_BADGES];

export function getBadgeById(badgeId, badges = ALL_STARTER_BADGES) {
  return badges.find((badge) => badge.id === badgeId) || null;
}
