import { UNIT, QUESTS, SOURCES, SKILLS, RUBRICS } from './quest%20data.js';
import { loadState, saveState } from './quest%20store.js';
import { DEFAULT_STORAGE_KEY, loadProfile } from '../src/services/characterProfile.js';
import { PROFESSION_BY_ID } from '../src/data/professions.js';
import { getDataService, getDataModeLabel } from './services/dataService.js';
import { QUEST_BACKEND_CONFIG } from './config/quest-backend.config.js';
import { DEFAULT_PROGRESSION_CONFIG, validateProgressionConfig } from './quest-progression-config.js';
import {
  createDefaultStudentProgress,
  localProgressStorage,
  getLevelState,
  awardQuestCompletion,
  getBadgeVisualState,
  spendArchiveTokens,
  grantTeacherReward,
  recordAssessmentResult,
  evaluateAllBadges
} from './quest-progression-engine.js';
import { ALL_STARTER_BADGES, GENERAL_BADGES, UNIT_1_BADGES } from './quest-badge-data.js';
import { STARTER_STORE_ITEMS } from './quest-store-data.js';

let state = loadState();
let activeQuest = null;
let activeBossMode = 'saq';
let royaleIndex = 0;
let royaleScore = 0;
let vocabIndex = 0;
let vocabScore = 0;
const CORE_STATE_KEY = 'republic-builder-state-v2';
const dataService = getDataService();
let studentClassId = QUEST_BACKEND_CONFIG.demoClassId;
let studentQuestFeed = [];
let serviceCatalogQuests = [];
let teacherSession = null;
let teacherClasses = [];
let teacherActiveClassId = QUEST_BACKEND_CONFIG.demoClassId;
let teacherActiveTab = 'command-center';
let teacherDashboardSnapshot = null;
let teacherStudioSnapshot = [];
let activeTeacherSubmissionId = null;
let activeTeacherRubricMode = 'saq';
let activeTeacherEditQuestId = null;
let suppressQuestOpenUntil = 0;
let activeMapDrag = null;
const PROGRESSION_STUDENT_ID = QUEST_BACKEND_CONFIG.demoStudentId || 'student-aria';
let progressionConfig = JSON.parse(JSON.stringify(DEFAULT_PROGRESSION_CONFIG));
let studentProgress = createDefaultStudentProgress(PROGRESSION_STUDENT_ID);
let pendingStorePurchaseId = null;
const LEGACY_TO_ACTIVITY_TYPE = Object.freeze({
  royale: 'MCQ Challenge',
  vocab: 'Vocabulary Challenge',
  hipp: 'HIPP Source Analysis',
  boss: 'DBQ Writing Challenge'
});
const LEGACY_TO_MODE_LABEL = Object.freeze({
  royale: 'Core Quest',
  vocab: 'Practice',
  hipp: 'Practice',
  boss: 'Boss Battle'
});
const QUEST_PROGRESSION_OVERRIDES = Object.freeze({
  'q-southwest-survey': {
    catalogId: 'u1-atlantic-world-map',
    activityType: 'Timeline Challenge',
    historicalTopic: 'Atlantic World Map & Geography',
    modeLabel: 'Core Quest',
    estimatedMinutes: 15,
    countLabel: 'Map Regions',
    countValue: 7,
    badgeBuilds: ['Timeline Mastery Badge', 'Atlantic Cartographer'],
    badgeLinks: [
      { badgeId: 'timeline-mastery', metric: 'timelineTasksCompleted', amount: 1 }
    ],
    xpReward: 30,
    tokenReward: 3,
    replayRewardPolicy: 'first_completion_only'
  },
  'q-new-atlantic-chart': {
    catalogId: 'u1-three-worlds-comparison',
    activityType: 'Primary Source Analysis',
    historicalTopic: 'Three Worlds Before Contact',
    modeLabel: 'Core Quest',
    estimatedMinutes: 20,
    countLabel: 'Source',
    countValue: 1,
    badgeBuilds: ['Three Worlds Interpreter'],
    badgeLinks: [],
    xpReward: 30,
    tokenReward: 3,
    replayRewardPolicy: 'first_completion_only'
  },
  'q-tenochtitlan-royale': {
    catalogId: 'u1-columbian-exchange-mcq',
    activityType: 'MCQ Challenge',
    historicalTopic: 'Columbian Exchange',
    modeLabel: 'Core Quest',
    estimatedMinutes: 10,
    countLabel: 'Questions',
    countValue: 12,
    badgeBuilds: ['MCQ Mastery Badge', 'Exchange Investigator'],
    badgeLinks: [
      { badgeId: 'mcq-mastery', metric: 'mcqSetsAt60', amount: 1 }
    ],
    xpReward: 30,
    tokenReward: 3,
    replayRewardPolicy: 'first_completion_only'
  },
  'q-maize-bounty': {
    catalogId: 'u1-settlement-chronicle-timeline',
    activityType: 'Timeline Challenge',
    historicalTopic: 'Settlement Chronicle',
    modeLabel: 'Practice',
    estimatedMinutes: 12,
    countLabel: 'Prompts',
    countValue: 4,
    badgeBuilds: ['Timeline Mastery Badge', 'Settlement Chronicler'],
    badgeLinks: [
      { badgeId: 'timeline-mastery', metric: 'timelineTasksCompleted', amount: 1 }
    ],
    xpReward: 20,
    tokenReward: 2,
    replayRewardPolicy: 'first_completion_only'
  },
  'q-columbus-dispatch': {
    catalogId: 'u1-winthrop-hipp',
    activityType: 'HIPP Source Analysis',
    historicalTopic: 'John Winthrop Source Analysis',
    modeLabel: 'Practice',
    estimatedMinutes: 15,
    countLabel: 'Source',
    countValue: 1,
    badgeBuilds: ['HIPP Mastery Badge', 'Colonial Sourcekeeper'],
    badgeLinks: [
      { badgeId: 'hipp-mastery', metric: 'hippAtThreeOfFour', amount: 1 }
    ],
    xpReward: 20,
    tokenReward: 2,
    replayRewardPolicy: 'first_completion_only'
  }
});
const RUBRIC_ASSETS = [
  { id: 'saq', title: 'SAQ Rubric', file: 'APUSH%20Rubrics/SAQ_Rubric.pdf', type: 'pdf', note: '3-point short-answer scoring structure.' },
  { id: 'leq', title: 'LEQ Rubric', file: 'APUSH%20Rubrics/LEQ%20Rubric.webp', type: 'image', note: '6-point long-essay scoring structure.' },
  { id: 'dbq', title: 'DBQ Rubric', file: 'APUSH%20Rubrics/DBQ%20Rubric.png', type: 'image', note: '7-point document-based question scoring structure.' }
];

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function text(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadStudentProgress() {
  studentProgress = localProgressStorage.get(PROGRESSION_STUDENT_ID);
}

function saveStudentProgress(nextProgress) {
  studentProgress = localProgressStorage.save(PROGRESSION_STUDENT_ID, nextProgress);
}

function getQuestProgressionMeta(quest) {
  const override = QUEST_PROGRESSION_OVERRIDES[quest.id] || {};
  const style = getAssessmentStyle(override.assessmentLabel || quest.assessmentLabel || LEGACY_TO_ACTIVITY_TYPE[quest.mode] || 'MCQ');
  const activityType = override.activityType || style.activityType;
  const historicalTopic = override.historicalTopic || quest.title;
  const modeLabel = override.modeLabel || LEGACY_TO_MODE_LABEL[quest.mode] || 'Practice';
  const estimatedMinutes = Number(override.estimatedMinutes || 12);
  const countLabel = override.countLabel || 'Questions';
  const countValue = Number(override.countValue || quest.questionCount || quest.questions?.length || quest.cards?.length || (quest.mode === 'boss' ? 1 : 1));
  const badgeBuilds = Array.isArray(override.badgeBuilds) ? override.badgeBuilds : [];
  const xpReward = Number(override.xpReward ?? quest.xp ?? 20);
  const tokenReward = Number(override.tokenReward ?? quest.tokenReward ?? Math.max(1, Math.min(6, Math.round(xpReward / 12))));
  const replayRewardPolicy = override.replayRewardPolicy || 'first_completion_only';
  const badgeLinks = Array.isArray(override.badgeLinks) ? override.badgeLinks : [];
  const catalogId = override.catalogId || quest.id;
  return { activityType, historicalTopic, modeLabel, estimatedMinutes, countLabel, countValue, badgeBuilds, xpReward, tokenReward, replayRewardPolicy, badgeLinks, catalogId, assessmentLabel: style.label };
}

function createQuestDefinition(quest, completionMetadata = {}) {
  const meta = getQuestProgressionMeta(quest);
  return {
    id: meta.catalogId,
    unitId: 'unit-1',
    activityType: meta.activityType,
    mode: String(meta.modeLabel || 'practice').toLowerCase().replace(/\s+/g, '_'),
    title: meta.historicalTopic,
    estimatedMinutes: meta.estimatedMinutes,
    xpReward: meta.xpReward,
    tokenReward: meta.tokenReward,
    replayRewardPolicy: meta.replayRewardPolicy,
    badgeLinks: meta.badgeLinks,
    completionMetadata
  };
}

function getModeLabelForQuest(quest) {
  return getQuestProgressionMeta(quest).modeLabel;
}

function getMasteryGateStatus(levelState) {
  if (!levelState.masteryBlocked) return '';
  return levelState.masteryMessage || 'Master Historian unlocks after the Unit 9 Master Seal.';
}

function getBadgeMetricProgress(badge, metrics = {}) {
  if (badge.type !== 'tiered' || !Array.isArray(badge.tiers)) return null;
  const nextTier = badge.tiers.find((tier) => !(studentProgress.badgeProgress?.[badge.id]?.awardedTiers || []).includes(tier.id));
  const tier = nextTier || badge.tiers[badge.tiers.length - 1];
  const condition = tier?.conditions?.[0];
  if (!condition) return null;
  const current = Number(metrics[condition.metric] || 0);
  const target = Number(condition.value || 0);
  return { tierLabel: tier.label, current, target, metric: condition.metric };
}

function calculateEconomyWarnings(config) {
  const warnings = [];
  const presets = config.rewardPresets || {};
  const questTokenMax = Math.max(
    0,
    Number(presets.practice?.tokens || 0),
    Number(presets.core?.tokens || 0),
    Number(presets.major?.tokens || 0),
    Number(presets.boss?.tokens || 0)
  );
  if (questTokenMax > Number(config.economyGuardrails?.recommendedQuestTokenMax || 6)) {
    warnings.push(`Quest token reward ${questTokenMax} exceeds recommended max ${config.economyGuardrails?.recommendedQuestTokenMax || 6}.`);
  }

  const defaultPlan = [
    Number(presets.warmup?.tokens || 0),
    Number(presets.practice?.tokens || 0),
    Number(presets.core?.tokens || 0),
    Number(presets.major?.tokens || 0),
    Number(presets.boss?.tokens || 0)
  ];
  const projectedPerUnit = defaultPlan.reduce((sum, value) => sum + value, 0) + 14;
  const yearProjection = projectedPerUnit * 9;
  const maxTarget = Number(config.economyGuardrails?.targetYearEndTokens?.max || 550);
  if (yearProjection > maxTarget) warnings.push(`Projected yearly tokens ${yearProjection} may create inflation (target max ${maxTarget}).`);

  const minPrice = Number(config.economyGuardrails?.recommendedStorePrice?.min || 4);
  const maxPrice = Number(config.economyGuardrails?.recommendedStorePrice?.max || 99);
  const outOfRange = STARTER_STORE_ITEMS.filter((item) => item.price < minPrice || item.price > maxPrice);
  if (outOfRange.length) warnings.push(`Store prices outside ${minPrice}-${maxPrice}: ${outOfRange.map((item) => item.name).join(', ')}.`);

  return warnings;
}

function renderProgressionConfigTable(levels = []) {
  return `
    <div class="teacher-table-wrap">
      <table class="teacher-table">
        <thead><tr><th>Level</th><th>Title</th><th>Cumulative XP</th></tr></thead>
        <tbody>
          ${levels.map((row, index) => `<tr>
            <td>${index + 1}</td>
            <td><input name="level-title-${index}" value="${text(row.title)}" /></td>
            <td><input type="number" min="0" name="level-xp-${index}" value="${Number(row.cumulativeXp || 0)}" /></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function gatherProgressionConfigFromForm(form) {
  const data = new FormData(form);
  const next = clone(progressionConfig);
  next.levels = next.levels.map((level, index) => ({
    level: index + 1,
    title: String(data.get(`level-title-${index}`) || level.title),
    cumulativeXp: Number(data.get(`level-xp-${index}`) || level.cumulativeXp)
  }));
  next.masteryGate.enabled = data.get('mastery-enabled') === 'on';
  next.masteryGate.requiredBadgeId = String(data.get('mastery-required-badge') || next.masteryGate.requiredBadgeId);
  next.masteryGate.message = String(data.get('mastery-message') || next.masteryGate.message);

  const rewardKeys = ['warmup', 'practice', 'core', 'major', 'boss', 'revision', 'optional'];
  rewardKeys.forEach((key) => {
    next.rewardPresets[key].xp = Math.max(0, Number(data.get(`${key}-xp`) || next.rewardPresets[key].xp));
    next.rewardPresets[key].tokens = Math.max(0, Number(data.get(`${key}-tokens`) || next.rewardPresets[key].tokens));
  });
  return next;
}

function normalizeAssessmentLabel(value = '') {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized === 'VOCABULARY' || normalized === 'VOCABULARY CHALLENGE') return 'VOCAB';
  if (normalized === 'MCQ CHALLENGE') return 'MCQ';
  if (normalized === 'HIPP SOURCE ANALYSIS') return 'HIPP';
  if (normalized === 'PRIMARY SOURCE ANALYSIS') return 'PRIMARY';
  if (normalized === 'TIMELINE CHALLENGE') return 'TIMELINE';
  if (normalized.includes('SAQ')) return 'SAQ';
  if (normalized.includes('LEQ')) return 'LEQ';
  if (normalized.includes('DBQ')) return 'DBQ';
  if (normalized.includes('MCQ')) return 'MCQ';
  if (normalized.includes('HIPP')) return 'HIPP';
  if (normalized.includes('VOCAB')) return 'VOCAB';
  if (normalized.includes('TIMELINE')) return 'TIMELINE';
  return 'MCQ';
}

function getAssessmentStyle(label = 'MCQ') {
  const normalized = normalizeAssessmentLabel(label);
  if (normalized === 'HIPP' || normalized === 'PRIMARY') {
    return { label: normalized === 'PRIMARY' ? 'PRIMARY SOURCE' : 'HIPP', mode: 'hipp', icon: '◈', activityType: normalized === 'PRIMARY' ? 'Primary Source Analysis' : 'HIPP Source Analysis' };
  }
  if (normalized === 'VOCAB') {
    return { label: 'VOCAB', mode: 'vocab', icon: '✣', activityType: 'Vocabulary Challenge' };
  }
  if (normalized === 'SAQ' || normalized === 'LEQ' || normalized === 'DBQ') {
    return { label: normalized, mode: 'boss', icon: '✦', activityType: `${normalized} Challenge` };
  }
  if (normalized === 'TIMELINE') {
    return { label: 'TIMELINE', mode: 'royale', icon: '⌁', activityType: 'Timeline Challenge' };
  }
  return { label: 'MCQ', mode: 'royale', icon: '⌁', activityType: 'MCQ Challenge' };
}

function getTeacherCustomQuests() {
  state.teacherCustomQuests = Array.isArray(state.teacherCustomQuests) ? state.teacherCustomQuests : [];
  return state.teacherCustomQuests;
}

function generatePlaceholderQuestions(count = 4) {
  return Array.from({ length: Math.max(1, Number(count || 1)) }, (_, index) => ({
    prompt: `Teacher-authored question ${index + 1}`,
    choices: ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
    answer: 0,
    rationale: 'Teacher-authored rationale.',
    skill: 'Evidence'
  }));
}

function generatePlaceholderCards(count = 4) {
  return Array.from({ length: Math.max(1, Number(count || 1)) }, (_, index) => ({
    term: `Term ${index + 1}`,
    definition: 'Teacher-authored vocabulary definition.',
    application: `Teacher-authored vocabulary prompt ${index + 1}`,
    choices: ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
    answer: 0,
    misconception: 'Teacher-authored misconception.'
  }));
}

function createTeacherQuestRuntime({ id, title, assessmentLabel, xpReward, tokenReward, questionCount, coordinates = null, unlocked = true }) {
  const style = getAssessmentStyle(assessmentLabel);
  const quest = {
    id,
    title,
    shortTitle: title,
    mode: style.mode,
    icon: style.icon,
    location: 'Teacher Positioned',
    description: `${style.activityType} authored in Teacher Dashboard.`,
    skill: style.label,
    xp: Number(xpReward || 20),
    tokenReward: Number(tokenReward || 2),
    questionCount: Math.max(1, Number(questionCount || 1)),
    assessmentLabel: style.label,
    unlocked,
    coordinates: coordinates || { left: '50%', top: '50%' },
    isTeacherCustom: true
  };

  if (style.mode === 'vocab') {
    quest.cards = generatePlaceholderCards(quest.questionCount);
  } else if (style.mode === 'hipp') {
    quest.source = SOURCES[0] || { type: 'Source', date: 'N/A', title: 'Teacher Source', author: 'Teacher', classroomExcerpt: 'Teacher-authored excerpt.', sourceUrl: '#' };
    quest.prompts = {
      historicalSituation: 'Describe the historical context.',
      audience: 'Identify the intended audience.',
      purpose: 'Explain the author purpose.',
      pov: 'Explain the point of view.'
    };
    quest.model = 'Teacher-authored model analysis.';
  } else if (style.mode === 'boss') {
    quest.variants = {
      saq: { label: 'SAQ Skirmish', rubric: 'saq', prompt: 'Teacher-authored SAQ prompt.', parts: [{ label: 'A', text: 'Part A prompt' }, { label: 'B', text: 'Part B prompt' }, { label: 'C', text: 'Part C prompt' }] },
      leq: { label: 'LEQ Duel', rubric: 'leq', prompt: 'Teacher-authored LEQ prompt.', planningPrompts: ['Thesis', 'Context', 'Evidence', 'Reasoning'] },
      dbq: { label: 'DBQ Siege', rubric: 'dbq', prompt: 'Teacher-authored DBQ prompt.', documents: [] }
    };
  } else {
    quest.questions = generatePlaceholderQuestions(quest.questionCount);
  }

  return quest;
}

function toPercent(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return `${Math.min(100, Math.max(0, n)).toFixed(2)}%`;
}

function buildServiceQuestRuntimeFromContent(questRow, content = {}) {
  const identity = content.identity || {};
  const assessment = content.assessments?.[0] || {};
  const assessmentLabel = normalizeAssessmentLabel(assessment.label || questRow.questType || 'MCQ');
  const style = getAssessmentStyle(assessmentLabel);
  const xpReward = Number(identity.xpReward || questRow.xpReward || content.rewards?.xp || 20);
  const tokenReward = Number(content.rewards?.tokens || Math.max(1, Math.min(6, Math.round(xpReward / 12))));
  const questions = Array.isArray(assessment.questions) ? assessment.questions : [];
  const mapMarker = identity.mapMarker || {};
  const runtime = createTeacherQuestRuntime({
    id: questRow.id,
    title: identity.title || questRow.title || 'Teacher Quest',
    assessmentLabel,
    xpReward,
    tokenReward,
    questionCount: questions.length || 1,
    coordinates: {
      left: toPercent(mapMarker.x, '50%'),
      top: toPercent(mapMarker.y, '50%')
    },
    unlocked: !['locked', 'scheduled', 'draft', 'hidden', 'archived'].includes(String(questRow.accessMode || questRow.defaultAccessMode || '').toLowerCase())
  });

  runtime.isServiceBacked = true;
  runtime.accessMode = questRow.accessMode || questRow.defaultAccessMode || 'available';
  runtime.lockMessage = questRow.noteToStudent || '';
  runtime.location = identity.location || questRow.locationKey || 'Atlantic World';
  runtime.description = content.presentation?.heroDescription || runtime.description;
  runtime.assessmentLabel = style.label;
  runtime.icon = style.icon;
  runtime.mode = style.mode;

  if (style.mode === 'vocab') {
    runtime.cards = questions.map((item, index) => ({
      term: item.label || `Term ${index + 1}`,
      definition: content.sources?.[0]?.body || 'Teacher-authored vocabulary definition.',
      application: item.prompt || `Teacher-authored vocabulary prompt ${index + 1}`,
      choices: Array.isArray(item.choices) && item.choices.length ? item.choices : ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
      answer: Number(item.answer || 0),
      misconception: 'Teacher-authored misconception.'
    }));
  } else if (style.mode === 'hipp') {
    const source = content.sources?.[0] || {};
    runtime.source = {
      type: 'Primary Source',
      date: source.citation || source.date || '',
      title: source.title || 'Teacher Source',
      author: source.author || 'Teacher Upload',
      classroomExcerpt: source.body || source.classroomExcerpt || '',
      sourceUrl: source.sourceUrl || '#',
      citation: source.citation || ''
    };
    runtime.prompts = {
      historicalSituation: questions[0]?.prompt || 'Describe historical context.',
      audience: questions[1]?.prompt || 'Identify intended audience.',
      purpose: questions[2]?.prompt || 'Explain purpose.',
      pov: questions[3]?.prompt || 'Explain point of view.'
    };
    runtime.model = 'Teacher-authored model analysis.';
  } else if (style.mode === 'boss') {
    const parts = questions.map((item, index) => ({
      label: item.label || String.fromCharCode(65 + index),
      text: item.prompt || `Part ${index + 1}`
    }));
    runtime.variants = {
      saq: {
        label: 'SAQ Skirmish',
        rubric: 'saq',
        prompt: questions[0]?.prompt || 'Teacher-authored SAQ prompt.',
        parts: parts.length ? parts : [{ label: 'A', text: 'Part A prompt' }, { label: 'B', text: 'Part B prompt' }, { label: 'C', text: 'Part C prompt' }]
      },
      leq: { label: 'LEQ Duel', rubric: 'leq', prompt: 'Teacher-authored LEQ prompt.', planningPrompts: ['Thesis', 'Context', 'Evidence', 'Reasoning'] },
      dbq: { label: 'DBQ Siege', rubric: 'dbq', prompt: 'Teacher-authored DBQ prompt.', documents: [] }
    };
  } else {
    runtime.questions = questions.map((item, index) => ({
      prompt: item.prompt || `Teacher-authored question ${index + 1}`,
      choices: Array.isArray(item.choices) && item.choices.length ? item.choices : ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
      answer: Number(item.answer || 0),
      rationale: 'Teacher-authored rationale.',
      skill: 'Evidence'
    }));
  }

  return runtime;
}

function upsertTeacherCustomQuest(quest) {
  const list = getTeacherCustomQuests();
  const index = list.findIndex((item) => item.id === quest.id);
  if (index >= 0) list[index] = { ...list[index], ...quest };
  else list.push(quest);
  state.teacherCustomQuests = list;
  saveState(state);
}

function getQuest(id) {
  return QUESTS.find((quest) => quest.id === id)
    || getTeacherCustomQuests().find((quest) => quest.id === id)
    || serviceCatalogQuests.find((quest) => quest.id === id)
    || null;
}

function getSourceById(sourceId) {
  return SOURCES.find((source) => source.id === sourceId);
}

function getQuestOverrides(questId) {
  return state.teacherQuestOverrides?.[questId] || null;
}

function getQuestCoordinates(quest) {
  const position = state.teacherQuestPositions?.[quest.id];
  if (position?.left && position?.top) return position;
  return quest.coordinates;
}

function getQuestFeedEntry(id) {
  return studentQuestFeed.find((entry) => entry.quest?.id === id || entry.questId === id);
}

function getRuntimeQuest(id) {
  const quest = getQuest(id);
  const feedEntry = getQuestFeedEntry(id);
  const override = getQuestOverrides(id);
  if (!quest) return null;
  const runtimeQuest = {
    ...quest,
    ...(override || {}),
    coordinates: getQuestCoordinates(quest)
  };
  if (!feedEntry) return { ...runtimeQuest, unlocked: runtimeQuest.unlocked !== false, accessMode: 'available', lockMessage: '' };
  const noteToStudent = String(feedEntry.noteToStudent || '')
    .replace(/Evidence Royale/gi, 'MCQ Challenge')
    .replace(/Vocabulary Bounty/gi, 'Vocabulary Challenge');
  return {
    ...runtimeQuest,
    unlocked: Boolean(feedEntry.canOpen),
    accessMode: feedEntry.accessMode || 'available',
    lockMessage: noteToStudent
  };
}

function getQuestCatalog() {
  const allQuests = [...QUESTS, ...getTeacherCustomQuests(), ...serviceCatalogQuests];
  const deduped = Array.from(new Map(allQuests.map((quest) => [quest.id, quest])).values());
  return deduped.map((quest) => getRuntimeQuest(quest.id)).filter(Boolean);
}

function getAssignmentIdForQuest(questId) {
  const entry = getQuestFeedEntry(questId);
  return entry?.assignmentId || null;
}

function setTeacherMode(enabled) {
  state.teacherMode = enabled;
  document.body.setAttribute('data-app-mode', enabled ? 'teacher' : 'student');
  saveState(state);
}

function formatWhen(value) {
  if (!value) return 'Not scheduled';
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? String(value) : dt.toLocaleString();
}

function teacherBadge(status) {
  const textValue = String(status || 'unknown').replace(/_/g, ' ');
  return `<span class="quest-teacher-status-badge">${text(textValue)}</span>`;
}

function getTeacherTabs() {
  return [
    { id: 'command-center', label: 'Command Center' },
    { id: 'quest-studio', label: 'Quest Studio' },
    { id: 'submission-archive', label: 'Submission Archive' },
    { id: 'unit-control', label: 'Unit Control' },
    { id: 'roster', label: 'Roster & Classes' },
    { id: 'analytics', label: 'Historian Analytics' },
    { id: 'settings', label: 'Teacher Settings' }
  ];
}

function renderTeacherTabBar() {
  return `
    <nav class="teacher-tabs" aria-label="Teacher dashboard sections">
      ${getTeacherTabs().map((tab) => `<button type="button" data-teacher-tab="${tab.id}" class="${teacherActiveTab === tab.id ? 'active' : ''}">${text(tab.label)}</button>`).join('')}
    </nav>`;
}

function applyTeacherTabVisibility() {
  $$('[data-teacher-section]').forEach((section) => {
    const isActive = section.dataset.teacherSection === teacherActiveTab;
    section.hidden = !isActive;
  });
  $$('[data-teacher-tab]').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.teacherTab === teacherActiveTab);
  });
}

