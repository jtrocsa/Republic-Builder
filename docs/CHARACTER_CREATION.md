# Character Creation System

## Purpose

The **Founder’s Character Forge** is the opening experience for Republic Builder. It gives students a visible, personal stake in the game without tying academic success to a particular identity, home town, or cosmetic choice.

The character system supports three classroom goals:

1. **Writing growth:** traits such as Intellect and Influence can later be awarded for thesis work, DBQ evidence, HIPP analysis, and revision.
2. **Historical context:** a founder’s town, clothing, profession, artifacts, and later-era unlocks provide entry points into changing historical conditions.
3. **Collaboration:** Diplomacy and Integrity can be rewarded for productive debate, peer feedback, group source analysis, and shared projects.

## Current Player Flow

1. **Identity** — founder name, gender/presentation, and home town.
2. **Calling** — one starting profession that grants a small trait bonus.
3. **Wardrobe** — cosmetic starter choices for hat, shirt/tunic, pants, socks, and shoes.
4. **Founding Oath** — republic name, motto, and a review of the character sheet.

A completed profile appears in the dashboard header and in the **Founder Traits** panel. Clicking the profession button under the student name reopens the Forge to edit the profile.

## The Six Founder Traits

Traits are personal character attributes, not grades. They are separate from the six **Republic Pillars**, which model the changing health of a student’s fictional republic.

| Trait | What it represents | Likely future rewards |
|---|---|---|
| Intellect | Analysis, sourcing, writing, document interpretation | HIPP, thesis, DBQ evidence, historical context |
| Industry | Persistence, production, building, economic development | Long-term projects, timeline work, vocabulary practice |
| Influence | Persuasion, public speaking, leadership | Debate, seminar, peer coaching, argument writing |
| Courage | Responding to risk and difficult choices | Crisis quests, revision after feedback, ethical decisions |
| Diplomacy | Collaboration, compromise, negotiation | Group work, debate synthesis, alliance missions |
| Integrity | Justice, civic responsibility, reform | Evidence-based reflection, civil discourse, reform quests |

### Trait cap

- Every trait has a **maximum value of 20**.
- Every student starts at **5** in each trait before their profession bonus.
- A profession gives a modest total bonus of **+4**.
- Future quest rewards must use the clamping helper in `app.js`, which prevents a trait from exceeding 20.

This keeps the system fair: students start similarly, then develop their founder through sustained work across the year.

## Starting Professions

| Profession | Starting bonus |
|---|---|
| Blacksmith | +3 Industry, +1 Courage |
| Newspaper Editor | +3 Intellect, +1 Influence |
| Farmer | +2 Industry, +2 Integrity |
| Merchant | +2 Diplomacy, +2 Influence |
| Teacher | +3 Intellect, +1 Integrity |
| Apprentice Lawyer | +2 Intellect, +2 Influence |
| Sailor | +2 Courage, +2 Diplomacy |
| Artisan | +2 Industry, +2 Intellect |

Professions are **starting callings**, not permanent locks. A later version can let students add later-era roles, change occupations, or unlock companions without deleting their original founder story.

## Wardrobe Rules

All founders begin with a basic historical outfit. Initial clothing selections are **cosmetic only**:

- Hat
- Shirt/tunic
- Pants
- Socks
- Shoes

The default shirt is the **Basic Tunic**, which represents the common starting clothing described in the game concept. Students may choose other starter visual variations at no academic advantage.

### Special items

The final wardrobe tab is intentionally locked at character creation. It is reserved for quest-earned artifacts, historical roles, era-specific clothing, and boss-battle rewards. A future item can be represented as a `special` wardrobe item with `locked: false` after the student earns it.

## Where the Character Content Lives

All editable character content is in `data.js` under:

```js
window.REPUBLIC_BUILDER_DATA.character
```

That section includes:

- `baseTraits`
- `traits`
- `genders`
- `towns`
- `professions`
- `wardrobe`

The rendering and game rules live in `app.js`. Saving lives in `storage.js`. Do not move character data into `app.js`; keeping it separate lets you add content without changing game logic.

## Character Save Shape

A saved character uses this shape. `traitGrowth` stores rewards earned after character creation, so editing a wardrobe or profession later does not erase progress:

```js
{
  name: "Maya Carter",
  gender: "woman",
  town: "boston",
  profession: "newspaper-editor",
  outfit: {
    hat: "tricorn",
    shirt: "blue-vest",
    pants: "navy-breeches",
    socks: "blue-socks",
    shoes: "buckled-shoes",
    special: "locked-relic"
  },
  traitGrowth: {
    intellect: 0,
    industry: 0,
    influence: 0,
    courage: 0,
    diplomacy: 0,
    integrity: 0
  },
  traits: {
    intellect: 8,
    industry: 5,
    influence: 6,
    courage: 5,
    diplomacy: 5,
    integrity: 5
  }
}
```

## Adding a New Profession

Add a new entry to `data.js`:

```js
{
  id: "surveyor",
  name: "Surveyor",
  icon: "⌖",
  description: "Map land, measure change, and plan routes.",
  bonuses: { intellect: 2, industry: 2 },
  starterItem: "Surveyor’s Chain"
}
```

Keep the total bonus at about **+4**. The game should not imply that one profession is academically superior.

## Adding a Trait Reward to a Quest

Quest rewards can later include a `traits` object:

```js
rewards: {
  xp: 120,
  rp: 60,
  pillars: { liberty: 2 },
  traits: { intellect: 1, integrity: 1 },
  artifact: "Historian’s Lens"
}
```

`app.js` already calls `updateCharacterTraits()` when a quest is completed. It applies the 20-point cap automatically.

## Era Evolution Plan

The first character forge provides a founding-era visual base. As the course advances, add items by era rather than replacing student choices.

Examples:

- **Units 1–3:** colonial hats, tunics, breeches, printing tools, militia items.
- **Units 4–5:** frontier clothing, campaign pins, abolitionist and reform artifacts.
- **Units 6–7:** industrial workwear, telegraph tools, union and reform badges.
- **Units 8–9:** wartime items, civil-rights buttons, media tools, modern civic accessories.

Treat historical objects carefully. Clothing and artifacts should provide context and story, not turn violence, slavery, or oppression into collectible “power-ups.”
