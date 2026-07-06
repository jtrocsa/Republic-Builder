# Asset Catalog

There are 77 original SVG cosmetics, all designed as transparent layers that fit the supplied base models.

## Base appearance assets

- Two character models: man and woman.
- Eight skin-tone variants for each model: **16 aligned base SVGs**.
- Default / migration tone: `tone-4`.
- Base asset paths live in `assets/characters/base/`.
- Palette reference: `assets/characters/base/skin-tone-palette.json`.

Skin tone is a free appearance selection. It is not an inventory item, purchasable cosmetic, equipment slot, quest reward, or badge reward.

## Equipment slots

- Shoes: 11 assets
- Shirts: 11 assets
- Hats: 11 assets
- Belts: 11 assets
- Pants: 11 assets
- Hand items: 11 assets
- Transportation: 11 assets

Starter assets are included in the 11 per apparel/hand categories. Hats and transportation intentionally begin empty; their 11 assets are unlockables.

## File paths

```text
assets/characters/base/
assets/characters/shoes/
assets/characters/shirts/
assets/characters/hats/
assets/characters/belts/
assets/characters/pants/
assets/characters/hands/
assets/characters/transportation/
assets/characters/previews/
```

All usable item records and file paths are in `data/quest-character-items.js`. Do not hand-maintain a second asset list in the UI.

## Era strategy

The catalog intentionally includes several early-America items that can be used during Unit 1, plus future-era items for later store rotations and badge rewards. Lock advanced/rare assets behind unit availability or badge/quest prerequisites rather than exposing every item immediately.
