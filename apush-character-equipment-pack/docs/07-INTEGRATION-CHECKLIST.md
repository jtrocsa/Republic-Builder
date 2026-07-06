# Integration Checklist

## Before merging

- [ ] Inspect existing character and store code before moving assets.
- [ ] Confirm whether the site serves SVG paths from `/assets`, a bundler import, or another public directory.
- [ ] Identify current profile persistence and add character schema through one migration path.
- [ ] Map missing legacy skin-tone data to `tone-4` without overwriting any existing identity, inventory, XP, badge, or token data.
- [ ] Identify every old room/decor item and decide: mapped, legacy-preserved, or token-refunded.

## Core implementation

- [ ] Import the item catalog, engine, renderer, and CSS.
- [ ] Add the map callout and character profile widget.
- [ ] Build the semantic two-page dialog with an eight-option skin-tone swatch grid on page 1.
- [ ] Add a free Customize → Appearance control that uses `setCharacterSkinTone`.
- [ ] Build the full Customize screen with filterable owned inventory.
- [ ] Change store categories to the seven equipment slots.
- [ ] Connect store purchase success to `grantCharacterItem` / existing token transaction result.
- [ ] Connect quest/badge rewards to `grantCharacterItem`.
- [ ] Show non-blocking new-item notification.

## Tests

- [ ] Every one of the 16 model/skin-tone base layers renders with starter gear.
- [ ] Base layers and every cosmetic asset render on both base models.
- [ ] Hat/hand/transportation empty state works.
- [ ] No item can be equipped before it is owned.
- [ ] No duplicate inventory record after repeated reward event.
- [ ] Purchase subtracts Archive Tokens but not XP.
- [ ] Existing students retain XP/tokens/badges/quests after migration.
- [ ] Mobile paper-doll interface remains usable.
- [ ] Skin tone can be changed after creation without changing equipment, inventory, Archive Tokens, XP, badges, or quest progress.
