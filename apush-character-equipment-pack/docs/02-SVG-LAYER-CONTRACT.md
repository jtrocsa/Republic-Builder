# SVG Layer Contract

## Non-negotiable rules

1. Every SVG uses `viewBox="0 0 512 768"`.
2. Every cosmetic is transparent outside its art. Never add a background rectangle.
3. Every cosmetic is a complete canvas-sized layer, even when the actual art is small.
4. Place character layers using CSS stacking, not by modifying SVG coordinates in the browser.
5. Do not bake the character body into any cosmetic SVG.
6. Render all active assets using one `position: relative` stage and absolute `<img>` layers.
7. Transportation assets must always render behind the base character.
8. The base layer is selected from `model + skinTone`. Use the supplied tone-specific base SVG paths; do not recolor a flattened avatar or attempt CSS filters.

## Why separate SVG layers matter

A hat, journal, or vehicle stays replaceable with a single inventory/equip update. A flattened character image would break the store, rewards, future art swaps, and player customization.

## Rendering example

```js
renderCharacterStage(stageElement, studentProfile.character, {
  label: `${studentProfile.character.identity.name}'s character`
});
```

Do not rely on an asset’s filename to set visual order. Use the configured `equipOrder`.

## Compatible future work

Future artists can replace an SVG at the exact same path or add a new catalog record, provided the 512 × 768 alignment and transparent-layer rules remain intact. New skin-tone variants must use identical base geometry and include both the man and woman model.
