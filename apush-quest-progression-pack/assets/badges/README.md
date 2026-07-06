# Badge Asset Pack

## Included files

- `general/` — eight tiered assessment badge icons.
- `unit-1/` — five Unit 1 collection badges and the Unit 1 Master Seal.
- `ui/` — Archive Token, locked placeholder, and Bronze/Silver/Gold tier support emblems.
- `badge-contact-sheet.svg` — quick visual preview of all fourteen main badges.

## How to use

Use the individual SVG files in `<img>` tags or CSS background images. Keep text labels in HTML rather than embedded in the SVG so the UI remains accessible and the badges stay reusable at different sizes.

```html
<img src="assets/badges/general/mcq-mastery.svg" alt="MCQ Mastery Badge" />
```

## State treatment

Do not make separate colored copies for locked and active variants. Apply state in CSS:

- Locked: grayscale + low opacity.
- Active: full color with a progress bar/ring in the card UI.
- Bronze/Silver/Gold: add the relevant tier chip or border around the card.

All badge assets are original vector artwork created for this project and do not use Pokémon, College Board, or other third-party artwork.