function getQuestBuilderTemplates() {
  return [
    {
      id: 'royale',
      label: 'MCQ Challenge',
      questType: 'evidence',
      defaults: {
        title: 'New MCQ Challenge',
        subtitle: 'Stimulus and source analysis',
        heroKicker: 'MCQ Challenge',
        heroDescription: 'Teacher-built evidence challenge with multiple rounds.',
        assessmentLabel: 'Evidence Rounds',
        instructions: 'Choose the best evidence-based answer for each prompt.',
        questions: [
          {
            id: 'q1',
            label: 'Q1',
            prompt: 'Write your first multiple-choice prompt.',
            choices: ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
            answer: 0,
            maxPoints: 1
          }
        ]
      }
    },
    {
      id: 'hipp',
      label: 'HIPP Challenge',
      questType: 'hipp',
      defaults: {
        title: 'New HIPP Challenge',
        subtitle: 'Historical sourcing practice',
        heroKicker: 'HIPP Challenge',
        heroDescription: 'Analyze historical situation, audience, purpose, and point of view.',
        assessmentLabel: 'HIPP Response',
        instructions: 'Respond to each prompt using source evidence and contextual reasoning.',
        questions: [
          { id: 'h', label: 'Historical Situation', prompt: 'What broader context shapes this source?', choices: [], answer: 0, maxPoints: 1 },
          { id: 'i', label: 'Intended Audience', prompt: 'Who is the intended audience and why?', choices: [], answer: 0, maxPoints: 1 },
          { id: 'p1', label: 'Purpose', prompt: 'What is the author trying to achieve?', choices: [], answer: 0, maxPoints: 1 },
          { id: 'p2', label: 'Point of View', prompt: 'How does point of view shape this source?', choices: [], answer: 0, maxPoints: 1 }
        ]
      }
    },
    {
      id: 'vocab',
      label: 'Vocabulary Challenge',
      questType: 'vocabulary',
      defaults: {
        title: 'New Vocabulary Challenge',
        subtitle: 'Concept mastery',
        heroKicker: 'Vocabulary Challenge',
        heroDescription: 'Define and apply key terms with evidence-backed choices.',
        assessmentLabel: 'Vocabulary Hunt',
        instructions: 'Select the best application of each term.',
        questions: [
          {
            id: 'q1',
            label: 'Term 1',
            prompt: 'Write a term application prompt.',
            choices: ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
            answer: 0,
            maxPoints: 1
          }
        ]
      }
    },
    {
      id: 'boss',
      label: 'DBQ Boss Battle Draft',
      questType: 'boss_battle',
      defaults: {
        title: 'New Boss Battle',
        subtitle: 'Writing challenge',
        heroKicker: 'Boss Battle',
        heroDescription: 'Teacher-built writing challenge with AP-style rubric alignment.',
        assessmentLabel: 'Writing Task',
        instructions: 'Write a historically defensible response with evidence.',
        questions: [
          { id: 'part-a', label: 'Part A', prompt: 'Write part A prompt.', choices: [], answer: 0, maxPoints: 1 },
          { id: 'part-b', label: 'Part B', prompt: 'Write part B prompt.', choices: [], answer: 0, maxPoints: 1 },
          { id: 'part-c', label: 'Part C', prompt: 'Write part C prompt.', choices: [], answer: 0, maxPoints: 1 }
        ]
      }
    }
  ];
}

function getTemplateById(id = 'royale') {
  return getQuestBuilderTemplates().find((template) => template.id === id) || getQuestBuilderTemplates()[0];
}

function deriveTemplateFromQuestType(value = '') {
  const questType = String(value || '').toLowerCase();
  if (questType.includes('hipp')) return 'hipp';
  if (questType.includes('vocab')) return 'vocab';
  if (questType.includes('boss')) return 'boss';
  return 'royale';
}

function formatQuestStudioTypeLabel(quest = {}) {
  const questType = String(quest.questType || '').toLowerCase();
  if (questType.includes('saq')) return 'saq';
  if (questType.includes('leq')) return 'leq';
  if (questType.includes('dbq')) return 'dbq';
  if (questType.includes('hipp') || questType.includes('primary')) return 'hipp';
  if (questType.includes('vocab')) return 'vocab';
  if (questType.includes('boss')) return 'saq/leq/dbq';
  if (questType.includes('mcq') || questType.includes('evidence') || questType.includes('royale')) return 'mcq';

  const assessmentLabel = normalizeAssessmentLabel(quest.assessmentLabel || quest.typeLabel || '');
  if (assessmentLabel === 'SAQ') return 'saq';
  if (assessmentLabel === 'LEQ') return 'leq';
  if (assessmentLabel === 'DBQ') return 'dbq';
  if (assessmentLabel === 'HIPP' || assessmentLabel === 'PRIMARY') return 'hipp';
  if (assessmentLabel === 'VOCAB') return 'vocab';
  return 'mcq';
}

function normalizeTeacherQuestDraft(data = {}, quest = null) {
  const identity = data.identity || {};
  const presentation = data.presentation || {};
  const firstAssessment = data.assessments?.[0] || {};
  const source = data.sources?.[0] || {};
  const questions = Array.isArray(firstAssessment.questions) && firstAssessment.questions.length
    ? firstAssessment.questions
    : [{ id: 'q1', label: 'Q1', prompt: '', choices: ['Choice A', 'Choice B', 'Choice C', 'Choice D'], answer: 0, maxPoints: 1 }];

  return {
    templateKey: deriveTemplateFromQuestType(identity.questType || quest?.questType),
    title: identity.title || quest?.title || '',
    subtitle: identity.subtitle || '',
    location: identity.location || quest?.locationKey || '',
    xpReward: identity.xpReward || quest?.xpReward || 50,
    heroKicker: presentation.heroKicker || '',
    heroDescription: presentation.heroDescription || '',
    assessmentLabel: firstAssessment.label || 'Assessment',
    instructions: firstAssessment.instructions || '',
    sourceTitle: source.title || '',
    sourceCitation: source.citation || '',
    sourceBody: source.body || '',
    sourceUrl: source.sourceUrl || '',
    questions: questions.map((question, index) => ({
      id: question.id || `q${index + 1}`,
      label: question.label || `Q${index + 1}`,
      prompt: question.prompt || '',
      choices: Array.isArray(question.choices) ? question.choices : ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
      answer: Number(question.answer || 0),
      maxPoints: Number(question.maxPoints || 1),
      responseType: question.responseType || (Array.isArray(question.choices) && question.choices.length ? 'multiple_choice' : 'textarea')
    }))
  };
}

