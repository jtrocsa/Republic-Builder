import test from "node:test";
import assert from "node:assert/strict";

import { createStartingSkillScores } from "../src/data/historianSkills.js";
import { createDefaultOutfit } from "../src/data/starterOutfits.js";
import {
  awardSkillPoints,
  createCharacterProfile,
  createMigrationDraft,
  getProfileFocusSummary,
  getSuggestedFounderPathFromLegacyTraits,
  validateCharacterInput
} from "../src/services/characterProfile.js";

test("starting skill scores use the 5/20 base plus two distinct focus bonuses", () => {
  const scores = createStartingSkillScores("sourcing", "connections");
  assert.equal(scores.sourcing, 7);
  assert.equal(scores.connections, 7);
  assert.equal(scores.argument, 5);
});

test("starter outfits use the existing browser wardrobe IDs", () => {
  const outfit = createDefaultOutfit();
  assert.equal(outfit.hat, "hat-none");
  assert.equal(outfit.shirt, "basic-tunic");
  assert.equal(outfit.pants, "plain-trousers");
  assert.equal(outfit.socks, "wool-socks");
  assert.equal(outfit.shoes, "simple-shoes");
});

test("starting skill scores reject duplicate focuses", () => {
  assert.throws(() => createStartingSkillScores("evidence", "evidence"));
});

test("a profile separates identity from historian skills", () => {
  const profile = createCharacterProfile({
    name: "Avery",
    gender: "nonbinary",
    pronouns: "they/them",
    town: "Philadelphia",
    founderPathId: "orator",
    professionId: "printer",
    primarySkillId: "argument",
    secondarySkillId: "evidence"
  });

  assert.equal(profile.identity.founderPathId, "orator");
  assert.equal(profile.identity.professionId, "printer");
  assert.equal(profile.historianSkills.argument, 7);
  assert.equal(profile.historianSkills.evidence, 7);
  assert.equal(profile.historianSkills.sourcing, 5);
});

test("profile input validates required path, profession, and distinct focuses", () => {
  const result = validateCharacterInput({
    name: "A",
    town: "",
    founderPathId: "",
    professionId: "",
    primarySkillId: "sourcing",
    secondarySkillId: "sourcing"
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 4);
});

test("profile summaries expose founder path, profession, and historian focus", () => {
  const profile = createCharacterProfile({
    name: "Avery",
    town: "Boston",
    founderPathId: "orator",
    professionId: "printer",
    primarySkillId: "argument",
    secondarySkillId: "evidence"
  });

  const summary = getProfileFocusSummary(profile);

  assert.equal(summary.founderPath, "Orator");
  assert.equal(summary.profession, "Printer");
  assert.equal(summary.focusSummary, "Argument · Evidence");
});

test("quest rewards cap scores at 20 and keep a reward log", () => {
  const profile = createCharacterProfile({
    name: "Avery",
    town: "Boston",
    founderPathId: "scholar",
    professionId: "surveyor",
    primarySkillId: "sourcing",
    secondarySkillId: "context"
  });

  profile.historianSkills.sourcing = 19;
  const updated = awardSkillPoints(profile, {
    questId: "source-practice-1",
    awards: { sourcing: 4, evidence: 1 }
  });

  assert.equal(updated.historianSkills.sourcing, 20);
  assert.equal(updated.historianSkills.evidence, 6);
  assert.equal(updated.progress.skillPointLog.length, 1);
});

test("legacy traits suggest a Founder Path but do not create academic skill scores", () => {
  assert.equal(getSuggestedFounderPathFromLegacyTraits({ diplomacy: 9, courage: 7 }), "mediator");

  const draft = createMigrationDraft({
    name: "Legacy Founder",
    town: "New York",
    founderTraits: { industry: 11, influence: 7 }
  });

  assert.equal(draft.founderPathId, "maker");
  assert.equal(draft.primarySkillId, "");
  assert.equal(draft.migrationNeedsSkillFocus, true);
});
