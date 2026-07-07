import { CHARACTER_ITEM_CATALOG } from './quest-character-items-png.js';

const SLOT_LABELS = Object.freeze({
  shoes: 'Shoes',
  shirts: 'Shirt',
  hats: 'Hat',
  belts: 'Belt',
  pants: 'Pants',
  hands: 'Hand',
  transportation: 'Transportation'
});

/**
 * Active equipment-first store catalog.
 * Source of truth is the character item catalog from the equipment pack.
 */
export const STARTER_STORE_ITEMS = CHARACTER_ITEM_CATALOG
  .map((item) => ({
    id: item.id,
    name: item.name,
    category: item.slot,
    categoryLabel: SLOT_LABELS[item.slot] || item.slot,
    slot: item.slot,
    assetPath: item.previewAssetPath || item.assetPath,
    previewAssetPath: item.previewAssetPath || item.assetPath,
    equipmentLayerAssetPath: item.equipmentLayerAssetPath || null,
    rarity: item.rarity,
    price: Number(item.price ?? 0),
    cosmeticOnly: true,
    repeatable: false,
    description: item.description,
    requiresBadgeId: null,
    requiresQuestId: null
  }));

export function getStoreItemById(itemId, items = STARTER_STORE_ITEMS) {
  return items.find((item) => item.id === itemId) || null;
}
