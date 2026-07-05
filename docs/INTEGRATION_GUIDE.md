# Integration Guide

## Framework assumption

The included implementation is framework-free JavaScript. It is intentionally built for the current static-site phase of Republic Builder, while keeping data structures portable to a future database or framework.

## Required integration points

1. **Character creation page** mounts `renderCharacterCreation()`.
2. **Game state** saves the returned profile object through `saveProfile()` or your own persistence adapter.
3. **Quest system** calls `awardSkillPoints()` after a teacher-verified or system-verified action.
4. **Profile HUD** reads `profile.historianSkills` and renders the six-item Historian Skills bar.

## Local-first persistence

The default `saveProfile()` and `loadProfile()` functions use browser `localStorage` so there is no recurring database cost during prototyping.

Replace only those two boundary functions later when you add an account system, Firebase, Supabase, a school LMS integration, or a teacher-controlled export/import workflow. The character-profile object can remain the same.

```js
// Later database adapter example:
export async function saveProfile(profile) {
  await database.collection("profiles").doc(profile.userId).set(profile);
}

export async function loadProfile(userId) {
  const snapshot = await database.collection("profiles").doc(userId).get();
  return snapshot.data();
}
```

## Quest reward example

```js
import { awardSkillPoints } from "/src/services/characterProfile.js";

const updated = awardSkillPoints(profile, {
  questId: "gilded-age-standard-oil-sourcing",
  reason: "Identified the cartoonist's point of view and connected it to anti-monopoly criticism.",
  awards: {
    sourcing: 1,
    evidence: 1
  }
});
```

Use small rewards. A typical completed quest should award 1–2 total points, not 5–10. The 20-point maximum should last a substantial portion of the course.

## Migration from the original Founder Traits UI

The legacy UI used:

```text
Intellect · Industry · Influence · Courage · Diplomacy · Integrity
```

Do not attempt to convert those scores directly into Historian Skill scores. They represent a different concept.

Recommended migration behavior:

1. Preserve the highest original trait as a **suggested Founder Path**.
2. Initialize all Historian Skills at 5.
3. Require the player to choose a primary and secondary Historian Focus once.
4. Save the new profile as `version: 2`.

Suggested path mapping:

| Legacy trait | Suggested Founder Path |
|---|---|
| Intellect | Scholar |
| Industry | Maker |
| Influence | Orator |
| Courage | Pathfinder |
| Diplomacy | Mediator |
| Integrity | Steward |

## UI copy to use in character creation

- **Founder Path**: “Who are you in the Republic?”
- **Profession**: “What work anchors your community?”
- **Historian Focus**: “How will you grow as a historian?”
- **Historian Skills**: “These skills develop through demonstrated historical thinking.”

## Asset plan

No image files are required for the included version; it uses small text/Unicode icons and CSS. When you add art, use stable IDs that mirror the data files:

```text
/assets/paths/scholar.webp
/assets/paths/maker.webp
/assets/professions/printer.webp
/assets/outfits/tricorn-hat.webp
/assets/outfits/plain-tunic.webp
```

The UI can then render a local image from the item ID without changing saved profiles.
