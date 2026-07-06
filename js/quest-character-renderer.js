/**
 * DOM helper for a stacked-SVG paper-doll render.
 * Use this module in the existing app rather than embedding static full-character SVGs.
 */
import { getCharacterLayers, getCharacterSkinTone } from './quest-character-engine.js';
import { getCharacterBaseModelConfig, getSkinToneColor } from './quest-character-items-png.js';

function renderLegacyLayers(container, layers) {
  layers.forEach((layer) => {
    const source = layer.equipmentLayerAssetPath || layer.assetPath;
    if (!source) return;
    const image = document.createElement('img');
    image.className = `quest-character-layer quest-character-layer--${layer.slot}`;
    image.src = source;
    image.alt = '';
    image.loading = 'eager';
    image.decoding = 'async';
    image.style.zIndex = String(layer.zIndex);
    image.dataset.slot = layer.slot;
    image.dataset.itemId = layer.id;
    if (layer.skinTone) image.dataset.skinTone = layer.skinTone;
    container.append(image);
  });
}

export function renderCharacterStage(container, character, options = {}) {
  if (!container) throw new Error('A character-stage container is required.');
  const { label = 'Character preview', showSlotLabels = false, preferPngContract = true } = options;
  const layers = getCharacterLayers(character);
  const skinTone = getCharacterSkinTone(character);
  const modelId = character?.baseModel || character?.identity?.sex || 'woman';
  const modelConfig = getCharacterBaseModelConfig(modelId);
  const equipmentLayers = layers.filter((layer) => layer.slot !== 'base');
  const hasAlignedEquipmentLayers = equipmentLayers.some((layer) => Boolean(layer.equipmentLayerAssetPath));

  container.replaceChildren();
  container.classList.add('quest-character-stage');
  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', label);
  container.dataset.skinTone = skinTone;

  if (preferPngContract && modelConfig?.basePath) {
    const stack = document.createElement('div');
    stack.className = 'quest-character-png-stack';
    stack.setAttribute('aria-hidden', 'true');

    const transportation = equipmentLayers.find((layer) => layer.slot === 'transportation');
    if (transportation?.equipmentLayerAssetPath) {
      const transportLayer = document.createElement('img');
      transportLayer.className = 'quest-character-layer quest-character-layer--transportation';
      transportLayer.src = transportation.equipmentLayerAssetPath;
      transportLayer.alt = '';
      transportLayer.loading = 'eager';
      transportLayer.decoding = 'async';
      stack.append(transportLayer);
    }

    if (modelConfig.skinMaskReady && modelConfig.skinMaskPath) {
      const skinTint = document.createElement('div');
      skinTint.className = 'quest-character-skin-tint';
      skinTint.style.setProperty('--skin-tone-color', getSkinToneColor(skinTone));
      skinTint.style.setProperty('--skin-mask-url', `url(${modelConfig.skinMaskPath})`);
      stack.append(skinTint);
    }

    const baseImage = document.createElement('img');
    baseImage.className = 'quest-character-layer quest-character-layer--base';
    baseImage.src = modelConfig.basePath;
    baseImage.alt = '';
    baseImage.loading = 'eager';
    baseImage.decoding = 'async';
    baseImage.addEventListener('error', () => {
      stack.remove();
      renderLegacyLayers(container, layers);
    }, { once: true });
    stack.append(baseImage);

    if (hasAlignedEquipmentLayers) {
      equipmentLayers.forEach((layer) => {
        if (!layer.equipmentLayerAssetPath || layer.slot === 'transportation') return;
        const image = document.createElement('img');
        image.className = `quest-character-layer quest-character-layer--${layer.slot}`;
        image.src = layer.equipmentLayerAssetPath;
        image.alt = '';
        image.loading = 'eager';
        image.decoding = 'async';
        image.dataset.slot = layer.slot;
        image.dataset.itemId = layer.id;
        stack.append(image);
      });
    }

    container.append(stack);
  } else {
    renderLegacyLayers(container, layers);
  }

  if (showSlotLabels) {
    container.dataset.debugSlots = 'true';
  } else {
    delete container.dataset.debugSlots;
  }
  return container;
}
