/**
 * DOM helper for a stacked-SVG paper-doll render.
 * Use this module in the existing app rather than embedding static full-character SVGs.
 */
import { getCharacterLayers, getCharacterSkinTone } from './quest-character-engine.js';

export function renderCharacterStage(container, character, options = {}) {
  if (!container) throw new Error('A character-stage container is required.');
  const { label = 'Character preview', showSlotLabels = false } = options;
  const layers = getCharacterLayers(character);
  container.replaceChildren();
  container.classList.add('quest-character-stage');
  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', label);
  container.dataset.skinTone = getCharacterSkinTone(character);

  layers.forEach((layer) => {
    const image = document.createElement('img');
    image.className = `quest-character-layer quest-character-layer--${layer.slot}`;
    image.src = layer.assetPath;
    image.alt = '';
    image.loading = 'eager';
    image.decoding = 'async';
    image.style.zIndex = String(layer.zIndex);
    image.dataset.slot = layer.slot;
    image.dataset.itemId = layer.id;
    if (layer.skinTone) image.dataset.skinTone = layer.skinTone;
    container.append(image);
  });

  if (showSlotLabels) {
    container.dataset.debugSlots = 'true';
  } else {
    delete container.dataset.debugSlots;
  }
  return container;
}
