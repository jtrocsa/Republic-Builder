import { FOUNDER_PATH_BY_ID, LEGACY_TRAIT_TO_FOUNDER_PATH } from "../data/founderPaths.js";
import { PROFESSION_BY_ID } from "../data/professions.js";
import {
  HISTORIAN_SKILLS,
  SKILL_BY_ID,
  SKILL_MAX,
  createStartingSkillScores,
  getSkillBand
} from "../data/historianSkills.js";
import { createDefaultOutfit } from "../data/starterOutfits.js";

export const PROFILE_VERSION = 2;
export const DEFAULT_STORAGE_KEY = "republic-builder-profile";

function cleanText(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function validateCharacterInput(input) {
  const errors = [];
  const name = cleanText(input?.name);
  const town = cleanText(input?.town);

  if (name.length < 2 || name.length > 32) {
    errors.push("Character name must be between 2 and 32 characters.");
  }

  if (town.length < 2 || town.length > 48) {
    errors.push("Town must be between 2 and 48 characters.");
  }

  if (!FOUNDER_PATH_BY_ID[input?.founderPathId]) {
    errors.push("Choose a Founder Path.");
  }

  if (!PROFESSION_BY_ID[input?.professionId]) {
    errors.push("Choose a profession.");
  }

  if (!SKILL_BY_ID[input?.primarySkillId]) {
    errors.push("Choose a primary historian focus.");
  }

  if (!SKILL_BY_ID[input?.secondarySkillId]) {
    errors.push("Choose a secondary historian focus.");
  }

  if (input?.primarySkillId && input?.primarySkillId === input?.secondarySkillId) {
    errors.push("Primary and secondary historian focuses must be different.");
  }

  return { valid: errors.length === 0, errors };
}

export function createCharacterProfile(input) {
  const validation = validateCharacterInput(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join(" "));
  }

  const outfit = { ...createDefaultOutfit(), ...(input.outfit ?? {}) };
  const historianSkills = createStartingSkillScores(input.primarySkillId, input.secondarySkillId);
  const founderPath = FOUNDER_PATH_BY_ID[input.founderPathId];
  const profession = PROFESSION_BY_ID[input.professionId];

  return {
    version: PROFILE_VERSION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    identity: {
      name: cleanText(input.name),
      gender: cleanText(input.gender, "prefer-not-to-say"),
      pronouns: cleanText(input.pronouns),
      town: cleanText(input.town),
      founderPathId: founderPath.id,
      professionId: profession.id,
      outfit
    },
    historianFocus: {
      primarySkillId: input.primarySkillId,
      secondarySkillId: input.secondarySkillId
    },
    historianSkills,
    inventory: {
      starterItems: [founderPath.starterReward, profession.starterItem],
      materials: {}
    },
    progress: {
      completedQuestIds: [],
      skillPointLog: []
    }
  };
}

export function getProfileSummary(profile) {
  const path = FOUNDER_PATH_BY_ID[profile?.identity?.founderPathId];
  const profession = PROFESSION_BY_ID[profile?.identity?.professionId];

  return {
    name: profile?.identity?.name ?? "Unknown Founder",
    path,
    profession,
    skills: HISTORIAN_SKILLS.map((skill) => {
      const score = Number(profile?.historianSkills?.[skill.id] ?? 0);
      return { ...skill, score, band: getSkillBand(score) };
    })
  };
}

export function getProfileFocusSummary(profile) {
  const path = FOUNDER_PATH_BY_ID[profile?.identity?.founderPathId];
  const profession = PROFESSION_BY_ID[profile?.identity?.professionId];
  const focusLabels = [profile?.historianFocus?.primarySkillId, profile?.historianFocus?.secondarySkillId]
    .filter(Boolean)
    .map((skillId) => SKILL_BY_ID[skillId]?.label || skillId);

  return {
    founderPath: path?.label ?? null,
    profession: profession?.label ?? null,
    focuses: focusLabels,
    focusSummary: focusLabels.join(" · ")
  };
}

export function awardSkillPoints(profile, { questId, reason = "Quest completion", awards = {} }) {
  if (!profile || typeof profile !== "object") {
    throw new Error("A valid profile is required to award skill points.");
  }

  if (!questId || typeof questId !== "string") {
    throw new Error("A questId is required to award skill points.");
  }

  const next = deepClone(profile);
  next.historianSkills ??= {};
  next.progress ??= { completedQuestIds: [], skillPointLog: [] };
  next.progress.completedQuestIds ??= [];
  next.progress.skillPointLog ??= [];

  const sanitizedAwards = {};

  for (const [skillId, rawPoints] of Object.entries(awards)) {
    if (!SKILL_BY_ID[skillId]) {
      throw new Error(`Unknown historian skill: ${skillId}`);
    }

    const points = Number(rawPoints);
    if (!Number.isInteger(points) || points < 0) {
      throw new Error(`Award for ${skillId} must be a non-negative integer.`);
    }

    const current = Number(next.historianSkills[skillId] ?? 0);
    const applied = Math.min(points, Math.max(0, SKILL_MAX - current));
    next.historianSkills[skillId] = current + applied;
    sanitizedAwards[skillId] = applied;
  }

  next.progress.completedQuestIds = Array.from(new Set([...next.progress.completedQuestIds, questId]));
  next.progress.skillPointLog.push({
    questId,
    reason,
    awards: sanitizedAwards,
    earnedAt: new Date().toISOString()
  });
  next.updatedAt = new Date().toISOString();

  return next;
}

export function saveProfile(profile, storageKey = DEFAULT_STORAGE_KEY) {
  localStorage.setItem(storageKey, JSON.stringify(profile));
  return profile;
}

export function loadProfile(storageKey = DEFAULT_STORAGE_KEY) {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : null;
}

export function clearProfile(storageKey = DEFAULT_STORAGE_KEY) {
  localStorage.removeItem(storageKey);
}

export function getSuggestedFounderPathFromLegacyTraits(legacyTraits = {}) {
  const entries = Object.entries(legacyTraits)
    .filter(([traitId, score]) => LEGACY_TRAIT_TO_FOUNDER_PATH[traitId] && Number.isFinite(Number(score)))
    .sort((a, b) => Number(b[1]) - Number(a[1]));

  return entries.length ? LEGACY_TRAIT_TO_FOUNDER_PATH[entries[0][0]] : null;
}

export function createMigrationDraft(legacyProfile = {}) {
  const legacyTraits = legacyProfile.founderTraits ?? legacyProfile.traits ?? {};
  return {
    name: legacyProfile.name ?? legacyProfile.identity?.name ?? "",
    gender: legacyProfile.gender ?? legacyProfile.identity?.gender ?? "prefer-not-to-say",
    pronouns: legacyProfile.pronouns ?? legacyProfile.identity?.pronouns ?? "",
    town: legacyProfile.town ?? legacyProfile.identity?.town ?? "",
    founderPathId: getSuggestedFounderPathFromLegacyTraits(legacyTraits) ?? "",
    professionId: legacyProfile.professionId ?? legacyProfile.identity?.professionId ?? "",
    primarySkillId: "",
    secondarySkillId: "",
    outfit: { ...createDefaultOutfit(), ...(legacyProfile.outfit ?? legacyProfile.identity?.outfit ?? {}) },
    migrationNeedsSkillFocus: true
  };
}
