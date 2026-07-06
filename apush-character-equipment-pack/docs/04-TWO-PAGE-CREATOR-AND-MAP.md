# Two-Page Creator and Map Entry

## Home-map behavior

The map remains the home screen. It must show one of these states:

| Student state | Home-map control |
|---|---|
| No character | “Create Your Historian” callout plus a subtle silhouette/new indicator |
| Character exists, no new items | “Customize” button or profile portrait |
| New inventory item | “New Gear Available” callout with a red dot and item count |

The first-time prompt should be dismissible. A student can enter quests without creating a character, but they need a character to collect/equip cosmetics. Do not block core coursework behind character creation.

## Page 1 — Meet your Historian

- Game title (default: **American Chronicle**, configurable)
- Stylized historical background with no dependency on a specific unit
- Name field
- Character model: woman or man
- Skin-tone swatch grid: eight visible choices, all free
- Pronouns field, supporting custom entries
- Preview updates when either model or skin tone changes

## Page 2 — Starter Gear

- Large paper-doll preview
- Seven visible equipment slots
- Starter items pre-equipped where applicable
- Hat and transportation show intentionally empty/default state
- No spending or store browsing during creation
- Finish button returns student directly to the map

## After creation

The **Customize** interface should use the same paper-doll component and inventory slots. It must open from the map and may also open from any “new item earned” pop-up.

## Appearance after creation

Add an **Appearance** control to Customize, separate from the seven equipment slots. It must show the same eight skin-tone swatches and update the live paper-doll preview immediately. Saving updates `character.appearance.skinTone` without changing inventory, Archive Tokens, XP, badges, or equipped gear.
