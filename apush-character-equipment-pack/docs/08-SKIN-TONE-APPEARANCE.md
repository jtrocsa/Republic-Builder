# Skin Tone and Appearance System

## Design decision

Skin tone belongs to the **base appearance layer**, not the cosmetic economy. It is free at creation and free to change later. It should never be a rarity, store purchase, quest reward, badge reward, achievement, or source of game advantage.

## Supplied options

The package supplies eight numbered skin-tone variants for each of the two base models:

```text
base-man-tone-1.svg ... base-man-tone-8.svg
base-woman-tone-1.svg ... base-woman-tone-8.svg
```

All files have matching `512 × 768` canvases and identical geometry, so every shirt, hat, belt, hand item, shoe, pant, and transportation SVG stays aligned.

## Profile data

```js
character: {
  identity: {
    name: 'Avery',
    sex: 'woman',
    pronouns: 'they/them'
  },
  appearance: {
    skinTone: 'tone-4'
  },
  baseModel: 'woman',
  inventory: [],
  equipped: {}
}
```

Use `tone-4` as the default and migration fallback because it preserves the original package’s base-art palette.

## APIs

```js
import {
  createNewCharacter,
  setCharacterSkinTone,
  getCharacterSkinTone,
  migrateCharacterAppearance
} from './js/quest-character-engine.js';

const character = createNewCharacter({
  name: 'Avery',
  sex: 'woman',
  pronouns: 'they/them',
  skinTone: 'tone-6'
});

const updatedCharacter = setCharacterSkinTone(character, 'tone-2');
```

After saving the changed profile, call `renderCharacterStage()` again. Do not attempt to recolor external SVGs using CSS filters, and do not mutate `character.appearance` directly in a UI component.

## UI requirements

### Page 1: Meet your Historian

Place a visually clear, keyboard-accessible swatch grid below Character model and above Pronouns. Show all eight options. A text note should say: **“Skin tone can be changed later for free.”**

### Customize → Appearance

Add an Appearance subsection above or beside equipment slots. It uses the same swatch grid and immediately updates the live preview. The action only calls `setCharacterSkinTone`; it does not create a transaction, inventory record, reward event, or badge change.

### Accessibility

- Use radio inputs or buttons with `aria-pressed` / `aria-label`.
- Each swatch needs a visible selected state in addition to color alone.
- Use labels such as `Skin Tone 1` through `Skin Tone 8`.
- Never use skin tone as a proxy for an in-game faction, role, or narrative identity.

## Existing-profile migration

When loading a saved character:

1. Keep the stored skin tone if it is one of the eight valid IDs.
2. Otherwise add `appearance.skinTone = 'tone-4'`.
3. Keep all existing model, name, pronouns, equipment, inventory, XP, Archive Tokens, badges, and quests unchanged.
4. Save the migrated profile through the project’s normal profile persistence adapter.

The exported `migrateCharacterAppearance()` helper performs the data-level normalization. Call it in the existing profile migration pipeline rather than creating a second save path.
