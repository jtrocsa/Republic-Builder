I copied the complete `apush-png-character-art-pack-v2/` folder into this repository’s main game folder. Implement the revised PNG character architecture into the existing APUSH game now.

First inspect the repository, current map/home screen, existing character creator, inventory/store, quest/progression code, persistence, assets, and CSS. Preserve the framework, existing quest/badge/XP/Archive Token systems, visual direction, and file naming conventions. Do not replace the application with a new framework or build a disconnected demo page.

Read every file in `apush-png-character-art-pack-v2/docs/` before changing code. Keep the source package folder intact after implementation.

## Non-negotiable architecture

Use a hybrid art system:

- PNG/WebP: static character bases, skin masks, equipment, transportation, store previews, quest art
- SVG: badges, UI icons, buttons, map markers, decorative borders, simple emblems

## Critical correction: only one base per visual model

Do **not** create or expect eight base PNGs for each model.

The final production model is:

```text
one `woman-base-neutral.png` + one `woman-skin-mask.png`
one `man-base-neutral.png` + one `man-skin-mask.png`
eight dynamic skin-tone values applied through the mask
```

Store skin tone in `character.appearance.skinTone` using `tone-1` through `tone-8`.

Skin tone is a free appearance setting, editable in character creation and Customize → Appearance. It is never inventory, store currency, a badge reward, or quest reward.

Do not use a whole-image CSS filter to recolor skin; that will recolor clothes and hair. Use the skin-mask renderer described in `02-ONE-MODEL-SKIN-TONE-SYSTEM.md`.

## Character creator

The game opens to the existing map/home screen, not the creator. If a player is unset up, show a dismissible onboarding prompt plus a persistent Customize/Profile entry point.

Use two creator pages:

### Page 1: Identity and Appearance
- name
- visual model: woman or man
- pronouns
- skin tone

Use the two reference sheets in `assets/reference/` for the visual palette, but do not slice them into sixteen live base models.

### Page 2: Unit 1 starter loadout
Show a classic MMO-style equipment panel with these slots:
- hat
- shirt
- belt
- pants
- shoes
- hand
- transportation

Equip the starter set automatically:
- Weathered Tricorn
- Homespun Linen Shirt
- Brass Buckle Belt
- Colonial Field Breeches
- Colonial Buckle Shoes
- Rolled Sea Chart
- Bay Mare

Use those proper names everywhere. Never show generic labels such as “Starter Hat” or “Starter Shoes.”

## Live renderer layer order

```text
transportation
base model
masked skin tint
pants
shirt
belt
shoes
hand item
hat
```

All final equipment layers must use the locked canvas/pose contract from `03-AVATAR-LAYER-CONTRACT.md`.

## Art integration requirement

The included files in `assets/unit-1/store-previews-transparent/` are approved **store/inventory/reward** PNGs. Wire them into item cards, store details, inventory, and reward popups immediately.

They are not final character-aligned equipment layers. Do not fake the equipped avatar by scaling standalone product art over the body. Keep the current avatar renderer as a safe fallback until aligned gear-layer files are delivered, but build the new PNG renderer interface and asset registry now so it can accept final layers without another architecture rewrite.

## Inventory, store, and rewards

- one equipped item per slot
- equipping an item replaces the current item in that slot
- owned items remain owned after unequipping
- starter gear cannot be lost
- Archive Tokens purchase cosmetics; Historian XP is never spent
- badge/quest rewards may grant an item directly
- direct grants show the item art and an Equip Now action
- show New Gear Available when a player owns an unequipped item

## Migration

- preserve XP, Archive Tokens, badges, quest completion, transaction history, and valid owned items
- preserve name and pronouns
- map legacy avatar/gender data to `woman` or `man`
- default missing skin tone to `tone-4`
- add `characterVersion: 4`
- grant starter set if it is missing
- hide legacy room, home, furniture, builder, Founder Path, and starting Historian Skill systems without deleting old data

## Visual requirements

Use the current Atlantic Crossroads UI as the palette anchor:
- deep navy / teal
- warm cream cards
- muted brass/gold accents
- high-fidelity but readable illustration

## Final response

Report:
1. files changed
2. active rendering/data locations
3. what uses the supplied store-preview PNGs now
4. what is intentionally waiting for aligned avatar-equipment exports
5. migration behavior
6. manual tests for two models, all eight skin tones, starter equipment, store purchase, quest reward, equip/unequip, transport layer, XP protection, and old-profile migration
