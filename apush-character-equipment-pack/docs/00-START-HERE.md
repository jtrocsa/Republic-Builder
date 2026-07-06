# Start Here — Character System Update

## The new player loop

1. The **map is the home screen**. It is never replaced by mandatory character creation.
2. New students see a visible but dismissible **Create Your Historian** callout on the map.
3. Clicking the callout opens a two-step modal.
4. Step 1 captures `name`, `sex` (the selected base model), `skinTone`, and `pronouns`. Skin tone is always free and may be changed later in Customize → Appearance.
5. Step 2 is a classic RPG paper-doll gear screen. Students begin with the same basic loadout.
6. Future cosmetics are earned through quest rewards, badges, and the Archive Token store.
7. The player can reopen **Customize** from the home-map header, profile card, or “new item” pop-up.

## Do not bring forward

- No room/home/lot system.
- No town decoration catalog.
- No visual rewards that suggest the player is constructing a republic or managing a settlement.
- No single static avatar image after character creation.

## Keep from the progression package

- Historian XP and overall level.
- Archive Tokens as the store currency.
- Assessment Mastery Badges and Unit Collection Badges.
- Badge/quest reward logic and teacher controls.

The store should now contain equipment and cosmetics, not room items.

## Fastest integration order

1. Keep this package folder intact as reference/source files.
2. Have VS Code inspect the current repository before moving or importing anything.
3. Add the catalog, engine, renderer, and stylesheet.
4. Add the new Character modal and map callout.
5. Replace old store room/decor data with wearable/equipable item data.
6. Connect quest and badge reward events to `grantCharacterItem`.
7. Test the starter flow and one reward unlock before converting every existing cosmetic.

## Skin tone update

- Skin tone is a **free appearance setting**, not equipment, store inventory, a badge reward, or an academic trait.
- Eight skin-tone options are supplied for both base models.
- The saved profile field is `character.appearance.skinTone`; the default/migration fallback is `tone-4`.
- Use `setCharacterSkinTone()` and rerender the paper doll after a change.
- Read `docs/08-SKIN-TONE-APPEARANCE.md` before integrating or migrating existing profiles.