function buildDraftFromLiveQuest(questId) {
  const quest = getQuest(questId);
  if (!quest) return null;
  const source = quest.source || getSourceById(quest.sources?.[0]) || {};

  if (quest.mode === 'hipp') {
    return {
      templateKey: 'hipp',
      title: quest.title,
      subtitle: 'HIPP Challenge',
      location: quest.location,
      xpReward: quest.xp,
      heroKicker: 'HIPP Challenge',
      heroDescription: quest.description,
      assessmentLabel: 'HIPP Response',
      instructions: 'Respond using source evidence and contextual reasoning.',
      sourceTitle: source.title || '',
      sourceCitation: source.citation || source.date || '',
      sourceBody: source.classroomExcerpt || source.description || '',
      sourceUrl: source.sourceUrl || '',
      questions: [
        { id: 'h', label: 'Historical Situation', prompt: quest.prompts?.historicalSituation || '', choices: [], answer: 0, maxPoints: 1, responseType: 'textarea' },
        { id: 'i', label: 'Intended Audience', prompt: quest.prompts?.audience || '', choices: [], answer: 0, maxPoints: 1, responseType: 'textarea' },
        { id: 'p1', label: 'Purpose', prompt: quest.prompts?.purpose || '', choices: [], answer: 0, maxPoints: 1, responseType: 'textarea' },
        { id: 'p2', label: 'Point of View', prompt: quest.prompts?.pov || '', choices: [], answer: 0, maxPoints: 1, responseType: 'textarea' }
      ]
    };
  }

  if (quest.mode === 'vocab') {
    return {
      templateKey: 'vocab',
      title: quest.title,
      subtitle: 'Vocabulary Challenge',
      location: quest.location,
      xpReward: quest.xp,
      heroKicker: 'Vocabulary Challenge',
      heroDescription: quest.description,
      assessmentLabel: 'Term Recovery',
      instructions: 'Choose the best answer and revise misconceptions.',
      sourceTitle: source.title || '',
      sourceCitation: source.citation || source.date || '',
      sourceBody: source.classroomExcerpt || source.description || '',
      sourceUrl: source.sourceUrl || '',
      questions: (quest.cards || []).map((card, index) => ({
        id: `q${index + 1}`,
        label: card.term || `Q${index + 1}`,
        prompt: card.application || '',
        choices: Array.isArray(card.choices) && card.choices.length ? card.choices : ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
        answer: Number(card.answer || 0),
        maxPoints: 1,
        responseType: 'multiple_choice'
      }))
    };
  }

  if (quest.mode === 'royale') {
    return {
      templateKey: 'royale',
      title: quest.title,
      subtitle: 'MCQ Challenge',
      location: quest.location,
      xpReward: quest.xp,
      heroKicker: 'MCQ Challenge',
      heroDescription: quest.description,
      assessmentLabel: 'Evidence Rounds',
      instructions: 'Choose the best evidence-based answer for each question.',
      sourceTitle: source.title || '',
      sourceCitation: source.citation || source.date || '',
      sourceBody: source.classroomExcerpt || source.description || '',
      sourceUrl: source.sourceUrl || '',
      questions: (quest.questions || []).map((item, index) => ({
        id: `q${index + 1}`,
        label: `Q${index + 1}`,
        prompt: item.prompt || '',
        choices: Array.isArray(item.choices) && item.choices.length ? item.choices : ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
        answer: Number(item.answer || 0),
        maxPoints: 1,
        responseType: 'multiple_choice'
      }))
    };
  }

  return {
    templateKey: 'boss',
    title: quest.title,
    subtitle: 'Boss Battle',
    location: quest.location,
    xpReward: quest.xp,
    heroKicker: 'Boss Battle',
    heroDescription: quest.description,
    assessmentLabel: 'Writing Task',
    instructions: 'Use evidence, context, and reasoning.',
    sourceTitle: source.title || '',
    sourceCitation: source.citation || source.date || '',
    sourceBody: source.classroomExcerpt || source.description || '',
    sourceUrl: source.sourceUrl || '',
    questions: (quest.variants?.saq?.parts || []).map((part, index) => ({
      id: `part-${index + 1}`,
      label: part.label || `Part ${index + 1}`,
      prompt: part.text || '',
      choices: [],
      answer: 0,
      maxPoints: 1,
      responseType: 'textarea'
    }))
  };
}

function applyTeacherQuestOverrideFromDraft(questId, draftState, questions, source) {
  const original = getQuest(questId);
  if (!original) return;
  const style = getAssessmentStyle(draftState.assessmentLabel || draftState.templateKey || original.assessmentLabel || 'MCQ');
  const overrides = state.teacherQuestOverrides || {};
  const next = {
    title: draftState.title || original.title,
    shortTitle: draftState.title || original.shortTitle,
    description: original.description,
    location: original.location,
    xp: Number(draftState.xpReward || original.xp || 0),
    tokenReward: Number(draftState.tokenReward || original.tokenReward || 2),
    questionCount: Number(draftState.questionCount || questions.length || original.questionCount || 1),
    assessmentLabel: style.label,
    icon: style.icon,
    mode: style.mode
  };

  if (draftState.templateKey === 'hipp') {
    next.prompts = {
      historicalSituation: questions[0]?.prompt || '',
      audience: questions[1]?.prompt || '',
      purpose: questions[2]?.prompt || '',
      pov: questions[3]?.prompt || ''
    };
  }

  if (draftState.templateKey === 'royale') {
    next.questions = questions.map((item) => ({
      prompt: item.prompt,
      choices: item.choices,
      answer: Number(item.answer || 0),
      rationale: 'Teacher edited in Quest Mode.',
      skill: original.skill || 'Evidence'
    }));
  }

  if (draftState.templateKey === 'vocab') {
    next.cards = questions.map((item) => ({
      term: item.label,
      definition: 'Teacher-authored definition.',
      application: item.prompt,
      choices: item.choices,
      answer: Number(item.answer || 0),
      misconception: 'Teacher-authored misconception note.'
    }));
  }

  if (draftState.templateKey === 'boss') {
    const existingVariants = original.variants || {};
    const parts = questions.map((item, index) => ({ label: item.label || String.fromCharCode(65 + index), text: item.prompt }));
    next.variants = {
      ...existingVariants,
      saq: {
        ...(existingVariants.saq || {}),
        label: existingVariants.saq?.label || 'SAQ Skirmish',
        rubric: existingVariants.saq?.rubric || 'saq',
        prompt: existingVariants.saq?.prompt || 'Teacher-edited SAQ prompt.',
        parts
      }
    };
  }

  if (source?.title || source?.citation || source?.body) {
    next.source = {
      ...(original.source || {}),
      title: source.title || original.source?.title || 'Teacher Source',
      date: source.citation || original.source?.date || '',
      author: original.source?.author || 'Teacher Upload',
      classroomExcerpt: source.body || original.source?.classroomExcerpt || '',
      sourceUrl: source.sourceUrl || original.source?.sourceUrl || '#',
      citation: source.citation || original.source?.citation || ''
    };
  }

  overrides[questId] = next;
  state.teacherQuestOverrides = overrides;
  saveState(state);
}

function renderQuestionEditorRows(questions = [], templateKey = 'royale') {
  return questions.map((question, index) => {
    const isMultipleChoice = templateKey === 'royale' || templateKey === 'vocab';
    const choices = Array.isArray(question.choices) ? question.choices : ['Choice A', 'Choice B', 'Choice C', 'Choice D'];
    return `
      <article class="quest-builder-question" data-question-row="${index}">
        <div class="quest-builder-question-head">
          <h4>Question ${index + 1}</h4>
          <button type="button" data-teacher-action="remove-builder-question" data-question-index="${index}">Remove</button>
        </div>
        <label>Label<input name="question-label-${index}" value="${text(question.label || `Q${index + 1}`)}" /></label>
        <label>Prompt<textarea rows="3" name="question-prompt-${index}">${text(question.prompt || '')}</textarea></label>
        <label>Max Points<input type="number" min="1" max="10" name="question-max-${index}" value="${Number(question.maxPoints || 1)}" /></label>
        ${isMultipleChoice ? `
          <div class="quest-builder-choice-grid">
            ${choices.slice(0, 4).map((choice, choiceIndex) => `<label>Choice ${String.fromCharCode(65 + choiceIndex)}<textarea rows="3" name="question-choice-${index}-${choiceIndex}">${text(choice || '')}</textarea></label>`).join('')}
            <label>Correct Choice
              <select name="question-answer-${index}">
                <option value="0" ${Number(question.answer || 0) === 0 ? 'selected' : ''}>A</option>
                <option value="1" ${Number(question.answer || 0) === 1 ? 'selected' : ''}>B</option>
                <option value="2" ${Number(question.answer || 0) === 2 ? 'selected' : ''}>C</option>
                <option value="3" ${Number(question.answer || 0) === 3 ? 'selected' : ''}>D</option>
              </select>
            </label>
          </div>
        ` : ''}
      </article>
    `;
  }).join('');
}

function readCoreState() {
  try {
    return JSON.parse(localStorage.getItem(CORE_STATE_KEY) || 'null');
  } catch {
    return null;
  }
}

