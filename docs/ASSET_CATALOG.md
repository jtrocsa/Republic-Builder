# Asset Catalog

## Asset approach

This repository uses **original, lightweight SVG placeholder art** so the initial GitHub Pages build is self-contained and fast. The files are designed for a visual prototype, not as final historical costume research.

All character clothing layers share the same `viewBox="0 0 400 500"`. That means they can be stacked in the browser without a canvas library or image editor.

## Existing dashboard assets

| File | Used for |
|---|---|
| `assets/brand-seal.svg` | Republic Builder seal and Forge branding |
| `assets/republic-crest.svg` | Republic status card |
| `assets/hero-scholar.svg` | General historical-scholar art |
| `assets/era-revolution.svg` | Revolution-era sidebar artwork |
| `assets/quest-*.svg` | Quest-card and modal illustrations |

## Character base layers

| File | Use |
|---|---|
| `assets/character/base/woman.svg` | Woman presentation base layer |
| `assets/character/base/man.svg` | Man presentation base layer |
| `assets/character/base/neutral.svg` | Nonbinary / another-identity presentation base layer |

## Wardrobe layers

### Hats

- `hat-none.svg`
- `round-cap.svg`
- `wide-brim.svg`
- `tricorn.svg`

### Shirts / tunics

- `basic-tunic.svg`
- `linen-shirt.svg`
- `work-shirt.svg`
- `blue-vest.svg`

### Pants

- `plain-trousers.svg`
- `work-breeches.svg`
- `navy-breeches.svg`
- `striped-trousers.svg`

### Socks

- `wool-socks.svg`
- `striped-socks.svg`
- `blue-socks.svg`
- `charcoal-socks.svg`

### Shoes

- `simple-shoes.svg`
- `work-boots.svg`
- `buckled-shoes.svg`
- `riding-boots.svg`

### Special item placeholder

- `assets/character/special/locked-relic.svg`

This is a locked visual placeholder. In the production build, a quest-earned special item would replace it with an unlocked SVG asset.

## Layer order

`app.js` uses this order:

1. Base character
2. Socks
3. Pants
4. Shoes
5. Shirt
6. Hat
7. Unlocked special item

Every future layer should preserve the same `400 × 500` coordinate system. Avoid opaque backgrounds; a wardrobe SVG should be transparent outside the clothing object.

## Adding a wardrobe item

1. Add an SVG to the relevant folder.
2. Keep the `viewBox="0 0 400 500"`.
3. Add the item to the appropriate `wardrobe` array in `data.js`.
4. Test it in the Character Forge at desktop and mobile widths.
5. Add the file to this document.

Example:

```js
{
  id: "reform-ribbon",
  name: "Reform Ribbon",
  asset: "assets/character/special/reform-ribbon.svg",
  note: "Earned by completing a reform-era primary-source quest.",
  locked: false
}
```

## Historical and legal guardrails

- Use original art, public-domain art, or assets with a license compatible with classroom/web use.
- Keep a source record for any non-original image before committing it.
- Do not use College Board logos, assessment materials, or protected visuals as game art.
- For historical clothing, prioritize context and accuracy over parody or “loot” framing.
- Avoid making culturally specific dress, violence, enslavement, or symbols of oppression into cosmetic rewards.

## Later production upgrade

The SVG assets are intentionally simple. A later version can replace them with commissioned art, properly licensed public-domain images, or sprite sheets without changing the game data structure, as long as the asset paths remain valid.
