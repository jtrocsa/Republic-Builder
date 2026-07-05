# Asset Guide

## Included assets

| Asset | Purpose | Where it is used |
|---|---|---|
| `assets/art/forge-crest.svg` | Republic Builder shield/forge crest | Rail header and completion screen |
| `assets/backgrounds/forge-city.svg` | Original fantasy colonial-city skyline | Full app background and avatar stages |
| `js/icons.js` | Original inline line-art icon set | Professions, Founder Paths, and Historian Skills |
| `avatarSvg()` in `js/app.js` | Layered founder illustration | Identity, Appearance, Clothing, Review, Completion |

## Art direction

The UI uses an original high-fantasy MMO direction:

- Iron-blue panels and warm, antique gold framing.
- City silhouettes, lantern glow, and engraved borders.
- Jewel-like selection states instead of plain web checkboxes.
- Clear readable contrast suitable for an instructional setting.

Do not copy World of Warcraft characters, UI textures, logos, icons, maps, or game files. Use the phrase “high-fantasy MMO-inspired” when describing the visual goal to artists or image-generation tools.

## Adding your own images

Place new image assets in a sensible subfolder:

```text
assets/
├── backgrounds/
├── characters/
├── clothing/
├── icons/
├── items/
└── portraits/
```

Use descriptive kebab-case names, for example:

```text
assets/clothing/revolutionary-cockade-hat.webp
assets/portraits/founder-scholar-frame.svg
assets/backgrounds/philadelphia-1776.webp
```

## Recommended image formats

- Use **SVG** for icons, UI crests, badges, and decorative frames.
- Use **WebP** for detailed illustrations and backgrounds.
- Use **PNG** for images that need transparency and cannot reasonably be SVG.
- Avoid enormous uncompressed PNG/JPG files in a student-facing site.

## Generated-art workflow

For high-quality character portraits or era backgrounds, generate or commission **original** assets. Keep a small asset record:

```text
asset name:
source / creator:
license or permission:
created date:
intended game use:
alt text:
```

Always write alt text for meaningful art. Decorative flourishes may use empty alt text.

## Swapping the SVG avatar for painted portraits

The current avatar is intentionally a lightweight layered SVG so clothes update instantly and the project does not require a database or complicated sprite system. Later, you can move to a portrait system in stages:

1. Keep the current state fields (`hat`, `shirt`, `vest`, etc.).
2. Export transparent PNG/WebP layers for each clothing slot.
3. Stack them with absolutely positioned `<img>` elements.
4. Keep the selection state and render functions; change only the avatar renderer.
5. Test every valid outfit combination and every responsive breakpoint.

For a more advanced game, use a sprite atlas or a canvas renderer only after the base content is stable.