function titleCaseFromSlug(value = '') {
  return String(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPlayerAdapter() {
  const profile = loadProfile(DEFAULT_STORAGE_KEY);
  const coreState = readCoreState();
  const character = coreState?.character || {};
  const identity = profile?.identity || {};
  const townRaw = identity.town || character.town || 'Frontier Outpost';
  const professionId = identity.professionId || character.profession || '';
  const profession = PROFESSION_BY_ID[professionId];
  const starterCount = Array.isArray(profile?.inventory?.starterItems) ? profile.inventory.starterItems.length : 0;

  return {
    name: identity.name || character.name || 'Unnamed Founder',
    pronouns: identity.pronouns || 'Pronouns not set',
    profession: profession?.label || titleCaseFromSlug(professionId || 'independent scholar'),
    settlement: titleCaseFromSlug(townRaw),
    gender: identity.gender || character.gender || 'neutral',
    outfit: identity.outfit || character.outfit || null,
    starterItemCount: starterCount
  };
}

function renderPortrait(player) {
  const portrait = $('#hud-portrait');
  if (!portrait) return;

  const gender = String(player.gender || 'neutral').toLowerCase();
  const baseAsset = gender === 'man' ? 'assets/character/base/man.svg' : gender === 'woman' ? 'assets/character/base/woman.svg' : 'assets/character/base/neutral.svg';
  const outfit = player.outfit || {};
  const layerAssets = [
    ['base', baseAsset],
    ['socks', outfit.socks ? `assets/character/wardrobe/socks/${outfit.socks}.svg` : ''],
    ['pants', outfit.pants ? `assets/character/wardrobe/pants/${outfit.pants}.svg` : ''],
    ['shoes', outfit.shoes ? `assets/character/wardrobe/shoes/${outfit.shoes}.svg` : ''],
    ['shirt', outfit.shirt ? `assets/character/wardrobe/shirts/${outfit.shirt}.svg` : ''],
    ['hat', outfit.hat ? `assets/character/wardrobe/hats/${outfit.hat}.svg` : '']
  ];

  const layers = layerAssets
    .filter(([, path]) => path)
    .map(([slot, path]) => `<img class="avatar-layer avatar-layer-${slot}" src="${path}" alt="" aria-hidden="true" loading="lazy" />`)
    .join('');

  portrait.innerHTML = layers || '<div class="portrait-fallback" aria-hidden="true"><div class="portrait-hair"></div><div class="portrait-face"></div><div class="portrait-tunic"></div></div>';
}

function setDispatch(title, copy) {
  state.dispatch = { title, copy };
  state.missionLog = Array.isArray(state.missionLog) ? state.missionLog : [];
  state.missionLog.unshift({
    id: `dispatch-${Date.now().toString(36)}`,
    title,
    detail: copy,
    type: 'dispatch',
    createdAt: new Date().toISOString()
  });
  state.missionLog = state.missionLog.slice(0, 25);
  saveState(state);
  renderMissionLog();
}

function logMissionEvent(title, detail, type = 'activity') {
  state.missionLog = Array.isArray(state.missionLog) ? state.missionLog : [];
  state.missionLog.unshift({
    id: `mission-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    detail,
    type,
    createdAt: new Date().toISOString()
  });
  state.missionLog = state.missionLog.slice(0, 25);
  saveState(state);
  renderMissionLog();
}

function renderMissionLog() {
  const list = $('#mission-log-list');
  if (!list) return;
  const entries = Array.isArray(state.missionLog) ? state.missionLog : [];
  const derivedEntries = [...(studentProgress.transactions || [])]
    .slice(-12)
    .reverse()
    .map((txn, index) => ({
      id: `txn-${index}-${String(txn.createdAt || index)}`,
      title: String(txn.type || 'Activity').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
      detail: txn.reason || `${Number(txn.xpAmount || 0)} XP and ${Number(txn.amount || 0)} Archive Tokens recorded.`,
      type: 'transaction',
      createdAt: txn.createdAt || new Date().toISOString()
    }));
  const merged = entries.length ? entries : derivedEntries;
  if (!merged.length) {
    list.innerHTML = '<p class="empty-note">No mission activity recorded yet.</p>';
    return;
  }
  list.innerHTML = merged.slice(0, 8).map((entry) => `
    <article class="mission-log-item" data-mission-type="${text(entry.type || 'activity')}">
      <div>
        <h3>${text(entry.title || 'Mission update')}</h3>
        <p>${text(entry.detail || '')}</p>
      </div>
      <small>${text(formatWhen(entry.createdAt))}</small>
    </article>
  `).join('');
}

function updateHud() {
  const player = getPlayerAdapter();
  const completedCount = studentProgress.completedQuestIds.length;
  const totalQuestCount = QUESTS.length;
  const percent = Math.round((completedCount / totalQuestCount) * 100);
  const levelState = getLevelState(studentProgress, progressionConfig);

  $('#hud-player-name').textContent = player.name;
  $('#hud-pronouns').textContent = player.pronouns;
  $('#hud-profession').textContent = player.profession;
  $('#hud-settlement').textContent = player.settlement;
  renderPortrait(player);

  $('#quest-progress-label').textContent = `${completedCount} of ${totalQuestCount} quests completed`;
  $('#unit-progress-bar').style.width = `${percent}%`;
  $('#xp-label').textContent = `${studentProgress.totalXp} XP total`;
  $('#xp-bar').style.width = `${Math.round(levelState.progressWithinLevel * 100)}%`;
  $('#player-level').textContent = levelState.level;
  const inventoryCount = $('#inventory-count');
  if (inventoryCount) inventoryCount.textContent = String(studentProgress.inventoryItemIds.length);
  const sourceCount = $('#source-count-badge');
  if (sourceCount) sourceCount.textContent = String(SOURCES.length);
  const archiveTokens = $('#archive-token-balance');
  if (archiveTokens) archiveTokens.textContent = String(studentProgress.archiveTokens);

  const levelTitle = $('#journey-level-title');
  const levelMeta = $('#journey-level-meta');
  const nextLevel = $('#journey-next-level');
  const masteryNote = $('#journey-mastery-note');
  const progressFill = $('#journey-progress-fill');
  if (levelTitle) levelTitle.textContent = `Level ${levelState.level} · ${levelState.title}`;
  if (levelMeta) levelMeta.textContent = `${levelState.totalXp} XP total`;
  if (nextLevel) nextLevel.textContent = levelState.nextLevel ? `Next level: ${levelState.nextLevel.cumulativeXp} XP` : 'Final level reached';
  if (progressFill) progressFill.style.setProperty('--qp-progress', `${Math.round(levelState.progressWithinLevel * 100)}%`);
  if (masteryNote) {
    const gate = getMasteryGateStatus(levelState);
    masteryNote.hidden = !gate;
    masteryNote.textContent = gate;
  }

  const toggle = $('#teacher-mode-toggle');
  toggle.classList.toggle('on', state.teacherMode);
  $('span', toggle).textContent = state.teacherMode ? 'on' : 'off';
  document.body.setAttribute('data-app-mode', state.teacherMode ? 'teacher' : 'student');
  const teacherStatus = $('#teacher-mode-status');
  if (teacherStatus) {
    if (state.teacherMode && teacherSession?.user) {
      teacherStatus.textContent = `Signed in as ${teacherSession.user.displayName} (${getDataModeLabel()})`;
    } else {
      teacherStatus.textContent = `Teacher Mode is off (${getDataModeLabel()})`;
    }
  }

  renderMissionLog();
}

function renderMap() {
  const questCatalog = getQuestCatalog();
  $('#map-quests').innerHTML = questCatalog.map((quest) => {
    const meta = getQuestProgressionMeta(quest);
    const style = getAssessmentStyle(meta.assessmentLabel);
    const coordinates = getQuestCoordinates(quest);
    const unlocked = quest.unlocked !== false;
    const done = studentProgress.completedQuestIds.includes(meta.catalogId);
    const statusLabel = quest.accessMode === 'review_only'
      ? 'Review only'
      : quest.accessMode === 'scheduled'
        ? 'Scheduled'
        : quest.accessMode === 'locked'
          ? 'Locked'
          : unlocked
            ? 'Unlocked'
            : 'Locked';
    const questType = `${meta.assessmentLabel}: ${meta.historicalTopic}`;
    const rewardText = `${meta.countValue} Questions · ${meta.xpReward} XP · ${meta.tokenReward} Archive Tokens`;
    return `
      <button class="map-quest ${style.mode} ${done ? 'completed' : ''} ${unlocked ? 'unlocked' : 'locked'} ${state.teacherMode ? 'teacher-draggable' : ''}" data-quest-id="${quest.id}" style="left:${coordinates.left}; top:${coordinates.top};" aria-label="Open ${text(quest.title)}" ${unlocked ? '' : 'disabled'}>
        <span class="quest-beacon">${style.icon}</span>
        <span class="quest-label"><b>${text(questType)}</b><em>${text(quest.title)}</em><em>${text(rewardText)} · ${done ? 'Completed' : statusLabel}</em>${quest.lockMessage && !unlocked ? `<em>${text(quest.lockMessage)}</em>` : ''}</span>
        ${done ? '<span class="quest-check">✓</span>' : ''}
      </button>`;
  }).join('');
}

function openOverlay() {
  $('#overlay').hidden = false;
  requestAnimationFrame(() => $('#overlay').classList.add('visible'));
}

function closeOverlay() {
  $('#overlay').classList.remove('visible');
  setTimeout(() => { $('#overlay').hidden = true; }, 180);
}

function closeDrawer() {
  const drawer = $('#library-drawer');
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  closeOverlay();
}

function closeModal() {
  const modal = $('#modal-layer');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = '';
  activeQuest = null;
  closeOverlay();
}

function openLibrary() {
  openOverlay();
  const drawer = $('#library-drawer');
  drawer.innerHTML = `
    <header class="drawer-header">
      <div><p class="eyebrow">Historical Library · Unit 1</p><h2>Atlantic Crossroads Field Archive</h2><p>${SOURCES.length} primary-source records used by Unit 1 quests and writing battles.</p></div>
      <button class="close-button" data-close-drawer aria-label="Close archive">×</button>
    </header>
    <div class="archive-toolbar">
      <label>Search the archive <input id="archive-search" placeholder="Columbus, map, labor …" /></label>
      <span>Every record carries a source link, citation, and usage note.</span>
    </div>
    <div id="archive-list" class="archive-list">${renderArchiveEntries(SOURCES)}</div>
    <footer class="archive-footer">Use rights-cleared reproductions or repository links in student-facing deployment. This demo stores citations and source locations, not external scans.</footer>
  `;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  $('#archive-search').focus();
  $('#archive-search').addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    const filtered = SOURCES.filter((item) => `${item.title} ${item.author} ${item.type} ${item.region} ${item.questUse.join(' ')}`.toLowerCase().includes(query));
    $('#archive-list').innerHTML = renderArchiveEntries(filtered);
  });
}

function renderArchiveEntries(items) {
  if (!items.length) return '<p class="empty-note">No source records match that search.</p>';
  return items.map((item) => `
    <article class="source-record">
      <div class="source-meta"><span>${text(item.type)}</span><span>${text(item.date)}</span><span>${text(item.region)}</span></div>
      <h3>${text(item.title)}</h3>
      <p class="source-author">${text(item.author)}</p>
      <p>${text(item.description)}</p>
      <blockquote>${text(item.classroomExcerpt)}</blockquote>
      <div class="source-quest-tags">${item.questUse.map((quest) => `<span>${text(quest)}</span>`).join('')}</div>
      <details><summary>Citation & source access</summary><p>${text(item.citation)}</p><a href="${text(item.sourceUrl)}" target="_blank" rel="noreferrer">Open source repository ↗</a><p class="rights-note">${text(item.rights)}</p></details>
    </article>
  `).join('');
}

function openQuest(questId) {
  activeQuest = getRuntimeQuest(questId);
  if (!activeQuest) return;
  const feedEntry = getQuestFeedEntry(questId);
  if (feedEntry && !feedEntry.canOpen) {
    openOverlay();
    const modal = $('#modal-layer');
    modal.innerHTML = `
      <article class="small-modal">
        <header class="quest-modal-header">
          <div>
            <p class="eyebrow">Quest currently locked</p>
            <h2>${text(activeQuest.title)}</h2>
            <p>${text(feedEntry.noteToStudent || 'Your teacher has not released this quest yet.')}</p>
          </div>
          <button class="close-button" data-close-modal aria-label="Close quest">×</button>
        </header>
        <div class="teacher-lock-panel">
          <p>${text(activeQuest.description)}</p>
          <div class="teacher-lock-meta">
            <span>Access mode: <b>${text(feedEntry.accessMode || 'locked')}</b></span>
            <span>Status: <b>${text(feedEntry.assignmentStatus || 'not_started')}</b></span>
          </div>
        </div>
      </article>`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    return;
  }
  royaleIndex = 0;
  royaleScore = 0;
  vocabIndex = 0;
  vocabScore = 0;
  activeBossMode = 'saq';
  openOverlay();
  const modal = $('#modal-layer');
  modal.innerHTML = `
    <article class="quest-modal ${activeQuest.mode}">
      <header class="quest-modal-header">
        <div>
          <p class="eyebrow">${text(activeQuest.location)} · ${text(activeQuest.skill)} skill</p>
          <h2><span class="mode-icon ${activeQuest.mode}">${activeQuest.icon}</span>${text(activeQuest.title)}</h2>
          <p>${text(activeQuest.description)}</p>
        </div>
        <div class="quest-header-meta">
          <span>${activeQuest.xp} XP</span>
          ${state.teacherMode ? `<button class="teacher-quest-edit-button" data-teacher-action="edit-active-quest">Edit Quest</button>` : ''}
          <button class="close-button" data-close-modal aria-label="Close quest">×</button>
        </div>
      </header>
      <div class="quest-modal-body" id="quest-modal-body"></div>
    </article>`;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  renderActiveQuest();
}

function renderActiveQuest() {
  if (!activeQuest) return;
  const body = $('#quest-modal-body');
  if (activeQuest.mode === 'hipp') body.innerHTML = renderHippQuest(activeQuest);
  if (activeQuest.mode === 'royale') body.innerHTML = renderRoyaleQuest(activeQuest);
  if (activeQuest.mode === 'vocab') body.innerHTML = renderVocabQuest(activeQuest);
  if (activeQuest.mode === 'boss') body.innerHTML = renderBossQuest(activeQuest);
  bindQuestEvents();
}

function sourceCard(source) {
  return `
    <aside class="source-card">
      <div class="source-card-top"><span>${text(source.type)}</span><span>${text(source.date)}</span></div>
      <h3>${text(source.title)}</h3>
      <p>${text(source.author)}</p>
      <blockquote>${text(source.classroomExcerpt)}</blockquote>
      <a href="${text(source.sourceUrl)}" target="_blank" rel="noreferrer">Open citation record ↗</a>
    </aside>`;
}

function renderHippQuest(quest) {
  const saved = state.attempts[quest.id]?.response || {};
  return `
    <div class="quest-layout two-column">
      <div>
        <div class="instruction-band"><span>HIPP Challenge</span><p>Use the source and its historical setting. Specific evidence matters more than a generic definition of HIPP.</p></div>
        ${sourceCard(quest.source)}
      </div>
      <form id="hipp-form" class="hipp-form">
        ${Object.entries(quest.prompts).map(([key, prompt]) => `
          <label class="hipp-field">
            <span><b>${key === 'historicalSituation' ? 'H' : key === 'audience' ? 'I' : key === 'purpose' ? 'P' : 'P'}</b><strong>${key === 'historicalSituation' ? 'Historical Situation' : key === 'audience' ? 'Intended Audience' : key === 'purpose' ? 'Purpose' : 'Point of View'}</strong></span>
            <small>${text(prompt)}</small>
            <textarea name="${key}" rows="4" placeholder="Use a source detail and explain why it matters.">${text(saved[key] || '')}</textarea>
          </label>`).join('')}
        <div class="practice-note">Practice scoring: your response is saved locally for teacher review. It earns XP for a complete evidence-based attempt; it does not replace a graded AP score.</div>
        <div class="quest-actions"><button class="primary-button" type="submit">Record HIPP analysis</button><button class="text-button" type="button" data-show-model>Reveal a model analysis</button></div>
        <div id="hipp-feedback" class="quest-feedback" hidden></div>
      </form>
    </div>`;
}

function renderRoyaleQuest(quest) {
  const question = quest.questions[royaleIndex];
  const progress = `${royaleIndex + 1} / ${quest.questions.length}`;
  return `
    <div class="royale-shell">
      <div class="royale-topline"><span>MCQ Challenge · Round ${progress}</span><span>${royaleScore} correct</span></div>
      ${question.stimulus ? `<aside class="stimulus-card"><span>Evidence packet</span><blockquote>${text(question.stimulus)}</blockquote></aside>` : ''}
      <h3 class="question-prompt">${text(question.prompt)}</h3>
      <div class="answer-list" id="answer-list">
        ${question.choices.map((choice, index) => `<button class="answer-choice" data-answer-index="${index}"><span>${String.fromCharCode(65 + index)}</span>${text(choice)}</button>`).join('')}
      </div>
      <div id="royale-feedback" class="quest-feedback" hidden></div>
      <div class="royale-footer"><span>APUSH skill: ${text(question.skill)}</span><span>Read → claim → eliminate distractors.</span></div>
    </div>`;
}

function renderVocabQuest(quest) {
  const card = quest.cards[vocabIndex];
  return `
    <div class="vocab-shell">
      <div class="royale-topline"><span>Vocabulary Challenge · ${vocabIndex + 1} / ${quest.cards.length}</span><span>${vocabScore} recovered</span></div>
      <article class="wanted-card">
        <div class="wanted-stamp">WANTED CONCEPT</div>
        <p class="eyebrow">Unit 1 vocabulary</p>
        <h3>${text(card.term)}</h3>
        <p>${text(card.definition)}</p>
        <div class="false-trail"><b>False trail:</b> ${text(card.misconception)}</div>
      </article>
      <h3 class="question-prompt">${text(card.application)}</h3>
      <div class="answer-list" id="answer-list">
        ${card.choices.map((choice, index) => `<button class="answer-choice" data-answer-index="${index}"><span>${String.fromCharCode(65 + index)}</span>${text(choice)}</button>`).join('')}
      </div>
      <div id="vocab-feedback" class="quest-feedback" hidden></div>
    </div>`;
}

function renderBossQuest(quest) {
  const variant = quest.variants[activeBossMode];
  const saved = state.attempts[`${quest.id}-${activeBossMode}`]?.response || {};
  return `
    <div class="boss-shell">
      <div class="boss-tabs">${Object.entries(quest.variants).map(([id, item]) => `<button class="boss-tab ${id === activeBossMode ? 'active' : ''}" data-boss-mode="${id}">${text(item.label)} <span>${RUBRICS[item.rubric].total} pts</span></button>`).join('')}</div>
      <div class="boss-brief">
        <p class="eyebrow">${text(variant.label)} · Official AP rubric</p>
        <h3>${text(variant.prompt)}</h3>
        <p>Use this as an original, AP-style practice task. The prompt and questions in this project are teacher-created—not released College Board questions.</p>
      </div>
      ${activeBossMode === 'dbq' ? renderDbqDocuments(variant.documents) : ''}
      ${activeBossMode === 'leq' ? `<div class="planning-grid">${variant.planningPrompts.map((prompt, index) => `<label><span>Planning move ${index + 1}</span><textarea name="plan-${index}" rows="3" form="boss-form" placeholder="${text(prompt)}">${text(saved[`plan-${index}`] || '')}</textarea></label>`).join('')}</div>` : ''}
      <form id="boss-form" class="boss-form">
        ${activeBossMode === 'saq' ? variant.parts.map((part) => `<label class="saq-field"><span><b>${part.label}</b>${text(part.text)}</span><textarea name="${part.label.toLowerCase()}" rows="5" placeholder="Respond directly, with specific historical evidence.">${text(saved[part.label.toLowerCase()] || '')}</textarea></label>`).join('') : `<label class="writing-field"><span>Your historical argument</span><textarea name="essay" rows="16" placeholder="Write your complete response here. Use the rubric checklist while you draft.">${text(saved.essay || '')}</textarea></label>`}
        <div class="quest-actions"><button type="submit" class="primary-button">Save writing draft</button><button type="button" class="text-button" data-open-rubric="${variant.rubric}">Open ${RUBRICS[variant.rubric].total}-point rubric →</button></div>
      </form>
      ${state.teacherMode ? renderTeacherScorecard(quest.id, activeBossMode, variant.rubric) : `<div class="teacher-gate">Teacher scoring view is off. Turn it on in the left rail to use the rubric point checkboxes in this demo.</div>`}
      <div id="boss-feedback" class="quest-feedback" hidden></div>
    </div>`;
}

function renderDbqDocuments(documents) {
  return `<details class="dbq-documents" open><summary>Open the document packet · 7 documents</summary><div class="dbq-document-grid">${documents.map((doc) => `<article><span>${text(doc.label)}</span><h4>${text(doc.source.title)} (${text(doc.source.date)})</h4><p>${text(doc.source.author)}</p><blockquote>${text(doc.note)}</blockquote><a href="${text(doc.source.sourceUrl)}" target="_blank" rel="noreferrer">Citation record ↗</a></article>`).join('')}</div></details>`;
}

function renderTeacherScorecard(questId, mode, rubricId) {
  const scoreKey = `${questId}-${mode}`;
  const saved = state.attempts[scoreKey]?.teacherScore || {};
  const rubric = RUBRICS[rubricId];
  const total = rubric.criteria.reduce((sum, criterion) => sum + (saved[criterion.id] ? criterion.points : 0), 0);
  return `
    <aside class="teacher-scorecard" data-score-key="${scoreKey}" data-rubric-id="${rubricId}">
      <div><p class="eyebrow">Teacher scoring panel</p><h3>${text(rubric.title)} <span id="score-total">${total}/${rubric.total}</span></h3><p>${text(rubric.officialNote)}</p></div>
      ${rubric.criteria.map((criterion) => `<label class="rubric-check"><input type="checkbox" data-rubric-point="${criterion.id}" ${saved[criterion.id] ? 'checked' : ''}/><span><b>${criterion.label} · ${criterion.points} pt${criterion.points > 1 ? 's' : ''}</b>${text(criterion.description)}</span></label>`).join('')}
    </aside>`;
}

function openRubricIndex() {
  openOverlay();
  const existing = $('#modal-layer');
  existing.innerHTML = `
    <article class="small-modal">
      <header class="quest-modal-header"><div><p class="eyebrow">Official scoring structures</p><h2>APUSH Writing Rubrics</h2><p>Every SAQ/LEQ/DBQ boss-mode task uses the real 3-, 6-, and 7-point AP History structures.</p></div><button class="close-button" data-close-modal>×</button></header>
      <div class="rubric-gallery">
        ${RUBRIC_ASSETS.map((asset) => `
          <button class="rubric-card" data-open-rubric="${asset.id}" type="button">
            <div class="rubric-card-media ${asset.type}">
              ${asset.type === 'pdf'
                ? `<object data="${asset.file}" type="application/pdf" aria-label="${text(asset.title)} preview"></object><span class="rubric-card-fallback">PDF preview</span>`
                : `<img src="${asset.file}" alt="${text(asset.title)} preview" loading="lazy" />`}
            </div>
            <div class="rubric-card-body">
              <div><b>${text(asset.title)}</b><span>${asset.id.toUpperCase()}</span></div>
              <p>${text(asset.note)}</p>
              <a href="${asset.file}" target="_blank" rel="noreferrer" class="text-button">Open full rubric file ↗</a>
            </div>
          </button>`).join('')}
      </div>
      <div class="rubric-index">${Object.entries(RUBRICS).map(([id, rubric]) => `<button data-open-rubric="${id}"><span>${rubric.total}</span><div><b>${text(rubric.title)}</b><small>${text(rubric.officialNote)}</small></div><em>View →</em></button>`).join('')}</div>
    </article>`;
  existing.classList.add('open');
  existing.setAttribute('aria-hidden', 'false');
}

function openRubric(rubricId) {
  const rubric = RUBRICS[rubricId];
  openOverlay();
  const existing = $('#modal-layer');
  existing.innerHTML = `
    <article class="rubric-modal">
      <header class="quest-modal-header"><div><p class="eyebrow">Official scoring structure</p><h2>${text(rubric.title)} <span>${rubric.total} points</span></h2><p>${text(rubric.officialNote)}</p></div><button class="close-button" data-close-modal>×</button></header>
      <div class="rubric-preview-strip">
        ${RUBRIC_ASSETS.map((asset) => `
          <figure class="rubric-preview ${asset.id === rubricId ? 'active' : ''}">
            ${asset.type === 'pdf'
              ? `<object data="${asset.file}" type="application/pdf" aria-label="${text(asset.title)} preview"></object>`
              : `<img src="${asset.file}" alt="${text(asset.title)}" loading="lazy" />`}
            <figcaption>${text(asset.title)}</figcaption>
          </figure>`).join('')}
      </div>
      <div class="rubric-list">${rubric.criteria.map((criterion) => `<article><div><b>${text(criterion.label)}</b><span>${criterion.points} pt${criterion.points > 1 ? 's' : ''}</span></div><p>${text(criterion.description)}</p></article>`).join('')}</div>
      <footer class="rubric-footer"><a href="${RUBRIC_ASSETS.find((item) => item.id === rubricId)?.file || '#'}" target="_blank" rel="noreferrer">Open full rubric file in a new tab ↗</a><br />Rubric wording is summarized for interface use. The package documentation links directly to the official APUSH Course and Exam Description, effective Fall 2026.</footer>
    </article>`;
      existing.classList.add('open');
      existing.setAttribute('aria-hidden', 'false');
}

function bindQuestEvents() {
  const hippForm = $('#hipp-form');
  if (hippForm) {
    hippForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const response = Object.fromEntries(new FormData(hippForm).entries());
      state.attempts[activeQuest.id] = { response, savedAt: new Date().toISOString() };
      const assignmentId = getAssignmentIdForQuest(activeQuest.id);
      if (assignmentId) {
        try {
          await dataService.saveStudentDraft({ assignmentId, answers: response });
        } catch (error) {
          console.warn('Unable to save HIPP draft via data service', error);
        }
      }
      const complete = Object.values(response).every((value) => value.trim().length >= 25);
      if (complete) completeQuest(activeQuest, 'HIPP analysis saved. You earned practice XP for a complete, evidence-ready attempt.', { sourcing: 1, evidence: 1 });
      else {
        saveState(state);
        showFeedback('#hipp-feedback', 'Save recorded. Add at least one specific source detail and explanation to each HIPP category before claiming XP.', 'notice');
      }
    });
    $('[data-show-model]')?.addEventListener('click', () => showFeedback('#hipp-feedback', activeQuest.model, 'model'));
  }

  $$('.answer-choice').forEach((button) => button.addEventListener('click', () => handleChoice(Number(button.dataset.answerIndex))));

  $$('[data-boss-mode]').forEach((button) => button.addEventListener('click', () => {
    activeBossMode = button.dataset.bossMode;
    renderActiveQuest();
  }));

  const bossForm = $('#boss-form');
  if (bossForm) {
    bossForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const response = Object.fromEntries(new FormData(bossForm).entries());
      if (activeBossMode === 'leq') {
        $$('.planning-grid textarea').forEach((field) => { response[field.name] = field.value; });
      }
      state.attempts[`${activeQuest.id}-${activeBossMode}`] = { ...(state.attempts[`${activeQuest.id}-${activeBossMode}`] || {}), response, savedAt: new Date().toISOString() };
      const assignmentId = getAssignmentIdForQuest(activeQuest.id);
      if (assignmentId) {
        try {
          await dataService.saveStudentDraft({ assignmentId, answers: response });
        } catch (error) {
          console.warn('Unable to save boss draft via data service', error);
        }
      }
      saveState(state);
      const responseLength = Object.values(response).join('').trim().length;
      if (responseLength > 70) completeQuest(activeQuest, `${activeQuest.variants[activeBossMode].label} draft saved. Use the official ${RUBRICS[activeQuest.variants[activeBossMode].rubric].total}-point rubric to revise before scoring.`, { argument: 1, reasoning: 1 });
      else showFeedback('#boss-feedback', 'Draft saved. Add a complete response before earning practice XP.', 'notice');
    });
  }

  $$('[data-open-rubric]').forEach((button) => button.addEventListener('click', () => openRubric(button.dataset.openRubric)));

  $$('.teacher-scorecard input[type="checkbox"]').forEach((checkbox) => checkbox.addEventListener('change', saveTeacherScore));
}

function handleChoice(answerIndex) {
  const isRoyale = activeQuest.mode === 'royale';
  const item = isRoyale ? activeQuest.questions[royaleIndex] : activeQuest.cards[vocabIndex];
  const correct = answerIndex === item.answer;
  const attemptKey = activeQuest.id;
  const attemptState = state.attempts[attemptKey] || { choiceLog: [] };

  attemptState.choiceLog = Array.isArray(attemptState.choiceLog) ? attemptState.choiceLog : [];
  attemptState.choiceLog.push({
    mode: activeQuest.mode,
    round: isRoyale ? royaleIndex + 1 : vocabIndex + 1,
    selectedIndex: answerIndex,
    correctIndex: item.answer,
    correct,
    prompt: item.prompt || item.application || '',
    savedAt: new Date().toISOString()
  });

  if (!isRoyale) {
    attemptState.vocabMastery = attemptState.vocabMastery || {};
    attemptState.vocabMastery[item.term] = {
      mastered: correct,
      selectedIndex: answerIndex,
      correctIndex: item.answer,
      savedAt: new Date().toISOString()
    };
  }

  state.attempts[attemptKey] = attemptState;
  saveState(state);

  if (correct) {
    if (isRoyale) royaleScore += 1;
    else vocabScore += 1;
  }
  $$('.answer-choice').forEach((button, index) => {
    button.disabled = true;
    if (index === item.answer) button.classList.add('correct');
    if (index === answerIndex && !correct) button.classList.add('incorrect');
  });
  const feedbackSelector = isRoyale ? '#royale-feedback' : '#vocab-feedback';
  const nextIndex = isRoyale ? royaleIndex + 1 : vocabIndex + 1;
  const total = isRoyale ? activeQuest.questions.length : activeQuest.cards.length;
  const rationale = isRoyale ? item.rationale : `Correct answer: ${item.choices[item.answer]}. ${item.misconception}`;
  const buttonLabel = nextIndex < total ? 'Next round →' : 'Complete expedition';
  showFeedback(feedbackSelector, `<strong>${correct ? 'Evidence secured.' : 'Recheck the evidence.'}</strong> ${text(rationale)}<button class="primary-button feedback-next" data-next-choice>${buttonLabel}</button>`, correct ? 'correct' : 'incorrect', true);
  $('[data-next-choice]')?.addEventListener('click', () => {
    if (nextIndex < total) {
      if (isRoyale) royaleIndex += 1;
      else vocabIndex += 1;
      renderActiveQuest();
    } else {
      const score = isRoyale ? royaleScore : vocabScore;
      const scoreText = `${score}/${total}`;
      completeQuest(activeQuest, `${isRoyale ? 'MCQ Challenge' : 'Vocabulary Challenge'} complete: ${scoreText}. Review each rationale in the archive, then replay for mastery.`, isRoyale ? { evidence: score, reasoning: 1 } : { context: score, evidence: 1 });
    }
  });
}

function saveTeacherScore(event) {
  const scorecard = event.target.closest('.teacher-scorecard');
  const scoreKey = scorecard.dataset.scoreKey;
  const rubric = RUBRICS[scorecard.dataset.rubricId];
  const teacherScore = {};
  $$('[data-rubric-point]', scorecard).forEach((input) => { teacherScore[input.dataset.rubricPoint] = input.checked; });
  state.attempts[scoreKey] = { ...(state.attempts[scoreKey] || {}), teacherScore };
  saveState(state);
  const total = rubric.criteria.reduce((sum, criterion) => sum + (teacherScore[criterion.id] ? criterion.points : 0), 0);
  $('#score-total', scorecard).textContent = `${total}/${rubric.total}`;
}

function completeQuest(quest, message, skillGains = {}) {
  const questDefinition = createQuestDefinition(quest, skillGains);
  const completion = awardQuestCompletion(studentProgress, questDefinition, {
    badges: ALL_STARTER_BADGES,
    config: progressionConfig,
    completionMetadata: skillGains
  });
  saveStudentProgress(completion.progress);
  const firstCompletion = completion.awarded;

  state.completed[quest.id] = true;
  if (firstCompletion) {
    Object.entries(skillGains).forEach(([skill, gain]) => { state.skills[skill] = (state.skills[skill] || 0) + gain; });
  }
  saveState(state);
  logMissionEvent(
    `${quest.title} completed`,
    firstCompletion
      ? `Awarded ${questDefinition.xpReward} XP and ${questDefinition.tokenReward} Archive Tokens.`
      : 'Replay recorded. First-completion rewards were already claimed.',
    'completion'
  );
  updateHud();
  renderMap();
  setDispatch(quest.title, message);

  const badgeMessages = completion.badgeAwards
    .map((award) => {
      const badge = ALL_STARTER_BADGES.find((item) => item.id === award.badgeId);
      if (!badge) return '';
      if (award.tierId) return `${badge.name} (${award.tierId.toUpperCase()})`;
      return `${badge.name}`;
    })
    .filter(Boolean);

  const rewardSummary = firstCompletion
    ? `<strong>+${questDefinition.xpReward} Historian XP · +${questDefinition.tokenReward} Archive Tokens</strong>`
    : 'First-completion rewards already claimed. Progress updates still saved.';
  const feedback = $('#hipp-feedback') || $('#boss-feedback') || $('#royale-feedback') || $('#vocab-feedback');
  if (feedback) {
    showFeedback(
      feedback,
      `${message} ${rewardSummary}${badgeMessages.length ? `<br /><strong>Badges:</strong> ${text(badgeMessages.join(', '))}` : ''}`,
      firstCompletion ? 'correct' : 'notice',
      true
    );
  }
}

function showFeedback(selector, message, mode = 'notice', allowHtml = false) {
  const element = $(selector);
  if (!element) return;
  element.hidden = false;
  element.className = `quest-feedback ${mode}`;
  element.innerHTML = allowHtml ? message : text(message);
}

function openInventory() {
  const inventoryRows = studentProgress.inventoryItemIds.map((itemId) => STARTER_STORE_ITEMS.find((item) => item.id === itemId)).filter(Boolean);
  const equippedIdSet = new Set(Object.values(studentProgress.equipped || {}).filter(Boolean));
  openOverlay();
  $('#modal-layer').innerHTML = `
    <article class="small-modal"><header class="quest-modal-header"><div><p class="eyebrow">Founder inventory</p><h2>Field Gear & Keepsakes</h2><p>Inventory stays empty until you purchase items in the Store.</p></div><button class="close-button" data-close-modal>×</button></header><div class="inventory-grid">${inventoryRows.map((item) => `<article><span>◌</span><h3>${text(item.name)}</h3><p>${text(item.description)}</p><button class="text-button" data-teacher-action="equip-store-item" data-item-id="${item.id}" type="button">${equippedIdSet.has(item.id) ? 'Equipped' : 'Equip'}</button></article>`).join('') || '<article><span>○</span><h3>No items yet</h3><p>Buy cosmetics from the Store to populate inventory.</p></article>'}</div></article>`;
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
}

function getTierProgressText(badge, visual) {
  if (badge.type !== 'tiered') return badge.criteriaText || 'Complete linked Unit 1 activities to unlock.';
  const currentTierIndex = (badge.tiers || []).findIndex((tier) => tier.id === visual.tier);
  const nextTier = badge.tiers?.[currentTierIndex + 1] || badge.tiers?.[0];
  if (!nextTier) return 'Gold earned.';
  const metric = nextTier.conditions?.[0]?.metric;
  const value = Number(nextTier.conditions?.[0]?.value || 0);
  const current = Number(visual.metrics?.[metric] || 0);
  return `${nextTier.label} Progress: ${current} / ${value}`;
}

function openBadgeCase() {
  openOverlay();
  const assessmentCards = GENERAL_BADGES.map((badge) => {
    const visual = getBadgeVisualState(studentProgress, badge);
    const cardStatusClass = visual.status === 'locked'
      ? 'qp-badge-card--locked'
      : visual.status === 'active'
        ? 'qp-badge-card--active'
        : 'qp-badge-card--earned';
    const awarded = new Set(studentProgress.badgeProgress?.[badge.id]?.awardedTiers || []);
    return `
      <article class="qp-card qp-badge-card ${cardStatusClass}" aria-label="${text(badge.name)} status ${text(visual.status)}">
        <img src="${text(badge.assetPath)}" alt="${text(badge.name)} ${text(visual.status)} badge" />
        <div>
          <p class="qp-badge-label">Assessment Mastery</p>
          <h3>${text(badge.name)}</h3>
          <p>${text(getTierProgressText(badge, visual))}</p>
          <div class="qp-tier-track" aria-hidden="true">
            <span class="qp-tier-dot qp-tier-dot--bronze ${awarded.has('bronze') ? 'is-earned' : ''}"></span>
            <span class="qp-tier-dot qp-tier-dot--silver ${awarded.has('silver') ? 'is-earned' : ''}"></span>
            <span class="qp-tier-dot qp-tier-dot--gold ${awarded.has('gold') ? 'is-earned' : ''}"></span>
          </div>
        </div>
      </article>`;
  }).join('');

  const unitCards = UNIT_1_BADGES.map((badge) => {
    const visual = getBadgeVisualState(studentProgress, badge);
    const cardStatusClass = visual.status === 'locked' ? 'qp-badge-card--locked' : 'qp-badge-card--earned';
    return `
      <article class="qp-card qp-badge-card ${cardStatusClass}" aria-label="${text(badge.name)} status ${text(visual.status)}">
        <img src="${text(badge.assetPath)}" alt="${text(badge.name)} ${text(visual.status)} badge" />
        <div>
          <p class="qp-badge-label">Unit Collection</p>
          <h3>${text(badge.name)}</h3>
          <p>${text(visual.status === 'locked' ? (badge.criteriaText || 'Locked') : 'Earned')}</p>
        </div>
      </article>`;
  }).join('');

  $('#modal-layer').innerHTML = `
    <article class="small-modal">
      <header class="quest-modal-header">
        <div>
          <p class="eyebrow">Badge Case</p>
          <h2>Historian Badge Collections</h2>
          <p>Assessment mastery tiers and Unit 1 collection seals are tracked separately from grades.</p>
        </div>
        <button class="close-button" data-close-modal>×</button>
      </header>
      <div class="quest-modal-body">
        <h3>Assessment Mastery Badges</h3>
        <div class="qp-badge-case-grid">${assessmentCards}</div>
        <h3 style="margin-top:18px;">Unit Collection Badges</h3>
        <div class="qp-badge-case-grid">${unitCards}</div>
      </div>
    </article>`;
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
}

function openStore() {
  openOverlay();
  const ownedSet = new Set(studentProgress.inventoryItemIds || []);
  const items = STARTER_STORE_ITEMS.map((item) => {
    const owns = ownedSet.has(item.id);
    const hasBadge = !item.requiresBadgeId || studentProgress.earnedBadgeIds.includes(item.requiresBadgeId);
    const canAfford = studentProgress.archiveTokens >= item.price;
    const lockedReason = !hasBadge ? `Requires ${item.requiresBadgeId}` : !canAfford ? 'Not enough Archive Tokens' : '';
    return `
      <article class="qp-card qp-quest-card" aria-label="Store item ${text(item.name)}">
        <p class="qp-activity-type">${text(item.category)} · ${text(item.rarity)}</p>
        <h3>${text(item.name)}</h3>
        <p>${text(item.description)}</p>
        <div class="qp-quest-meta">
          <span class="qp-tag">Price: ${item.price} Tokens</span>
          <span class="qp-tag">${item.cosmeticOnly ? 'Cosmetic' : 'Ungraded Tool'}</span>
          ${item.requiresBadgeId ? `<span class="qp-tag">Badge: ${text(item.requiresBadgeId)}</span>` : ''}
        </div>
        <div class="quest-actions" style="margin-top:10px;">
          <button class="primary-button" ${owns ? 'disabled' : ''} data-teacher-action="buy-store-item" data-item-id="${item.id}" type="button">${owns ? 'Owned' : 'Purchase'}</button>
          ${lockedReason ? `<span class="qp-level-meta">${text(lockedReason)}</span>` : ''}
        </div>
      </article>`;
  }).join('');

  $('#modal-layer').innerHTML = `
    <article class="small-modal">
      <header class="quest-modal-header">
        <div>
          <p class="eyebrow">Archive Store</p>
          <h2>Spend Archive Tokens</h2>
          <p>Archive Token balance: ${studentProgress.archiveTokens}. Purchases never reduce Historian XP.</p>
        </div>
        <button class="close-button" data-close-modal>×</button>
      </header>
      <div class="quest-modal-body">
        <div class="qp-badge-case-grid">${items}</div>
      </div>
    </article>`;
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
}

function openLeaderboard() {
  openOverlay();
  const complete = studentProgress.completedQuestIds.length;
  $('#modal-layer').innerHTML = `
    <article class="small-modal"><header class="quest-modal-header"><div><p class="eyebrow">Cooperative realm progress</p><h2>Historian Journey Ledger</h2><p>No public academic ranking: this panel emphasizes milestones, Archive Token transactions, and private skill growth.</p></div><button class="close-button" data-close-modal>×</button></header><div class="realm-grid"><article><span>Class archive goal</span><strong>42 / 80</strong><p>source investigations recorded</p></article><article><span>Your Unit 1 quests</span><strong>${complete} / 5</strong><p>vertical-slice quests completed</p></article><article><span>Archive Tokens</span><strong>${studentProgress.archiveTokens}</strong><p>current spendable balance</p></article></div><div class="cooperative-note">Historian XP is permanent progress. Archive Tokens are spendable and tracked in transaction history.</div></article>`;
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
}

function openSkills() {
  openOverlay();
  $('#modal-layer').innerHTML = `
    <article class="small-modal"><header class="quest-modal-header"><div><p class="eyebrow">Historian profile</p><h2>Skill Ledger</h2><p>These practice meters track demonstrated work and revision; they do not modify graded answers.</p></div><button class="close-button" data-close-modal>×</button></header><div class="skills-large">${SKILLS.map((skill) => { const current = Math.min(20, skill.value + (state.skills[skill.id] || 0)); return `<article><span>${skill.icon}</span><div><h3>${text(skill.label)}</h3><p>${current}/20</p><div class="skill-track"><span style="width:${(current / 20) * 100}%"></span></div></div></article>`; }).join('')}</div></article>`;
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
}

function openHelp() {
  openOverlay();
  $('#modal-layer').innerHTML = `
    <article class="small-modal"><header class="quest-modal-header"><div><p class="eyebrow">Quest guide</p><h2>How the expedition works</h2></div><button class="close-button" data-close-modal>×</button></header><div class="help-grid"><article><span class="mode-icon hipp">◈</span><h3>HIPP Source Analysis</h3><p>Analyze historical situation, intended audience, purpose, and point of view with evidence.</p></article><article><span class="mode-icon royale">⌁</span><h3>MCQ Challenge</h3><p>Practice AP-style stimulus questions, then study each rationale and distractor.</p></article><article><span class="mode-icon vocab">✣</span><h3>Vocabulary Challenge</h3><p>Define concepts, see them in context, and distinguish them from false trails.</p></article><article><span class="mode-icon boss">✦</span><h3>DBQ Boss Battle</h3><p>Draft SAQs, LEQs, and DBQs using the actual 3-, 6-, and 7-point AP scoring structures.</p></article></div></article>`;
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
}

async function refreshStudentFeed() {
  try {
    studentQuestFeed = await dataService.getStudentQuestFeed({
      classId: studentClassId,
      studentId: QUEST_BACKEND_CONFIG.demoStudentId || 'student-aria'
    });

    const studioRows = await dataService.getTeacherQuestStudio({ classId: studentClassId });
    const studioVisibleRows = studioRows.filter((row) => String(row.accessMode || '').toLowerCase() !== 'archived');

    const missingQuestIds = [...new Set(
      [...studentQuestFeed.map((entry) => entry.quest?.id || entry.questId), ...studioVisibleRows.map((row) => row.id)]
        .filter(Boolean)
        .filter((questId) => !getQuest(questId))
    )];

    if (!missingQuestIds.length) {
      serviceCatalogQuests = [];
      return;
    }

    const details = await Promise.all(
      missingQuestIds.map(async (questId) => {
        try {
          return await dataService.getTeacherQuest({ questId });
        } catch (error) {
          console.warn(`Unable to hydrate service quest ${questId}`, error);
          return null;
        }
      })
    );

    const studioById = new Map(studioVisibleRows.map((row) => [row.id, row]));
    serviceCatalogQuests = details
      .filter(Boolean)
      .map((detail) => buildServiceQuestRuntimeFromContent({ ...detail.quest, ...(studioById.get(detail.quest.id) || {}) }, detail.published?.content || detail.draft?.content || {}));
  } catch (error) {
    console.warn('Unable to load student quest feed from data service', error);
    studentQuestFeed = [];
    serviceCatalogQuests = [];
  }
}

async function renderStudentBulletin() {
  const list = $('#student-bulletin-list');
  if (!list) return;
  try {
    const announcements = await dataService.listAnnouncements({ classId: studentClassId });
    list.innerHTML = announcements.slice(0, 3).map((item) => `
      <article class="bulletin-item">
        <h3>${text(item.title)}</h3>
        <p>${text(item.body)}</p>
        <small>${text(formatWhen(item.publishAt))}</small>
      </article>
    `).join('');
    if (!announcements.length) list.innerHTML = '<p class="empty-note">No current announcements.</p>';
  } catch {
    list.innerHTML = '<p class="empty-note">Announcements unavailable in this mode.</p>';
  }
}

async function hydrateTeacherSnapshots() {
  teacherClasses = await dataService.getTeacherClasses();
  if (!teacherClasses.length) return;
  if (!teacherActiveClassId || !teacherClasses.some((row) => row.id === teacherActiveClassId)) {
    teacherActiveClassId = teacherClasses[0].id;
  }
  [teacherDashboardSnapshot, teacherStudioSnapshot] = await Promise.all([
    dataService.getTeacherDashboard({ classId: teacherActiveClassId }),
    dataService.getTeacherQuestStudio({ classId: teacherActiveClassId })
  ]);
}

function teacherClassSelect() {
  if (!teacherClasses.length) return '<span>No classes</span>';
  return `<label class="teacher-inline-label">Class
    <select id="teacher-class-select">${teacherClasses.map((klass) => `<option value="${klass.id}" ${klass.id === teacherActiveClassId ? 'selected' : ''}>${text(klass.periodLabel)} · ${text(klass.name)}</option>`).join('')}</select>
  </label>`;
}

function renderTeacherCommandCenterSection() {
  const snapshot = teacherDashboardSnapshot || {};
  return `
    <section class="teacher-panel" data-teacher-section="command-center">
      <header><h3>Command Center</h3><p>Live snapshot for class operations and grading queue.</p></header>
      <div class="teacher-kpi-grid">
        <article><span>Students</span><strong>${snapshot.studentCount || 0}</strong></article>
        <article><span>Ungraded</span><strong>${snapshot.ungradedCount || 0}</strong></article>
        <article><span>Completion</span><strong>${snapshot.completionPct || 0}%</strong></article>
        <article><span>Needs attention</span><strong>${snapshot.needsAttention || 0}</strong></article>
      </div>
      <div class="teacher-activity-list">${(snapshot.recentActivity || []).map((event) => `<div>${teacherBadge(event.type)}<p>${text(event.message)}</p><small>${text(formatWhen(event.at))}</small></div>`).join('') || '<p class="empty-note">No activity yet.</p>'}</div>
    </section>`;
}

function renderTeacherQuestStudioSection() {
  return `
    <section class="teacher-panel" data-teacher-section="quest-studio">
      <header>
        <h3>Quest Studio</h3>
        <p>Edit release states, publish drafts, and manage versions.</p>
        <div class="teacher-actions-inline"><button data-teacher-action="open-quest-builder">Add Quest</button></div>
      </header>
      <div class="teacher-table-wrap">
        <table class="teacher-table">
          <thead><tr><th>Quest</th><th>Type</th><th>Access</th><th>Versions</th><th>Actions</th></tr></thead>
          <tbody>${teacherStudioSnapshot.map((quest) => `<tr>
            <td><b>${text(quest.title)}</b><small>${text(quest.slug)}</small></td>
            <td>${text(formatQuestStudioTypeLabel(quest))}</td>
            <td>${teacherBadge(quest.accessMode)}</td>
            <td>v${quest.latestVersion} (${quest.versionCount})</td>
            <td class="teacher-actions-inline">
              <button data-teacher-action="edit-quest" data-quest-id="${quest.id}">Edit</button>
              <button data-teacher-action="set-access" data-quest-id="${quest.id}" data-access="available">Unlock</button>
              <button data-teacher-action="set-access" data-quest-id="${quest.id}" data-access="locked">Lock</button>
              <button data-teacher-action="duplicate-quest" data-quest-id="${quest.id}">Duplicate</button>
              <button data-teacher-action="archive-quest" data-quest-id="${quest.id}">Archive</button>
            </td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </section>`;
}

function renderTeacherSubmissionArchiveSection(submissions) {
  return `
    <section class="teacher-panel" data-teacher-section="submission-archive">
      <header><h3>Submission Archive</h3><p>Open any entry in the grading interface that mirrors boss battle rubric workflows.</p></header>
      <div class="teacher-table-wrap">
        <table class="teacher-table">
          <thead><tr><th>Student</th><th>Quest</th><th>Status</th><th>Score</th><th>Action</th></tr></thead>
          <tbody>${submissions.map((submission) => `<tr>
            <td>${text(submission.student?.displayName || 'Student')}<small>${text(submission.classPeriod || '')}</small></td>
            <td>${text(submission.quest?.title || submission.questId)}</td>
            <td>${teacherBadge(submission.status)}</td>
            <td>${submission.score ?? '-'} / ${submission.maxScore ?? '-'}</td>
            <td><button data-teacher-action="grade-submission" data-submission-id="${submission.id}">Open Grader</button></td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </section>`;
}

function renderTeacherUnitControlSection(units) {
  return `
    <section class="teacher-panel" data-teacher-section="unit-control">
      <header><h3>Unit Control</h3><p>Set active unit and move prior content into review state.</p></header>
      <div class="teacher-unit-grid">${units.map((unit) => `<article>
        <h4>${text(unit.title)}</h4>
        <p>${text(unit.subtitle || '')}</p>
        ${teacherBadge(unit.state)}
        <div class="teacher-actions-inline">
          <button data-teacher-action="set-unit-state" data-unit-id="${unit.id}" data-unit-state="active">Set Active</button>
          <button data-teacher-action="set-unit-state" data-unit-id="${unit.id}" data-unit-state="review_only">Review</button>
          <button data-teacher-action="set-unit-state" data-unit-id="${unit.id}" data-unit-state="archived">Archive</button>
        </div>
      </article>`).join('')}</div>
    </section>`;
}

function renderTeacherRosterSection(roster) {
  return `
    <section class="teacher-panel" data-teacher-section="roster">
      <header><h3>Roster & Classes</h3><p>Track student progress and class memberships.</p></header>
      <div class="teacher-roster-grid">${roster.map((student) => `<article>
        <h4>${text(student.displayName)}</h4>
        <p>${text(student.studentIdentifier || 'ID pending')}</p>
        <span>${text(student.profession || 'Founder')}</span>
      </article>`).join('')}</div>
    </section>`;
}

function renderTeacherAnalyticsSection(analytics) {
  return `
    <section class="teacher-panel" data-teacher-section="analytics">
      <header><h3>Historian Analytics</h3><p>Identify unfinished work and commonly missed criteria.</p></header>
      <div class="teacher-split-grid">
        <article>
          <h4>Completion Heatmap</h4>
          ${(analytics.completionByStudent || []).map((row) => `<div class="teacher-heat-row"><span>${text(row.studentName)}</span><b>${row.completionPct}%</b></div>`).join('') || '<p class="empty-note">No completion data.</p>'}
        </article>
        <article>
          <h4>Common Misses</h4>
          ${(analytics.commonMissedCriteria || []).map((row) => `<div class="teacher-heat-row"><span>${text(row.criterionKey)}</span><b>${row.count}</b></div>`).join('') || '<p class="empty-note">No rubric misses recorded.</p>'}
        </article>
      </div>
    </section>`;
}

function renderTeacherSettingsSection(announcements) {
  const configErrors = validateProgressionConfig(progressionConfig);
  const economyWarnings = calculateEconomyWarnings(progressionConfig);
  const levelState = getLevelState(studentProgress, progressionConfig);
  const recentTransactions = [...(studentProgress.transactions || [])].slice(-12).reverse();
  return `
    <section class="teacher-panel" data-teacher-section="settings">
      <header><h3>Teacher Settings</h3><p>Progression controls, reward economics, and student audit views. These controls do not affect graded rubric outcomes.</p></header>

      <form class="teacher-announcement-form" id="teacher-progression-config-form">
        <h4>Progression Level Scale</h4>
        ${renderProgressionConfigTable(progressionConfig.levels)}
        <label><input type="checkbox" name="mastery-enabled" ${progressionConfig.masteryGate?.enabled ? 'checked' : ''} /> Enable Master Historian Gate</label>
        <label>Mastery required badge ID<input name="mastery-required-badge" value="${text(progressionConfig.masteryGate?.requiredBadgeId || 'unit-9-master-seal')}" /></label>
        <label>Mastery message<textarea name="mastery-message" rows="2">${text(progressionConfig.masteryGate?.message || '')}</textarea></label>

        <h4>Reward Presets</h4>
        <div class="teacher-table-wrap">
          <table class="teacher-table">
            <thead><tr><th>Preset</th><th>XP</th><th>Archive Tokens</th></tr></thead>
            <tbody>
              ${['warmup', 'practice', 'core', 'major', 'boss', 'revision', 'optional'].map((key) => `<tr>
                <td>${text(progressionConfig.rewardPresets[key].label)}</td>
                <td><input type="number" min="0" max="100" name="${key}-xp" value="${Number(progressionConfig.rewardPresets[key].xp || 0)}" /></td>
                <td><input type="number" min="0" max="10" name="${key}-tokens" value="${Number(progressionConfig.rewardPresets[key].tokens || 0)}" /></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="teacher-actions-inline">
          <button type="submit">Save Progression Settings</button>
        </div>
      </form>

      <form class="teacher-announcement-form" id="teacher-manual-reward-form">
        <h4>Manual Student Awards</h4>
        <label>Historian XP Award<input type="number" min="0" name="manual-xp" value="0" /></label>
        <label>Archive Token Award<input type="number" min="0" name="manual-tokens" value="0" /></label>
        <label>Reason<textarea name="manual-reason" rows="2" required placeholder="Reason for adjustment"></textarea></label>
        <div class="teacher-actions-inline">
          <button type="submit">Apply Manual Award</button>
          <button type="button" data-teacher-action="progress-reset-confirm">Reset Student Progress (Test)</button>
        </div>
      </form>

      <form class="teacher-announcement-form" id="teacher-announcement-form">
        <h4>Class Announcements</h4>
        <label>Announcement title<input name="title" required placeholder="Friday DBQ launch" /></label>
        <label>Announcement body<textarea name="body" rows="3" required placeholder="Reminder and expectations..."></textarea></label>
        <div class="teacher-actions-inline">
          <button type="submit">Publish Announcement</button>
          <button type="button" data-teacher-action="export-csv">Export Grades CSV</button>
          <button type="button" data-teacher-action="exit-teacher">Exit Teacher Mode</button>
        </div>
      </form>

      <article>
        <h4>Validation & Guardrails</h4>
        <p>Current student: Level ${levelState.level} (${text(levelState.title)}), ${studentProgress.totalXp} XP, ${studentProgress.archiveTokens} Archive Tokens.</p>
        <ul>${configErrors.map((item) => `<li>${text(item)}</li>`).join('') || '<li>No level threshold errors.</li>'}</ul>
        <ul>${economyWarnings.map((item) => `<li>${text(item)}</li>`).join('') || '<li>No economy guardrail warnings.</li>'}</ul>
      </article>

      <article>
        <h4>Student Badge Progress Snapshot</h4>
        <div class="teacher-activity-list">${GENERAL_BADGES.map((badge) => {
          const visual = getBadgeVisualState(studentProgress, badge);
          const next = getBadgeMetricProgress(badge, visual.metrics || {});
          return `<div><span>${text(badge.shortName)}</span><p>${text(visual.status)}${next ? ` · ${next.tierLabel}: ${next.current}/${next.target}` : ''}</p><small>${text((studentProgress.badgeProgress?.[badge.id]?.awardedTiers || []).join(', ') || 'no tiers yet')}</small></div>`;
        }).join('')}</div>
      </article>

      <article>
        <h4>Recent Transaction History</h4>
        <div class="teacher-activity-list">${recentTransactions.map((txn) => `<div><span>${text(txn.type)}</span><p>${text(txn.reason || 'No reason')}</p><small>${text(txn.amount)} tokens · ${text(txn.xpAmount ?? 0)} xp · ${text(formatWhen(txn.createdAt))}</small></div>`).join('') || '<p class="empty-note">No transactions yet.</p>'}</div>
      </article>

      <div class="teacher-announcement-list">${announcements.map((item) => `<article><h4>${text(item.title)}</h4><p>${text(item.body)}</p><small>${text(formatWhen(item.publishAt))}</small></article>`).join('') || '<p class="empty-note">No announcements yet.</p>'}</div>
    </section>`;
}

function openQuestTemplatePicker() {
  const templates = [
    { id: 'royale', label: 'MCQ' },
    { id: 'hipp', label: 'HIPP' },
    { id: 'vocab', label: 'VOCAB' },
    { id: 'boss-saq', label: 'SAQ' },
    { id: 'boss-leq', label: 'LEQ' },
    { id: 'boss-dbq', label: 'DBQ' }
  ];
  $('#modal-layer').innerHTML = `
    <article class="small-modal teacher-builder-picker-modal">
      <header class="quest-modal-header">
        <div>
          <p class="eyebrow">Quest Builder</p>
          <h2>Add New Quest</h2>
          <p>Choose an assessment label, then set title, question count, XP, and Archive Tokens.</p>
        </div>
        <button class="close-button" data-close-modal>×</button>
      </header>
      <div class="teacher-template-grid">
        ${templates.map((template) => `<button type="button" data-teacher-action="choose-quest-template" data-template-key="${template.id}"><b>${text(template.label)}</b><span>Assessment label</span></button>`).join('')}
      </div>
    </article>`;
  openOverlay();
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
}

function collectBuilderQuestionsFromForm(form, templateKey, assessmentLabel) {
  const entries = Object.fromEntries(new FormData(form).entries());
  const total = Math.max(1, Number(entries['question-count'] || entries.questionCount || 1));
  const style = getAssessmentStyle(assessmentLabel);
  const questions = [];
  for (let index = 0; index < total; index += 1) {
    const prompt = String(entries[`question-prompt-${index}`] || '').trim();
    if (!prompt) continue;
    const label = String(entries[`question-label-${index}`] || (style.mode === 'boss' ? `Part ${index + 1}` : `Q${index + 1}`));
    const maxPoints = Math.max(1, Number(entries[`question-max-${index}`] || 1));
    const base = {
      id: String(entries[`question-id-${index}`] || (style.mode === 'boss' ? `part-${index + 1}` : `q${index + 1}`)),
      label,
      prompt,
      maxPoints,
      responseType: style.mode === 'royale' || style.mode === 'vocab' ? 'multiple_choice' : 'textarea'
    };
    if (style.mode === 'royale' || style.mode === 'vocab') {
      base.choices = [0, 1, 2, 3].map((choiceIndex) => String(entries[`question-choice-${index}-${choiceIndex}`] || `Choice ${String.fromCharCode(65 + choiceIndex)}`));
      base.answer = Number(entries[`question-answer-${index}`] || 0);
    }
    questions.push(base);
  }

  if (questions.length) return questions;

  if (style.mode === 'vocab') return generatePlaceholderCards(total);
  if (style.mode === 'hipp') {
    return [
      { id: 'h', label: 'Historical Situation', prompt: 'Describe historical context.', responseType: 'textarea', maxPoints: 1 },
      { id: 'i', label: 'Intended Audience', prompt: 'Identify intended audience.', responseType: 'textarea', maxPoints: 1 },
      { id: 'p1', label: 'Purpose', prompt: 'Explain purpose.', responseType: 'textarea', maxPoints: 1 },
      { id: 'p2', label: 'Point of View', prompt: 'Explain point of view.', responseType: 'textarea', maxPoints: 1 }
    ];
  }
  if (style.mode === 'boss') {
    return Array.from({ length: total }, (_, index) => ({ id: `part-${index + 1}`, label: `Part ${index + 1}`, prompt: `Teacher-authored part ${index + 1}.`, responseType: 'textarea', maxPoints: 1 }));
  }
  return generatePlaceholderQuestions(total);
}

function extractBuilderDraftState(form) {
  const entries = Object.fromEntries(new FormData(form).entries());
  const templateKey = String(entries['template-key'] || form.dataset.templateKey || 'royale');
  const assessmentLabel = String(entries.assessmentLabel || 'MCQ').toUpperCase();
  const questions = collectBuilderQuestionsFromForm(form, templateKey, assessmentLabel);
  return {
    templateKey,
    assessmentLabel,
    title: String(entries.title || ''),
    subtitle: String(entries.subtitle || ''),
    xpReward: Number(entries.xpReward || 50),
    tokenReward: Number(entries.tokenReward || 2),
    questionCount: Math.max(1, Number(entries.questionCount || questions.length || 1)),
    instructions: String(entries.instructions || ''),
    sourceTitle: String(entries.sourceTitle || ''),
    sourceCitation: String(entries.sourceCitation || ''),
    sourceBody: String(entries.sourceBody || ''),
    sourceUrl: String(entries.sourceUrl || ''),
    questions
  };
}

async function openTeacherQuestBuilder({ questId = null, templateKey = 'royale', addQuestion = false, removeQuestionIndex = null, draftState = null } = {}) {
  let builder;
  const liveQuest = questId ? getQuest(questId) : null;
  if (draftState) {
    builder = { ...draftState, questions: Array.isArray(draftState.questions) ? draftState.questions : [] };
  } else if (liveQuest) {
    builder = buildDraftFromLiveQuest(questId) || normalizeTeacherQuestDraft({}, liveQuest);
    const meta = getQuestProgressionMeta(liveQuest);
    builder.assessmentLabel = normalizeAssessmentLabel(builder.assessmentLabel || meta.assessmentLabel || 'MCQ');
    builder.tokenReward = Number(builder.tokenReward || meta.tokenReward || 3);
    builder.questionCount = Math.max(1, Number(builder.questionCount || builder.questions?.length || meta.countValue || 1));
  } else if (questId) {
    const detail = await dataService.getTeacherQuest({ questId });
    builder = normalizeTeacherQuestDraft(detail.draft?.content || detail.published?.content || {}, detail.quest);
    builder.templateKey = builder.templateKey || templateKey;
    builder.assessmentLabel = normalizeAssessmentLabel(builder.assessmentLabel || 'MCQ');
    builder.tokenReward = Number(detail.published?.content?.rewards?.tokens || detail.draft?.content?.rewards?.tokens || builder.tokenReward || 3);
    builder.questionCount = Math.max(1, Number(builder.questionCount || builder.questions?.length || 1));
  } else {
    const selected = String(templateKey || 'royale').toLowerCase();
    const chosenTemplate = getTemplateById(selected.includes('boss') ? 'boss' : selected);
    builder = normalizeTeacherQuestDraft({
      identity: {
        title: chosenTemplate.defaults.title,
        subtitle: chosenTemplate.defaults.subtitle,
        questType: chosenTemplate.id,
        location: 'Atlantic World',
        xpReward: 30
      },
      assessments: [{
        label: chosenTemplate.defaults.assessmentLabel,
        instructions: chosenTemplate.defaults.instructions,
        questions: chosenTemplate.defaults.questions
      }],
      sources: []
    });
    builder.assessmentLabel = selected.includes('saq') ? 'SAQ'
      : selected.includes('leq') ? 'LEQ'
        : selected.includes('dbq') ? 'DBQ'
          : normalizeAssessmentLabel(builder.assessmentLabel || 'MCQ');
    builder.templateKey = selected.includes('boss') ? 'boss' : chosenTemplate.id;
    builder.tokenReward = Number(builder.tokenReward || 3);
    builder.questionCount = Math.max(1, Number(builder.questions?.length || 4));
    builder.xpReward = Number(builder.xpReward || 30);
  }

  builder.questions = Array.isArray(builder.questions) ? builder.questions : [];

  if (addQuestion) {
    const style = getAssessmentStyle(builder.assessmentLabel);
    const nextIndex = builder.questions.length + 1;
    builder.questions.push({
      id: style.mode === 'boss' ? `part-${nextIndex}` : `q${nextIndex}`,
      label: style.mode === 'boss' ? `Part ${nextIndex}` : `Q${nextIndex}`,
      prompt: '',
      choices: style.mode === 'royale' || style.mode === 'vocab' ? ['Choice A', 'Choice B', 'Choice C', 'Choice D'] : [],
      answer: 0,
      maxPoints: 1,
      responseType: style.mode === 'royale' || style.mode === 'vocab' ? 'multiple_choice' : 'textarea'
    });
  }

  if (Number.isInteger(removeQuestionIndex) && removeQuestionIndex >= 0) {
    builder.questions = builder.questions.filter((_, index) => index !== removeQuestionIndex);
  }

  if (!builder.questions.length) {
    const style = getAssessmentStyle(builder.assessmentLabel);
    builder.questions = style.mode === 'hipp'
      ? [
        { id: 'h', label: 'Historical Situation', prompt: '', choices: [], answer: 0, maxPoints: 1, responseType: 'textarea' },
        { id: 'i', label: 'Intended Audience', prompt: '', choices: [], answer: 0, maxPoints: 1, responseType: 'textarea' },
        { id: 'p1', label: 'Purpose', prompt: '', choices: [], answer: 0, maxPoints: 1, responseType: 'textarea' },
        { id: 'p2', label: 'Point of View', prompt: '', choices: [], answer: 0, maxPoints: 1, responseType: 'textarea' }
      ]
      : [{ id: 'q1', label: style.mode === 'boss' ? 'Part 1' : 'Q1', prompt: '', choices: style.mode === 'royale' || style.mode === 'vocab' ? ['Choice A', 'Choice B', 'Choice C', 'Choice D'] : [], answer: 0, maxPoints: 1, responseType: style.mode === 'royale' || style.mode === 'vocab' ? 'multiple_choice' : 'textarea' }];
  }

  const assessmentOptions = ['MCQ', 'SAQ', 'LEQ', 'DBQ', 'HIPP', 'VOCAB', 'TIMELINE', 'PRIMARY'];
  builder.questionCount = Math.max(1, Number(builder.questions.length || builder.questionCount || 1));
  const sourceOptions = SOURCES.map((source) => `<option value="${source.id}">${text(source.title)} (${text(source.date)})</option>`).join('');
  activeTeacherEditQuestId = questId;
  const builderMode = getAssessmentStyle(builder.assessmentLabel).mode;
  $('#modal-layer').innerHTML = `
    <article class="teacher-quest-builder-modal quest-modal ${builderMode}">
      <header class="quest-modal-header">
        <div>
          <p class="eyebrow">Quest Studio</p>
          <h2>${questId ? 'Edit Quest' : 'Build New Quest'}</h2>
          <p>Minimal editor: title, assessment label, question count, XP, and Archive Tokens.</p>
        </div>
        <button class="close-button" data-close-modal>×</button>
      </header>
      <form id="teacher-quest-builder-form" class="teacher-quest-builder-form" data-edit-quest-id="${questId || ''}" data-template-key="${builder.templateKey}">
        <input type="hidden" name="question-count" value="${builder.questions.length}" />
        <input type="hidden" name="template-key" value="${builder.templateKey}" />
        <section class="teacher-builder-block">
          <h3>Quest Identity</h3>
          <div class="teacher-builder-grid">
            <label>Title<input name="title" required value="${text(builder.title)}" /></label>
            <label>Assessment Label
              <select name="assessmentLabel">
                ${assessmentOptions.map((label) => `<option value="${label}" ${normalizeAssessmentLabel(builder.assessmentLabel) === label ? 'selected' : ''}>${label}</option>`).join('')}
              </select>
            </label>
            <label>Question Count<input type="number" min="1" max="30" name="questionCount" value="${Number(builder.questionCount || 4)}" /></label>
            <label>XP Reward<input type="number" min="0" name="xpReward" value="${Number(builder.xpReward || 30)}" /></label>
            <label>Archive Tokens<input type="number" min="0" max="10" name="tokenReward" value="${Number(builder.tokenReward || 3)}" /></label>
          </div>
          <div class="teacher-builder-grid">
            <label>Assessment Instructions<input name="instructions" value="${text(builder.instructions || '')}" /></label>
          </div>
          <p class="qp-level-meta">Teachers can drag map markers directly on the atlas after save/publish.</p>
        </section>

        <section class="teacher-builder-block">
          <h3>Primary Source Document</h3>
          <label>Load from existing library
            <select id="teacher-source-library-select">
              <option value="">Select a source to prefill</option>
              ${sourceOptions}
            </select>
          </label>
          <div class="teacher-builder-grid">
            <label>Source Title<input name="sourceTitle" value="${text(builder.sourceTitle || '')}" /></label>
            <label>Source Citation<input name="sourceCitation" value="${text(builder.sourceCitation || '')}" /></label>
          </div>
          <label>Source URL<input name="sourceUrl" value="${text(builder.sourceUrl || '')}" /></label>
          <label>Quoted / excerpted text<textarea name="sourceBody" rows="4">${text(builder.sourceBody || '')}</textarea></label>
        </section>

        <section class="teacher-builder-block">
          <div class="teacher-builder-block-head">
            <h3>Questions</h3>
            <button type="button" data-teacher-action="add-builder-question">Add Question</button>
          </div>
          <div class="teacher-builder-question-list">
            ${renderQuestionEditorRows(builder.questions, getAssessmentStyle(builder.assessmentLabel).mode === 'boss' ? 'boss' : getAssessmentStyle(builder.assessmentLabel).mode)}
          </div>
        </section>

        <footer class="teacher-builder-footer">
          <button type="submit" data-save-mode="draft">Save Draft</button>
          <button type="submit" data-save-mode="publish">Save and Publish</button>
          <button type="button" data-close-modal>Cancel</button>
        </footer>
      </form>
    </article>`;

  openOverlay();
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
}

async function openTeacherSubmissionGrader(submissionId) {
  activeTeacherSubmissionId = submissionId;
  const details = await dataService.getSubmissionForGrading({ submissionId });

  const supportsWritingRubrics = details.submission.questId === 'q-empires-reckoning';
  const existing = Object.fromEntries((details.rubricScores || []).map((row) => [row.criterionKey, row]));

  if (supportsWritingRubrics) {
    const savedModes = ['saq', 'leq', 'dbq'].filter((mode) => Object.keys(existing).some((key) => key.startsWith(`${mode}-`) || (mode === 'saq' && key.startsWith('saq-part-'))));
    activeTeacherRubricMode = savedModes[0] || activeTeacherRubricMode || 'saq';
  } else {
    activeTeacherRubricMode = 'saq';
  }

  const rubric = RUBRICS[activeTeacherRubricMode] || RUBRICS.saq;
  const scoreHtml = rubric.criteria.map((criterion) => {
    const key = `${activeTeacherRubricMode}-${criterion.id}`;
    const legacyKey = activeTeacherRubricMode === 'saq' ? `saq-part-${criterion.id}` : key;
    const row = existing[key] || existing[legacyKey] || {};
    const points = Number(row.pointsEarned ?? 0);
    return `
      <label class="teacher-grade-row">
        <span>${text(criterion.label)} (${criterion.points} pt)</span>
        <input type="number" min="0" max="${criterion.points}" step="1" name="${key}" value="${points}" />
        <textarea name="fb-${key}" rows="2" placeholder="Feedback for ${text(criterion.label)}">${text(row.feedback || '')}</textarea>
      </label>`;
  }).join('');

  $('#modal-layer').innerHTML = `
    <article class="small-modal teacher-grade-modal">
      <header class="quest-modal-header">
        <div>
          <p class="eyebrow">Submission Grader</p>
          <h2>${text(details.student?.displayName || 'Student')} · ${text(details.content?.identity?.title || 'Quest')}</h2>
          <p>Use AP-style rubric scoring. Changes stay in local demo mode.</p>
        </div>
        <button class="close-button" data-close-modal>×</button>
      </header>
      <div class="teacher-grade-layout">
        <article class="teacher-grade-response">
          <h3>Student Response</h3>
          <pre>${text(JSON.stringify(details.submission.answers || {}, null, 2))}</pre>
        </article>
        <form id="teacher-grade-form" class="quest-teacher-grading-panel">
          <p class="quest-teacher-panel-kicker">Rubric Scoring</p>
          <input type="hidden" name="rubric-mode" value="${activeTeacherRubricMode}" />
          ${supportsWritingRubrics ? `<label class="teacher-inline-label">Rubric Mode
            <select id="teacher-rubric-mode-select">
              <option value="saq" ${activeTeacherRubricMode === 'saq' ? 'selected' : ''}>SAQ (3-Point)</option>
              <option value="leq" ${activeTeacherRubricMode === 'leq' ? 'selected' : ''}>LEQ (6-Point)</option>
              <option value="dbq" ${activeTeacherRubricMode === 'dbq' ? 'selected' : ''}>DBQ (7-Point)</option>
            </select>
          </label>` : ''}
          <p class="quest-teacher-score-summary">Scoring with ${text(rubric.title)} (${rubric.total} points)</p>
          ${scoreHtml}
          <label class="quest-teacher-feedback-label">Overall Feedback
            <textarea class="quest-teacher-overall-feedback" name="overall" rows="4">${text(details.submission.overallFeedback || '')}</textarea>
          </label>
          <div class="quest-teacher-panel-actions">
            <button type="submit">Save Scores</button>
            <button type="button" data-teacher-action="request-revision" data-submission-id="${submissionId}">Request Revision</button>
            <button type="button" data-teacher-action="return-graded" data-submission-id="${submissionId}">Return Graded</button>
          </div>
        </form>
      </div>
    </article>`;
  openOverlay();
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
}

async function renderTeacherDashboard() {
  await hydrateTeacherSnapshots();
  const [submissions, units, roster, analytics, announcements] = await Promise.all([
    dataService.getSubmissions({ classId: teacherActiveClassId }),
    dataService.getTeacherUnits(),
    dataService.getRoster({ classId: teacherActiveClassId }),
    dataService.getHistorianAnalytics({ classId: teacherActiveClassId, unitId: 'unit-1' }),
    dataService.listAnnouncements({ classId: teacherActiveClassId })
  ]);

  $('#modal-layer').innerHTML = `
    <article class="teacher-dashboard-modal">
      <header class="quest-modal-header">
        <div>
          <p class="eyebrow">Teacher Mode · ${text(getDataModeLabel())}</p>
          <h2>Atlantic Command Dashboard</h2>
          <p>Mock-only infrastructure active. Supabase adapter is scaffolded but not connected.</p>
        </div>
        <div class="teacher-header-controls">${teacherClassSelect()}<button class="close-button" data-close-modal>×</button></div>
      </header>
      <div class="teacher-dashboard-body">
        ${renderTeacherTabBar()}
        ${renderTeacherCommandCenterSection()}
        ${renderTeacherQuestStudioSection()}
        ${renderTeacherSubmissionArchiveSection(submissions)}
        ${renderTeacherUnitControlSection(units)}
        ${renderTeacherRosterSection(roster)}
        ${renderTeacherAnalyticsSection(analytics)}
        ${renderTeacherSettingsSection(announcements)}
      </div>
    </article>`;
  openOverlay();
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
  applyTeacherTabVisibility();
}

async function openTeacherAccessModal() {
  const session = await dataService.getCurrentSession();
  teacherSession = session;
  if (session?.user?.role === 'teacher') {
    setTeacherMode(true);
    updateHud();
    await renderTeacherDashboard();
    return;
  }

  $('#modal-layer').innerHTML = `
    <article class="small-modal teacher-auth-modal">
      <header class="quest-modal-header">
        <div>
          <p class="eyebrow">Teacher Mode Access</p>
          <h2>Authenticate Teacher Dashboard</h2>
          <p>Current mode: ${text(getDataModeLabel())}. Supabase is intentionally disabled for this phase.</p>
        </div>
        <button class="close-button" data-close-modal>×</button>
      </header>
      <div class="teacher-auth-body">
        <p>This local demo sign-in unlocks teacher infrastructure: class controls, quest studio, grading queue, analytics, and announcements.</p>
        <div class="quest-actions">
          <button class="primary-button" id="teacher-demo-signin" type="button">Demo Teacher Sign In</button>
          <button class="text-button" data-close-modal type="button">Cancel</button>
        </div>
        <small>Note: no remote auth, no Supabase writes, no student data sync.</small>
      </div>
    </article>`;
  openOverlay();
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
}

function initializeEvents() {
  document.addEventListener('click', (event) => {
    const questButton = event.target.closest('[data-quest-id]');
    if (questButton && Date.now() >= suppressQuestOpenUntil) openQuest(questButton.dataset.questId);
    if (event.target.closest('[data-close-modal]')) closeModal();
    if (event.target.closest('[data-close-drawer]')) closeDrawer();
    if (event.target === $('#overlay')) { closeModal(); closeDrawer(); }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'open-library') openLibrary();
    if (action === 'open-inventory') openInventory();
    if (action === 'open-leaderboard') openLeaderboard();
    if (action === 'open-skills') openSkills();
    if (action === 'open-help') openHelp();
    if (action === 'open-rubrics') openRubricIndex();
    if (action === 'open-badge-case') openBadgeCase();
    if (action === 'open-store') openStore();

    if (event.target.id === 'teacher-demo-signin') {
      dataService.signInDemoTeacher()
        .then((session) => {
          teacherSession = session;
          setTeacherMode(true);
          updateHud();
          return renderTeacherDashboard();
        })
        .catch((error) => console.error('Teacher sign-in failed', error));
    }

    const teacherActionButton = event.target.closest('[data-teacher-action]');
    if (teacherActionButton) {
      const actionName = teacherActionButton.dataset.teacherAction;
      const questId = teacherActionButton.dataset.questId;
      const access = teacherActionButton.dataset.access;
      const submissionId = teacherActionButton.dataset.submissionId;
      const unitId = teacherActionButton.dataset.unitId;
      const unitState = teacherActionButton.dataset.unitState;

      if (actionName === 'grade-submission' && submissionId) {
        openTeacherSubmissionGrader(submissionId).catch((error) => console.error(error));
      }
      if (actionName === 'open-quest-builder') {
        openQuestTemplatePicker();
      }
      if (actionName === 'equip-store-item') {
        const itemId = teacherActionButton.dataset.itemId;
        const item = STARTER_STORE_ITEMS.find((row) => row.id === itemId);
        if (itemId && item) {
          const next = clone(studentProgress);
          next.equipped = next.equipped || {};
          next.equipped[item.category] = itemId;
          saveStudentProgress(next);
          openInventory();
          updateHud();
        }
      }
      if (actionName === 'buy-store-item') {
        const itemId = teacherActionButton.dataset.itemId;
        pendingStorePurchaseId = itemId;
        const item = STARTER_STORE_ITEMS.find((row) => row.id === itemId);
        if (!item) return;
        const preview = spendArchiveTokens(studentProgress, itemId, { storeItems: STARTER_STORE_ITEMS, reason: `Purchased ${item.name}` });
        if (!preview.purchased) {
          const reasonMessage = preview.reason === 'insufficient_tokens'
            ? 'Not enough Archive Tokens for this purchase.'
            : preview.reason === 'badge_required'
              ? 'Badge prerequisite not met for this item.'
              : 'Item already owned.';
          showFeedback('#vocab-feedback', reasonMessage, 'notice');
          return;
        }
        saveStudentProgress(preview.progress);
        openStore();
        updateHud();
      }
      if (actionName === 'edit-active-quest' && activeQuest?.id) {
        openTeacherQuestBuilder({ questId: activeQuest.id }).catch((error) => console.error(error));
      }
      if (actionName === 'choose-quest-template') {
        const templateKey = teacherActionButton.dataset.templateKey || 'royale';
        openTeacherQuestBuilder({ templateKey }).catch((error) => console.error(error));
      }
      if (actionName === 'edit-quest' && questId) {
        openTeacherQuestBuilder({ questId }).catch((error) => console.error(error));
      }
      if (actionName === 'add-builder-question') {
        const form = $('#teacher-quest-builder-form');
        if (!form) return;
        const draftState = extractBuilderDraftState(form);
        const editingQuestId = form.dataset.editQuestId || null;
        openTeacherQuestBuilder({ questId: editingQuestId || null, templateKey: draftState.templateKey, addQuestion: true, draftState })
          .catch((error) => console.error(error));
      }
      if (actionName === 'remove-builder-question') {
        const form = $('#teacher-quest-builder-form');
        if (!form) return;
        const draftState = extractBuilderDraftState(form);
        const editingQuestId = form.dataset.editQuestId || null;
        const removeQuestionIndex = Number(teacherActionButton.dataset.questionIndex);
        openTeacherQuestBuilder({ questId: editingQuestId || null, templateKey: draftState.templateKey, removeQuestionIndex, draftState })
          .catch((error) => console.error(error));
      }
      if (actionName === 'set-access' && questId && access) {
        dataService.saveQuestAccessRule({
          questId,
          classId: teacherActiveClassId,
          rule: { accessMode: access, noteToStudent: access === 'locked' ? 'Locked by teacher command center.' : '' }
        }).then(() => renderTeacherDashboard()).then(() => refreshStudentFeed()).then(() => renderMap());
      }
      if (actionName === 'duplicate-quest' && questId) {
        dataService.duplicateQuest({ questId, unitId: 'unit-1' }).then(() => renderTeacherDashboard());
      }
      if (actionName === 'archive-quest' && questId) {
        dataService.archiveQuest({ questId }).then(() => renderTeacherDashboard());
      }
      if (actionName === 'set-unit-state' && unitId && unitState) {
        dataService.setUnitState({ unitId, state: unitState }).then(() => renderTeacherDashboard());
      }
      if (actionName === 'request-revision' && submissionId) {
        dataService.requestRevision({ submissionId, feedback: 'Revise and resubmit. See rubric comments.', reopenQuestionIds: ['part-b'] })
          .then(() => {
            logMissionEvent('Returned for revision', 'A teacher requested revisions on a recent submission.', 'returned-work');
            return renderTeacherDashboard();
          });
      }
      if (actionName === 'return-graded' && submissionId) {
        dataService.returnSubmissionToStudent({ submissionId, overallFeedback: 'Graded and returned.' })
          .then(() => {
            logMissionEvent('Work returned', 'A graded submission has been returned with feedback.', 'returned-work');
            return renderTeacherDashboard();
          });
      }
      if (actionName === 'reset-demo') {
        dataService.resetDemoData().then(async () => {
          await refreshStudentFeed();
          await renderStudentBulletin();
          renderMap();
          await renderTeacherDashboard();
        });
      }
      if (actionName === 'progress-reset-confirm') {
        studentProgress = createDefaultStudentProgress(PROGRESSION_STUDENT_ID);
        saveStudentProgress(studentProgress);
        updateHud();
        renderMap();
        renderTeacherDashboard().catch((error) => console.error(error));
      }
      if (actionName === 'export-csv') {
        dataService.exportGradesCsv({ classId: teacherActiveClassId, unitId: 'unit-1' })
          .then((csv) => showFeedback('#boss-feedback', `CSV generated in memory (${csv.split('\n').length - 1} rows).`, 'notice'));
      }
      if (actionName === 'exit-teacher') {
        dataService.signOut().then(async () => {
          teacherSession = null;
          setTeacherMode(false);
          updateHud();
          closeModal();
          await refreshStudentFeed();
          renderMap();
        });
      }
    }

    const teacherTabButton = event.target.closest('[data-teacher-tab]');
    if (teacherTabButton) {
      teacherActiveTab = teacherTabButton.dataset.teacherTab;
      applyTeacherTabVisibility();
    }

    const rubricButton = event.target.closest('[data-open-rubric]');
    if (rubricButton) openRubric(rubricButton.dataset.openRubric);
  });
  $('#teacher-mode-toggle').addEventListener('click', () => {
    if (state.teacherMode) {
      dataService.signOut().then(async () => {
        teacherSession = null;
        setTeacherMode(false);
        updateHud();
        if (activeQuest?.mode === 'boss') renderActiveQuest();
        await refreshStudentFeed();
        renderMap();
      });
      return;
    }
    openTeacherAccessModal().catch((error) => console.error(error));
  });

  $('#teacher-dashboard-button')?.addEventListener('click', () => {
    if (state.teacherMode && teacherSession?.user?.role === 'teacher') {
      renderTeacherDashboard().catch((error) => console.error(error));
      return;
    }
    openTeacherAccessModal().catch((error) => console.error(error));
  });

  document.addEventListener('change', (event) => {
    if (event.target.id === 'teacher-class-select') {
      teacherActiveClassId = event.target.value;
      renderTeacherDashboard().catch((error) => console.error(error));
    }

    if (event.target.id === 'teacher-rubric-mode-select' && activeTeacherSubmissionId) {
      activeTeacherRubricMode = event.target.value;
      openTeacherSubmissionGrader(activeTeacherSubmissionId).catch((error) => console.error(error));
    }

    if (event.target.id === 'teacher-source-library-select') {
      const sourceId = event.target.value;
      const source = SOURCES.find((item) => item.id === sourceId);
      if (!source) return;
      const form = $('#teacher-quest-builder-form');
      if (!form) return;
      if (form.elements.sourceTitle) form.elements.sourceTitle.value = source.title || '';
      if (form.elements.sourceCitation) form.elements.sourceCitation.value = source.citation || source.date || '';
      if (form.elements.sourceBody) form.elements.sourceBody.value = source.classroomExcerpt || source.description || '';
      if (form.elements.sourceUrl) form.elements.sourceUrl.value = source.sourceUrl || '';
    }

  });

  document.addEventListener('submit', (event) => {
    if (event.target.id === 'teacher-quest-builder-form') {
      event.preventDefault();
      const form = event.target;
      const saveMode = event.submitter?.dataset.saveMode || 'draft';
      const draftState = extractBuilderDraftState(form);
      const style = getAssessmentStyle(draftState.assessmentLabel);
      const selectedTemplate = String(draftState.templateKey || '').toLowerCase();
      const templateKey = selectedTemplate.includes('boss') ? 'boss' : (style.mode === 'boss' ? 'boss' : style.mode);
      const questions = collectBuilderQuestionsFromForm(form, templateKey, draftState.assessmentLabel);
      const source = draftState.sourceTitle || draftState.sourceCitation || draftState.sourceBody
        ? {
          id: `teacher-source-${Math.random().toString(36).slice(2, 6)}`,
          title: draftState.sourceTitle,
          citation: draftState.sourceCitation,
          body: draftState.sourceBody,
          sourceUrl: draftState.sourceUrl
        }
        : null;

      const questTypeMap = { royale: 'evidence', hipp: 'hipp', vocab: 'vocabulary', boss: 'boss_battle' };
      const patch = {
        identity: {
          title: draftState.title,
          subtitle: draftState.subtitle || `${draftState.assessmentLabel} Challenge`,
          questType: templateKey,
          xpReward: Number(draftState.xpReward || 30),
          location: 'Teacher Positioned',
          mapMarker: {
            x: 50,
            y: 50,
            icon: style.mode,
            label: draftState.title
          }
        },
        presentation: {
          heroKicker: `${draftState.assessmentLabel} Challenge`,
          heroDescription: `Teacher-authored ${draftState.assessmentLabel} quest.`,
          theme: style.mode
        },
        sources: source ? [source] : [],
        assessments: [{
          id: templateKey,
          label: draftState.assessmentLabel,
          maxPoints: questions.reduce((sum, question) => sum + Number(question.maxPoints || 1), 0),
          instructions: draftState.instructions || `Complete this ${draftState.assessmentLabel} assessment.`,
          responseSettings: { autosave: true, allowResubmit: true },
          questions
        }],
        rewards: { xp: Number(draftState.xpReward || 30), tokens: Number(draftState.tokenReward || 3) }
      };

      const editQuestId = form.dataset.editQuestId || null;
      if (!editQuestId || saveMode === 'create') {
        dataService.createQuestFromTemplate({
          unitId: 'unit-1',
          templateKey,
          identity: {
            title: draftState.title,
            subtitle: draftState.subtitle || `${draftState.assessmentLabel} Challenge`,
            location: 'Teacher Positioned',
            xpReward: Number(draftState.xpReward || 30),
            heroKicker: `${draftState.assessmentLabel} Challenge`,
            heroDescription: `Teacher-authored ${draftState.assessmentLabel} quest.`,
            assessmentLabel: draftState.assessmentLabel,
            instructions: draftState.instructions || `Complete this ${draftState.assessmentLabel} assessment.`
          },
          source,
          questions
        }).then(async (result) => {
          if (saveMode === 'publish') {
            await dataService.publishQuestVersion({ questId: result.quest.id, versionId: result.version.id, changeNote: 'Published from quest builder' });
            await dataService.saveQuestAccessRule({
              questId: result.quest.id,
              classId: teacherActiveClassId,
              rule: { accessMode: 'available', noteToStudent: '' }
            });
          }

          const customQuest = createTeacherQuestRuntime({
            id: result.quest.id,
            title: draftState.title,
            assessmentLabel: draftState.assessmentLabel,
            xpReward: Number(draftState.xpReward || 30),
            tokenReward: Number(draftState.tokenReward || 3),
            questionCount: Number(draftState.questionCount || 1),
            unlocked: saveMode !== 'draft'
          });
          upsertTeacherCustomQuest(customQuest);
          await refreshStudentFeed();
          renderMap();
          updateHud();
          await renderTeacherDashboard();
        });
        return;
      }

      const existingQuest = getQuest(editQuestId);
      if (existingQuest?.isTeacherCustom) {
        upsertTeacherCustomQuest(createTeacherQuestRuntime({
          id: editQuestId,
          title: draftState.title,
          assessmentLabel: draftState.assessmentLabel,
          xpReward: Number(draftState.xpReward || 30),
          tokenReward: Number(draftState.tokenReward || 3),
          questionCount: Number(draftState.questionCount || 1),
          coordinates: existingQuest.coordinates,
          unlocked: existingQuest.unlocked !== false
        }));
      } else if (existingQuest) {
        applyTeacherQuestOverrideFromDraft(editQuestId, draftState, questions, source);
      }

      dataService.saveQuestDraft({
        questId: editQuestId,
        patch,
        metadata: {
          title: draftState.title,
          questType: questTypeMap[templateKey] || 'other',
          locationKey: 'Teacher Positioned',
          xpReward: Number(draftState.xpReward || 30)
        },
        changeNote: 'Updated via teacher quest builder'
      }).then(async (snapshot) => {
        if (saveMode === 'publish') {
          await dataService.publishQuestVersion({ questId: editQuestId, versionId: snapshot.id, changeNote: 'Published from quest builder' });
          await dataService.saveQuestAccessRule({
            questId: editQuestId,
            classId: teacherActiveClassId,
            rule: { accessMode: 'available', noteToStudent: '' }
          });
        }
        await refreshStudentFeed();
        renderMap();
        updateHud();
        if (activeQuest?.id === editQuestId) {
          activeQuest = getRuntimeQuest(editQuestId);
          renderActiveQuest();
        }
        await renderTeacherDashboard();
      });
    }

    if (event.target.id === 'teacher-announcement-form') {
      event.preventDefault();
      const formData = new FormData(event.target);
      dataService.createAnnouncement({
        classId: teacherActiveClassId,
        title: String(formData.get('title') || ''),
        body: String(formData.get('body') || '')
      }).then(async () => {
        await renderStudentBulletin();
        await renderTeacherDashboard();
      });
    }

    if (event.target.id === 'teacher-progression-config-form') {
      event.preventDefault();
      const next = gatherProgressionConfigFromForm(event.target);
      const errors = validateProgressionConfig(next);
      if (errors.length) {
        alert(`Progression config errors:\n${errors.join('\n')}`);
        return;
      }
      progressionConfig = next;
      const evaluation = evaluateAllBadges(studentProgress, { badges: ALL_STARTER_BADGES, config: progressionConfig });
      saveStudentProgress(evaluation.progress);
      updateHud();
      renderMap();
      renderTeacherDashboard().catch((error) => console.error(error));
    }

    if (event.target.id === 'teacher-manual-reward-form') {
      event.preventDefault();
      const formData = new FormData(event.target);
      const xp = Math.max(0, Number(formData.get('manual-xp') || 0));
      const tokens = Math.max(0, Number(formData.get('manual-tokens') || 0));
      const reason = String(formData.get('manual-reason') || '').trim();
      try {
        const next = grantTeacherReward(studentProgress, { xp, tokens, reason });
        saveStudentProgress(next);
        updateHud();
        renderTeacherDashboard().catch((error) => console.error(error));
      } catch (error) {
        alert(error.message || 'Unable to apply manual reward.');
      }
    }

    if (event.target.id === 'teacher-grade-form') {
      event.preventDefault();
      if (!activeTeacherSubmissionId) return;
      const formData = new FormData(event.target);
      const rubricMode = String(formData.get('rubric-mode') || 'saq');
      const rubric = RUBRICS[rubricMode] || RUBRICS.saq;
      const scores = rubric.criteria.map((criterion) => {
        const key = `${rubricMode}-${criterion.id}`;
        return {
          criterionKey: key,
          pointsEarned: Number(formData.get(key) || 0),
          maxPoints: criterion.points,
          feedback: String(formData.get(`fb-${key}`) || '')
        };
      });

      dataService.saveRubricScores({
        submissionId: activeTeacherSubmissionId,
        scores,
        overallFeedback: String(formData.get('overall') || ''),
        status: 'grading'
      }).then(() => renderTeacherDashboard());
    }
  });

  $$('.rail-link[data-scroll-target]').forEach((button) => button.addEventListener('click', () => $(`#${button.dataset.scrollTarget}`).scrollIntoView({ behavior: 'smooth', block: 'start' })));

  document.addEventListener('pointerdown', (event) => {
    if (!state.teacherMode) return;
    const questButton = event.target.closest('.map-quest[data-quest-id]');
    const stage = $('#map-panel .map-stage');
    if (!questButton || !stage) return;
    const stageRect = stage.getBoundingClientRect();
    const questId = questButton.dataset.questId;
    activeMapDrag = {
      questId,
      pointerId: event.pointerId,
      stageRect,
      moved: false
    };
    questButton.setPointerCapture(event.pointerId);
  });

  document.addEventListener('pointermove', (event) => {
    if (!activeMapDrag || event.pointerId !== activeMapDrag.pointerId) return;
    const { stageRect, questId } = activeMapDrag;
    const x = Math.min(Math.max(event.clientX - stageRect.left, 0), stageRect.width);
    const y = Math.min(Math.max(event.clientY - stageRect.top, 0), stageRect.height);
    const left = `${((x / stageRect.width) * 100).toFixed(2)}%`;
    const top = `${((y / stageRect.height) * 100).toFixed(2)}%`;
    const button = $(`.map-quest[data-quest-id="${questId}"]`);
    if (button) {
      button.style.left = left;
      button.style.top = top;
    }
    activeMapDrag.moved = true;
  });

  document.addEventListener('pointerup', (event) => {
    if (!activeMapDrag || event.pointerId !== activeMapDrag.pointerId) return;
    const { stageRect, questId, moved } = activeMapDrag;
    if (moved) {
      const x = Math.min(Math.max(event.clientX - stageRect.left, 0), stageRect.width);
      const y = Math.min(Math.max(event.clientY - stageRect.top, 0), stageRect.height);
      state.teacherQuestPositions = state.teacherQuestPositions || {};
      state.teacherQuestPositions[questId] = {
        left: `${((x / stageRect.width) * 100).toFixed(2)}%`,
        top: `${((y / stageRect.height) * 100).toFixed(2)}%`
      };
      saveState(state);
      renderMap();
      suppressQuestOpenUntil = Date.now() + 350;
      setDispatch('Map Position Updated', `${getRuntimeQuest(questId)?.title || 'Quest'} marker repositioned.`);
    }
    activeMapDrag = null;
  });
}

async function init() {
  const configErrors = validateProgressionConfig(progressionConfig);
  if (configErrors.length) {
    console.warn('Progression configuration warnings:', configErrors);
  }

  loadStudentProgress();
  // Keep legacy completion map synchronized for compatibility with existing teacher overrides.
  state.completed = state.completed || {};
  studentProgress.completedQuestIds.forEach((questId) => {
    const legacyQuest = Object.entries(QUEST_PROGRESSION_OVERRIDES).find(([, meta]) => meta.catalogId === questId)?.[0];
    if (legacyQuest) state.completed[legacyQuest] = true;
  });

  await refreshStudentFeed();
  await renderStudentBulletin();
  teacherSession = await dataService.getCurrentSession();
  if (teacherSession?.user?.role === 'teacher') {
    setTeacherMode(true);
  }
  renderMissionLog();
  renderMap();
  updateHud();
  initializeEvents();
}

init();
