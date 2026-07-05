# Integration Guide

## Choose one installation path

### Path A — Replace the current character-creator page

Use this when the current character creator is a standalone page or prototype.

1. Back up your existing files.
2. Copy this project’s `index.html`, `styles.css`, `js/`, and `assets/` into the root of the existing game folder.
3. Replace same-named files.
4. Test it through VS Code Live Server.

This is the easiest path. It gives you the complete implementation as designed.

### Path B — Add it as a feature inside a larger game

Use this when your main game already has a landing page, map, quest log, or dashboard.

1. Create a folder inside the existing game root:

```text
YOUR-GAME-FOLDER/features/character-forge/
```

2. Copy this package’s `assets/`, `js/`, `styles.css`, and `index.html` into that folder.
3. Rename `index.html` to `character-forge.html` if your root already uses `index.html`.
4. Update the relative asset references in `character-forge.html` and `styles.css` if you move files out of their supplied structure.
5. Add a link from your main menu:

```html
<a href="features/character-forge/character-forge.html">Create Your Founder</a>
```

6. Once your game has a map page, replace the `enter` action in `js/app.js` with navigation to the map. Search for this line:

```js
if (action === 'enter') showToast('Founder profile saved. Connect this event to your game map when ready.');
```

Replace it with an appropriate route, for example:

```js
if (action === 'enter') window.location.href = '../map.html';
```

## Exact locations of the important files

| What you want to change | File to edit |
|---|---|
| Main page shell and script link | `index.html` |
| Colors, layout, card effects, responsive design | `styles.css` |
| All character choices and starting state | `js/data.js` |
| Selection behavior, validation, avatar updates, review | `js/app.js` |
| Local saving / later database connection | `js/storage.js` |
| Vector crest | `assets/art/forge-crest.svg` |
| City background | `assets/backgrounds/forge-city.svg` |

## Selection-state implementation

Do not store selection only in a CSS class.

The current implementation uses these fields as the one source of truth:

```js
state.profession = 'printer';
state.path = 'orator';
state.clothing.hat = 'hat-tricorn';
state.primarySkill = 'argument';
state.secondarySkill = 'evidence';
```

Each selection card includes stable identifiers:

```html
<button
  data-select="top"
  data-key="profession"
  data-value="printer">
```

The click handler updates state, saves it, and re-renders:

```js
if (select === 'top') selectTopLevel(key, value);
else selectValue(select, key, value);
```

This is why Profession and Founder Path will register reliably. Do not change their IDs without also updating the corresponding data in `js/data.js`.

## Clothing update implementation

Clothes are not just a menu label. `avatarSvg()` reads `state.clothing` and changes actual SVG visual layers:

- Hat silhouette changes for no hat, wide-brim, tricorn, or linen coif.
- Shirt color and collar change.
- Vest can be removed or changed from leather to brocade.
- Lower garment changes from breeches to trousers or a traveling skirt.
- Boots change color/style.

To add a new clothing item:

1. Add the item to the relevant slot in `CLOTHING` in `js/data.js`.
2. Add its visual color, layer, or conditional SVG markup inside `avatarSvg()` in `js/app.js`.
3. Test changing the item, refreshing the page, and reviewing the saved founder.

## Swap local storage for a backend later

The page currently saves under one browser key:

```js
const STORAGE_KEY = 'republic-builder-character-forge-v1';
```

The app calls only the small adapter in `js/storage.js`. Later, keep the screen code and replace `load`, `save`, and `clear` with an authenticated API call.

Do not place database keys in front-end JavaScript. Use server-side code or environment variables when you move past local storage.

## Embed in an existing CSS environment

This package uses broadly named classes, so the safest integration is to scope it. Add a wrapper class to the body:

```html
<body class="republic-builder-forge">
```

Then prefix the selectors in `styles.css` with `.republic-builder-forge` if your existing project has style collisions.

## Content security note

This package is self-contained: the interface uses local system serif and sans-serif font fallbacks and does not require third-party font loading. The game logic and included SVG assets are local.
