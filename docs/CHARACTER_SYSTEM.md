# Republic Builder Character System

## Purpose

Republic Builder is an AP U.S. History role-playing experience that blends historical thinking with narrative gameplay. Students create a founder, select a path and profession, and grow through quests and challenges that reward mastery of six Historian Skills.

The character system creates identity, narrative ownership, and meaningful choices without turning academic assessment into a pay-to-win or level-to-win system.

## Character profile

Each founder has the following data:

```js
{
  identity: { name, pronouns, hometown },
  appearance: { face, hair, skin, eyes },
  clothing: { hat, shirt, vest, pants, boots },
  profession: 'blacksmith' | 'printer' | 'farmer' | 'merchant' | 'surveyor' | 'healer',
  path: 'scholar' | 'maker' | 'orator' | 'pathfinder' | 'mediator' | 'steward',
  primarySkill: 'argument',
  secondarySkill: 'evidence'
}
```

## Creation sequence

### 1. Identity

Students name their founder, select pronouns, and choose a hometown. These choices personalize narration, greetings, town signage, and journal entries. They have no academic effect.

### 2. Appearance

Face, hair, skin tone, and eye color are cosmetic. The visual avatar updates immediately.

### 3. Clothing

Students choose a hat, shirt, vest, lower garment, and footwear. Clothing is a visual collection system that can grow by era. Example future unlocks: Revolutionary cockade, Lowell mill-worker apron, Gold Rush traveling coat, Harlem Renaissance eveningwear, or 1960s student-organizer jacket.

### 4. Profession

A profession establishes a town role and gives the student themed practice quests, a starter cosmetic, and a small story resource.

| Profession | Example practice-quest flavor | Example non-academic reward |
|---|---|---|
| Blacksmith | Build supply chains during industrialization | Foundry banner |
| Printer | Prepare a broadside for a Revolutionary debate | Presswork frame |
| Farmer | Balance land, labor, and market pressures | Harvest satchel |
| Merchant | Negotiate trade routes and tariffs | Merchant ledger |
| Surveyor | Map territorial expansion | Compass badge |
| Healer | Respond to wartime or urban public-health needs | Healer kit |

### 5. Founder Path

Founder Paths are leadership identities. They affect dialogue tone, quest branches, town roles, cosmetics, and a small resource bonus.

| Path | Dialogue / quest flavor | Town role | Example cosmetic / resource |
|---|---|---|---|
| Scholar | Inquiry, source analysis, preservation | Archive keeper | Illuminated ledger / Library Supply |
| Maker | Building, invention, improvement | Workshop lead | Craft apron / Workshop Supply |
| Orator | Persuasion, coalition building, public speech | Assembly voice | Civic sash / Civic Favor |
| Pathfinder | Exploration, planning, discovery | Trail guide | Explorer’s cloak / Travel Supply |
| Mediator | Compromise, diplomacy, consensus | Council liaison | Treaty pin / Community Favor |
| Steward | Care, long-term sustainability, public good | Commons keeper | Steward mantle / Commons Supply |

No path is academically superior to another.

## Historian Skills

The six Historian Skills should map to observable APUSH thinking routines.

| Skill | Student-facing description | Examples of eligible evidence |
|---|---|---|
| Developments | I can explain change, continuity, causes, and effects. | Causation map, continuity/change response, process explanation |
| Sourcing | I can analyze a source’s historical situation, audience, purpose, and point of view. | HIPP/APPARTS practice, source annotation, sourcing exit ticket |
| Evidence | I can select and use specific historical evidence. | DBQ evidence sort, paragraph, claim-evidence-reasoning response |
| Context | I can place evidence in a broader historical setting. | Contextualization practice, timeline bridge, mini-lecture response |
| Connections | I can connect historical developments across time, place, or theme. | Comparison chart, periodization bridge, thematic connection |
| Argument | I can make and defend a historically defensible claim. | Thesis practice, debate claim, LEQ/DBQ paragraph |

### Starting values

Every skill begins at `5/20`.

- Primary Historian Skill: `+2` (starts at `7/20`)
- Secondary Historian Skill: `+2` (starts at `7/20`)
- The selections must be different.

Example:

```text
Founder Path: Orator
Primary: Argument — 7/20
Secondary: Evidence — 7/20
Developments, Sourcing, Context, Connections — 5/20
```

### Recommended XP model

Treat the visual score as a mastery journey rather than a grade conversion.

| Student performance evidence | Suggested XP | Notes |
|---|---:|---|
| Completes a low-stakes attempt | +1 | Completion alone; use sparingly |
| Demonstrates a target skill with feedback | +2 | Teacher or auto-checked practice evidence |
| Revises using feedback and improves | +2 | Rewards growth, not first-attempt perfection |
| Shows mastery on a practice challenge | +3 | Requires a stated criterion |
| Collaboratively supports another learner | +1 optional | Avoid using this in ways that pressure students |

Set a transparent cap for each unit. For example, Unit 3 might permit a maximum of +6 Sourcing XP and +6 Evidence XP. This prevents students with more free time from racing far ahead.

## Assessment fairness policy

### The rule

On graded assessments, character traits, profession, Founder Path, cosmetics, inventory, and Historian Skill level do **not** give answer advantages.

They must never unlock:

- Correct answers or answer hints.
- Different rubric thresholds.
- More time on a timed graded assessment.
- Extra attempts unavailable to classmates.
- Easier question sets.
- Grade boosts based on game XP.

### What can unlock in practice

For practice quests and optional review, the system may safely unlock:

- Graphic organizers or planning templates.
- Alternate narrative routes with equivalent academic rigor.
- Optional review prompts, retrieval-practice sets, or source sets.
- Cosmetic clothing, badges, banners, housing decorations, and profile frames.
- Town roles and non-grade resources.
- A choice of equally rigorous practice formats, such as a debate card, source annotation, or timeline mission.

### How to award skill XP responsibly

1. Define the academic criterion first.
2. Use ordinary teacher feedback and ordinary grading practices.
3. Award game XP only after the learner demonstrates the criterion.
4. Keep the gradebook separate from the game score.
5. Make rubric and XP criteria visible to students.
6. Allow an accessible, noncompetitive path to the same cosmetics or narrative content whenever practical.

## Recommended data export

The supplied UI can download a JSON snapshot. Save that profile under the student’s game ID later, not their public display name. The public-facing game UI can show a display name; the teacher-facing system should use a stable internal identifier.

## Future-era expansion

Keep data model IDs stable, then add era-conditioned items. Example:

```js
{
  id: 'hat-cockade',
  era: 'revolution',
  slot: 'hat',
  unlock: { type: 'quest', id: 'unit-3-liberty-debate' }
}
```

Use a cosmetic inventory table later rather than hard-coding every item in the character creator.
