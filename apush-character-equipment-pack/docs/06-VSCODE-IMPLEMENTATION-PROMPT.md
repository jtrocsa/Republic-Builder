# VS Code Agent Prompt

Copy the complete prompt below into VS Code Copilot/Agent from the project root.

---

I copied the complete `apush-character-equipment-pack/` folder into this repository’s main project folder. Implement this package into the existing APUSH game now.

First inspect the current repository, especially the map/home screen, current character creator, character/profile state, existing cosmetic assets, quest reward logic, Archive Token store, badges, and persistence pattern. Preserve the existing framework, working quest system, student progress, existing file naming, visual language, and project organization. Do not replace the app with a new framework, create a disconnected demo page, or delete unrelated game files.

Read these source-of-truth files first:

- `apush-character-equipment-pack/README.md`
- `apush-character-equipment-pack/docs/00-START-HERE.md`
- `apush-character-equipment-pack/docs/01-CHARACTER-ARCHITECTURE.md`
- `apush-character-equipment-pack/docs/02-SVG-LAYER-CONTRACT.md`
- `apush-character-equipment-pack/docs/03-COSMETIC-ECONOMY.md`
- `apush-character-equipment-pack/docs/04-TWO-PAGE-CREATOR-AND-MAP.md`
- `apush-character-equipment-pack/docs/08-SKIN-TONE-APPEARANCE.md`
- `apush-character-equipment-pack/data/quest-character-items.js`
- `apush-character-equipment-pack/js/quest-character-engine.js`
- `apush-character-equipment-pack/js/quest-character-renderer.js`
- `apush-character-equipment-pack/styles/quest-character-system.css`

## Core redesign

Completely replace the current character-creation and room/builder-centered cosmetic system with an equipment-first system.

- The map is always the home screen. Do not force character creation before a student sees the map.
- Students can open a two-step **Create Your Historian** modal from a prominent, dismissible map callout.
- Step 1: game title, name, character model (woman/man), **skin tone**, and pronouns.
- Step 2: RPG-style paper doll with seven equipment slots: shoes, shirts, hats, belts, pants, hands, transportation.
- Every student starts with exactly the same starter clothing: starter shirt, pants, shoes, belt, and journal. Hats and transportation start empty.
- The selected model must not affect academic content, rewards, eligibility, pricing, or cosmetic compatibility.
- Do not implement rooms, homes, lots, town decorations, or builder mechanics.


## Mandatory skin-tone implementation

Add skin tone as a first-class base-appearance setting. This is not optional and it is not an equipment slot.

- Use `character.appearance.skinTone` with one of the eight supplied IDs: `tone-1` through `tone-8`.
- Use `migrateCharacterAppearance()` during normal profile migration; characters without a valid saved tone must safely render as `tone-4`.
- Render the base layer through `getCharacterBaseAsset(model, skinTone)` / `getCharacterLayers()`, not by applying a CSS filter to a static avatar.
- Page 1 needs an eight-option skin-tone swatch group. Update the preview when either model or skin tone changes.
- Customize needs a free Appearance section with the same swatches. It should call `setCharacterSkinTone()` and save through the existing profile persistence adapter.
- Never add skin tone to store categories, item catalog, Archive Token transactions, inventory, badge rewards, or quest rewards.
- The selected model and skin tone must remain compatible with every existing and future equipment SVG.

## SVG and avatar implementation

Use the supplied 16 model/skin-tone base-character SVGs and the 77 modular SVG equipment assets. Do not use a flattened portrait or embed cosmetic shapes into the base character.

- Every asset uses the same 512 × 768 canvas.
- Render each equipped item as a transparent SVG layer in a single stage, using `renderCharacterStage` from `quest-character-renderer.js`.
- Use the documented layer order: transportation, base, pants, shoes, shirts, belts, hands, hats.
- Transportation must render behind the character.
- Copy/import active assets into the project’s preferred assets location while keeping the original package folder intact as source documentation.
- Update catalog asset paths if the project’s deploy/build system requires a different path scheme.
- All assets must remain individually replaceable and individually equipable.

## State and persistence

Integrate character state into the existing student profile/progression save. Do not make a competing localStorage key or duplicate profile object.

Add a safe migration for existing students:

1. Preserve their existing name/pronouns if available.
2. Preserve a valid existing skin tone; otherwise add `appearance.skinTone = 'tone-4'` without changing any other profile field.
3. Convert old owned cosmetics into the closest compatible new slot item where a mapping is safe.
4. Where no safe mapping exists, preserve the old item as a legacy inventory record or grant a small Archive Token refund according to the existing economy.
5. Give every pre-existing student the new starter loadout if they do not already own equivalent starter items.
6. Never delete a student’s Archive Tokens, XP, badges, quests, or progress.

Use `quest-character-engine.js` for all character inventory operations: creation, grant, equip, unequip, and layer construction. UI components must never directly mutate inventory or equipped slots.

## Store and rewards

Replace room/town/decor store categories with these exact visible categories:

- Shoes
- Shirts
- Hats
- Belts
- Pants
- Hand Items
- Transportation

Use the supplied character item catalog as the active starting catalog. Keep Archive Token prices in the single/double-digit range. Do not let the store sell XP, grades, answers, rubric points, extensions, or assessment advantages.

Items can be acquired through four paths: starter, store, quest reward, or badge reward. A student must own an item before equipping it. Duplicate rewards must not add duplicate inventory entries.

When a student earns a new item through a quest or badge, show a non-blocking “New Gear Available” indicator on the map and a clear button to open Customize. The equipped item should not change automatically unless it is a starter item or the student explicitly confirms equip.

## Required UI surfaces

1. **Map header/profile widget**
   - shows student name, small layered character preview, Archive Token balance, and Customize button.
   - shows Create Your Historian if no character exists.
   - shows a new-item indicator when owned items are unseen.

2. **Two-step creation modal**
   - semantic dialog, accessible focus handling, close/dismiss behavior.
   - page 1 must validate name/model/skin tone/pronouns before page 2.
   - show all eight skin-tone swatches, a visible selected state, accessible labels, and a note that skin tone can be changed later for free.
   - page 2 shows the starter loadout and seven equipment slot cards.
   - creation must save only after the final “Enter the map” action.

3. **Customize/Inventory screen**
   - large character stage on one side, equipment slots and owned items on the other.
   - add a separate **Appearance** section that lets students change skin tone for free using `setCharacterSkinTone`; it must not appear as an inventory slot or store item.
   - clicking a slot filters to only owned compatible items.
   - support unequip/empty state for hat, hand, and transportation; preserve starter items as available but allow swapping them.
   - clearly show “new,” equipped, locked, and not-owned states.

4. **Store integration**
   - category filters match the equipment slots.
   - item card shows rarity, price, acquisition restrictions, and whether owned/equipped.
   - purchase grants to inventory through the existing Store/Archive Token transaction engine and then makes the item equipable.

5. **Badge and quest reward integration**
   - badge rewards and quest rewards must use `grantCharacterItem`.
   - display the exact reward item on the badge/quest completion UI.
   - do not claim an item is earned until the grant transaction succeeds.

## Accessibility and quality

- Follow existing game visual style rather than default dashboard visuals.
- Use the supplied historical parchment/ink styling only where it fits the existing design.
- Responsive on desktop and mobile.
- Preserve keyboard navigation, focus states, semantic labels, and alt/ARIA labeling.
- Do not make a student choose a gender identity to progress; the requested woman/man selection is an illustrated character model choice only.
- Skin tone is a free visual base-appearance choice only: never a rarity, price, reward, academic trait, narrative faction, or gameplay advantage.
- Avoid console errors and invalid asset URLs.
- Add code comments at migration boundaries and at any place the existing data model differs from the package model.

## Final response requirements

When complete, provide:

1. A file-by-file summary of all changes.
2. The migration approach used for previous character/cosmetic data.
3. The active item catalog path and asset folder path.
4. The exact quest/badge reward hooks now connected to item grants.
5. A list of anything intentionally preserved from the old system.
6. A manual test checklist covering:
   - first-time map landing
   - dismissing and reopening creator
   - creating a man and a woman model
   - selecting each skin tone and confirming it updates the live preview
   - changing skin tone later without changing inventory, equipment, Archive Tokens, XP, badges, or progress
   - starter loadout display
   - buying an item with Archive Tokens
   - equipping and unequipping each slot
   - new item notification after a quest/badge
   - persistence after refresh
   - legacy student migration

Do the implementation now; do not stop at a plan or prototype.

---
