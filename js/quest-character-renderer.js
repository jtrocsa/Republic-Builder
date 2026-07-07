/**
 * DOM helper for a stacked-SVG paper-doll render.
 * Use this module in the existing app rather than embedding static full-character SVGs.
 */
import { getCharacterLayers, getCharacterSkinTone } from './quest-character-engine.js';
import { getCharacterBaseModelConfig, getSkinToneColor } from './quest-character-items-png.js';
import { CHARACTER_STARTER_LOADOUT } from './quest-character-items-png.js';

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

function renderProxyItemLayers(container, layers) {
  const proxyLayout = {
    hats: { z: 7, top: '14%', left: '50%', width: '40%', height: '18%', className: 'quest-character-proxy--hats' },
    shirts: { z: 4, top: '34%', left: '50%', width: '44%', height: '24%', className: 'quest-character-proxy--shirts' },
    belts: { z: 5, top: '50%', left: '50%', width: '22%', height: '9%', className: 'quest-character-proxy--belts' },
    pants: { z: 2, top: '63%', left: '50%', width: '36%', height: '22%', className: 'quest-character-proxy--pants' },
    shoes: { z: 3, top: '89%', left: '50%', width: '22%', height: '12%', className: 'quest-character-proxy--shoes' },
    hands: { z: 6, top: '50%', left: '66%', width: '18%', height: '15%', className: 'quest-character-proxy--hands' },
    transportation: { z: 0, top: '74%', left: '50%', width: '44%', height: '22%', className: 'quest-character-proxy--transportation' }
  };

  layers.forEach((layer) => {
    const preview = layer.previewAssetPath || layer.assetPath;
    const placement = proxyLayout[layer.slot];
    if (!placement || !preview) return;
    const image = document.createElement('img');
    image.className = `quest-character-proxy-layer ${placement.className}`;
    image.src = preview;
    image.alt = layer.name || layer.slot;
    image.loading = 'eager';
    image.decoding = 'async';
    image.style.zIndex = String(placement.z);
    image.style.top = placement.top;
    image.style.left = placement.left;
    image.style.width = placement.width;
    image.style.height = placement.height;
    image.dataset.slot = layer.slot;
    image.dataset.itemId = layer.id;
    image.dataset.itemName = layer.name || '';
    container.append(image);
  });
}

function getProceduralSkinMask(modelId = 'woman') {
  const shared = [
    'radial-gradient(ellipse 13% 11% at 50% 16%, #000 0 98%, transparent 100%)',
    'radial-gradient(ellipse 7% 4% at 50% 25%, #000 0 98%, transparent 100%)',
    'radial-gradient(ellipse 7% 8% at 31% 57%, #000 0 98%, transparent 100%)',
    'radial-gradient(ellipse 7% 8% at 69% 57%, #000 0 98%, transparent 100%)'
  ];
  if (modelId === 'man') {
    return [
      ...shared,
      'radial-gradient(ellipse 3% 4% at 27% 45%, #000 0 98%, transparent 100%)',
      'radial-gradient(ellipse 3% 4% at 73% 45%, #000 0 98%, transparent 100%)'
    ].join(', ');
  }
  return [
    ...shared,
    'radial-gradient(ellipse 3% 4% at 28% 45%, #000 0 98%, transparent 100%)',
    'radial-gradient(ellipse 3% 4% at 72% 45%, #000 0 98%, transparent 100%)'
  ].join(', ');
}

export function renderCharacterStage(container, character, options = {}) {
  if (!container) throw new Error('A character-stage container is required.');
  const {
    label = 'Character preview',
    showSlotLabels = false,
    preferPngContract = true,
    showTemporaryEquipmentFallback = true
  } = options;
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

    const hasToneSpecificBase = Boolean(modelConfig.baseByTonePath?.[skinTone]);

    if (!hasToneSpecificBase) {
      const skinTint = document.createElement('div');
      skinTint.className = 'quest-character-skin-tint';
      skinTint.style.setProperty('--skin-tone-color', getSkinToneColor(skinTone));
      if (modelConfig.skinMaskReady && modelConfig.skinMaskPath) {
        skinTint.style.setProperty('--skin-mask-url', `url(${modelConfig.skinMaskPath})`);
      } else {
        skinTint.style.setProperty('--skin-mask-url', getProceduralSkinMask(modelId));
      }
      stack.append(skinTint);
    }

    const baseImage = document.createElement('img');
    baseImage.className = 'quest-character-layer quest-character-layer--base';
    baseImage.src = modelConfig.baseByTonePath?.[skinTone] || modelConfig.basePath;
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
    } else if (showTemporaryEquipmentFallback) {
      const temporaryLayers = equipmentLayers.filter((layer) => {
        const starterItemId = CHARACTER_STARTER_LOADOUT[layer.slot];
        return Boolean(layer.id || starterItemId);
      });
      renderProxyItemLayers(stack, temporaryLayers);
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
