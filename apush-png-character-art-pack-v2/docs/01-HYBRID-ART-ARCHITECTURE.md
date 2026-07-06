# Hybrid Art Architecture

## Media split

### PNG / WebP assets
Use raster art for all high-fidelity illustrated objects:

- static character models
- skin masks
- avatar equipment layers
- hats, shirts, belts, pants, shoes
- hand items
- transportation
- store-card product art
- quest illustrations

### SVG assets
Keep SVG for items that benefit from sharp scalable graphics:

- badge medallions
- UI icons
- buttons
- map markers
- decorative borders
- simple emblems

## Why the game is moving to PNG/WebP
The target art style uses visible linen weave, leather grain, brass hardware, stitch work, painterly shading, and detailed silhouettes. PNG/WebP supports this much better than the previous flat vector cosmetic pack.

## Static paper-doll renderer
The character does not animate. That makes a PNG paper-doll renderer reliable and simple.

```text
transportation
base model
skin tint mask
pants
shirt
belt
shoes
hand item
hat
```

Each layer occupies the exact same locked canvas. Equipping an item replaces only the image for that slot.

## Required separation: store preview versus equipped art
Every cosmetic can have two visual representations:

1. **Store preview** — standalone product illustration, readable on an inventory/store card.
2. **Equipment layer** — transparent image aligned to the fixed character pose and canvas.

The included Unit 1 item PNGs are currently high-fidelity store/source art. Do not use them as final equipment layers until corresponding pose-aligned exports exist.
