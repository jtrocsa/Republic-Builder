export const SKILL_MAX = 20;
export const BASE_SKILL_SCORE = 5;
export const FOCUS_BONUS = 2;

export const HISTORIAN_SKILLS = [
  {
    id: "developments",
    label: "Developments",
    officialName: "Developments and Processes",
    icon: "✦",
    actionName: "Survey the Era",
    description: "Trace what changed, what continued, and why a development mattered.",
    assessmentUses: ["MCQ", "SAQ", "LEQ", "timeline quests"],
    practiceUnlock: "Timeline layers, turning-point prompts, and change-over-time organizers."
  },
  {
    id: "sourcing",
    label: "Sourcing",
    officialName: "Sourcing and Situation",
    icon: "⌕",
    actionName: "Examine the Record",
    description: "Analyze author, audience, purpose, point of view, and historical situation.",
    assessmentUses: ["source MCQ", "SAQ", "DBQ"],
    practiceUnlock: "HIPP prompt cards and document metadata."
  },
  {
    id: "evidence",
    label: "Evidence",
    officialName: "Claims and Evidence in Sources",
    icon: "◆",
    actionName: "Build the Case",
    description: "Identify claims and choose evidence that actually supports a point.",
    assessmentUses: ["MCQ", "SAQ", "DBQ", "LEQ"],
    practiceUnlock: "Claim/evidence sorting spaces and support-strength checks."
  },
  {
    id: "context",
    label: "Context",
    officialName: "Contextualization",
    icon: "◌",
    actionName: "Widen the Lens",
    description: "Place an event or source inside its wider political, economic, social, or cultural setting.",
    assessmentUses: ["SAQ", "LEQ", "DBQ", "story missions"],
    practiceUnlock: "Background cards, maps, and what-came-before prompts."
  },
  {
    id: "connections",
    label: "Connections",
    officialName: "Making Connections",
    icon: "↔",
    actionName: "Trace the Thread",
    description: "Explain causation, comparison, continuity, and change over time.",
    assessmentUses: ["MCQ", "SAQ", "LEQ", "timeline quests"],
    practiceUnlock: "Causation, comparison, and CCOT planning paths."
  },
  {
    id: "argument",
    label: "Argument",
    officialName: "Argumentation",
    icon: "⚑",
    actionName: "Take a Stand",
    description: "Build a defensible claim, line of reasoning, and response to competing views.",
    assessmentUses: ["SAQ", "LEQ", "DBQ", "debates"],
    practiceUnlock: "Thesis frames, counterclaim prompts, and line-of-reasoning planners."
  }
];

export const SKILL_BY_ID = Object.fromEntries(
  HISTORIAN_SKILLS.map((skill) => [skill.id, skill])
);

export const SKILL_BANDS = [
  { min: 0, max: 4, label: "Emerging" },
  { min: 5, max: 7, label: "Capable" },
  { min: 8, max: 11, label: "Skilled" },
  { min: 12, max: 15, label: "Proven" },
  { min: 16, max: 19, label: "Distinguished" },
  { min: 20, max: 20, label: "Historian Legacy" }
];

export function getSkillBand(score) {
  return SKILL_BANDS.find((band) => score >= band.min && score <= band.max) ?? SKILL_BANDS[0];
}

export function createBaseSkillScores() {
  return Object.fromEntries(HISTORIAN_SKILLS.map((skill) => [skill.id, BASE_SKILL_SCORE]));
}

export function createStartingSkillScores(primarySkillId, secondarySkillId) {
  if (!SKILL_BY_ID[primarySkillId] || !SKILL_BY_ID[secondarySkillId]) {
    throw new Error("Primary and secondary historian skills must be valid skill IDs.");
  }

  if (primarySkillId === secondarySkillId) {
    throw new Error("Primary and secondary historian skills must be different.");
  }

  const scores = createBaseSkillScores();
  scores[primarySkillId] += FOCUS_BONUS;
  scores[secondarySkillId] += FOCUS_BONUS;
  return scores;
}
