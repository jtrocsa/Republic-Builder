# One-Model Skin Tone System

## The rule
For each visual model, there is exactly **one base body image**.

```text
woman-base-neutral.png
woman-skin-mask.png
man-base-neutral.png
man-skin-mask.png
```

Do **not** create or manage sixteen full-body character files such as `woman-tone-1.png` through `woman-tone-8.png`.

## How it works

1. `woman-base-neutral.png` and `man-base-neutral.png` are transparent, static, front-facing base models.
2. Skin pixels on the base art are neutral/grayscale so light and shadow remain realistic.
3. `*-skin-mask.png` is an alpha-only transparency mask that covers only exposed skin: face, neck, hands, and any visible ankles/arms.
4. The renderer draws a colored layer through that mask using the selected tone value.
5. All clothing layers sit above this skin tint layer, so shirts, pants, shoes, hats, and hand items are never recolored.

## Rendering order

```text
1. transportation
2. base model
3. dynamic skin tint (masked)
4. pants
5. shirt
6. belt
7. shoes
8. hand item
9. hat
```

## Skin-tone values
The following IDs are permanent and should not be renamed after profiles exist:

```text
tone-1
tone-2
tone-3
tone-4
tone-5
tone-6
tone-7
tone-8
```

Skin tone is:

- selected in character creation
- editable later through Customize → Appearance
- free
- never an inventory item
- never purchasable
- never badge-locked
- never a quest reward

## Important implementation warning
Do not use a CSS filter on the full base model to change skin tone. It will recolor linen, hair, belts, and shadows.

Use the separate skin mask with `mask-image` / `-webkit-mask-image` and an isolated blend layer, or use an equivalent Canvas compositing method.

## Recommended CSS approach

```css
.character-stack {
  position: relative;
  isolation: isolate;
}

.character-layer,
.character-skin-tint {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.character-skin-tint {
  background: var(--skin-tone-color);
  -webkit-mask-image: var(--skin-mask-url);
  mask-image: var(--skin-mask-url);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-position: center;
  mask-position: center;
  mix-blend-mode: color;
}
```

## Existing-student migration
For profiles without a saved skin tone, assign `tone-4`. Do not reset name, pronouns, XP, Archive Tokens, badges, quest completion, inventory, or equipped items.
