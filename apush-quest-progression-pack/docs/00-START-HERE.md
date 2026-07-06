# Start Here: How This Progression System Works

## The three-number rule

Every completed activity may affect three separate things. They must never be blended together.

| System | Student-facing meaning | Can it be spent? | Purpose |
|---|---|---:|---|
| **Historian XP** | Overall journey level | No | Long-term participation and growth |
| **Badge Progress** | Progress toward a particular badge | No | Visible evidence of a specific skill or unit achievement |
| **Archive Tokens** | Store balance | Yes | Cosmetics and optional ungraded extras |

A student should be able to say: “I earned 30 XP, 3 Archive Tokens, and one step toward my HIPP Mastery Badge.”

## The language rule

A quest card always has four clearly separated labels:

```text
ACTIVITY TYPE: Historical Topic
Mode: Practice / Core Quest / Boss Battle
Builds: Badge name(s)
Rewards: XP + Archive Tokens
```

Example:

```text
MCQ Challenge: Columbian Exchange
Core Quest • 12 questions • 10 minutes
Builds: MCQ Mastery Badge, Exchange Investigator Badge
Rewards: +30 Historian XP • +3 Archive Tokens
```

“Boss Battle,” “Core Quest,” and “Side Quest” describe **mode**, not the academic task. The academic task type must be visible first.

## The badge rule

- Assessment badges are plain and consistent: **MCQ Mastery**, **DBQ Mastery**, and so on.
- Unit badges are thematic and collectible: **Atlantic Cartographer**, **Settlement Chronicler**, and so on.
- General badges can progress Bronze → Silver → Gold.
- Unit badges are normally one-time achievements.
- A Unit Master Seal is unlocked by collecting a specified number of Unit badges.
- Badges never disappear after a later low score.

## The mastery pacing rule

Default configuration uses 20 total levels and 5,700 XP for Level 20. The default experience curve assumes a typical student reaches the final level during Unit 9. The **Master Historian** title is additionally gated behind the Unit 9 Master Seal, so an unusually high number of optional activities cannot unlock final mastery early.

## Files to use first

- `docs/01-PROGRESSION-ARCHITECTURE.md` — the complete system design.
- `docs/05-TEACHER-DASHBOARD.md` — controls teachers need.
- `data/progression-config.example.json` — the editable default numbers.
- `js/quest-progression-engine.js` — pure functions for XP, tokens, badges, and storage-ready student state.
- `assets/badges/badge-contact-sheet.svg` — visual preview of the badge pack.
