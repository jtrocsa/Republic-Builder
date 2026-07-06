import { CHARACTER_ITEM_CATALOG } from './quest-character-items.js';

const SLOT_LABELS = Object.freeze({
  shoes: 'Shoes',
  shirts: 'Shirts',
  hats: 'Hats',
  belts: 'Belts',
  pants: 'Pants',
  hands: 'Hand Items',
  transportation: 'Transportation'
});

/**
 * Active equipment-first store catalog.
 * Source of truth is the character item catalog from the equipment pack.
 */
export const STARTER_STORE_ITEMS = CHARACTER_ITEM_CATALOG
  .filter((item) => item.acquisition === 'store')
  .map((item) => ({
    id: item.id,
    name: item.name,
    category: item.slot,
    categoryLabel: SLOT_LABELS[item.slot] || item.slot,
    slot: item.slot,
    assetPath: item.assetPath,
    rarity: item.rarity,
    price: Number(item.price || 0),
    cosmeticOnly: true,
    repeatable: false,
    description: item.description,
    requiresBadgeId: item.badgeRequirement && item.badgeRequirement !== 'configured-by-teacher' ? item.badgeRequirement : null,
    requiresQuestId: item.questRequirement && item.questRequirement !== 'configured-by-teacher' ? item.questRequirement : null
  }));

export function getStoreItemById(itemId, items = STARTER_STORE_ITEMS) {
  return items.find((item) => item.id === itemId) || null;
}
