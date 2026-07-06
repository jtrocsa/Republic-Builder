/**
 * Character and cosmetic inventory rules engine.
 * Integrate this with the existing student profile/store persistence adapter.
 * Do not allow UI components to mutate character.inventory or character.equipped directly.
 */
import {
  CHARACTER_ITEM_CATALOG,
  CHARACTER_STARTER_LOADOUT,
  CHARACTER_BASE_MODELS,
  CHARACTER_SLOTS,
  CHARACTER_SYSTEM_DEFAULTS,
  CHARACTER_DEFAULT_SKIN_TONE,
  getCharacterBaseAsset,
  isCharacterSkinTone
} from './quest-character-items.js';

const itemById = new Map(CHARACTER_ITEM_CATALOG.map((item) => [item.id, item]));
const validSlots = new Set(CHARACTER_SLOTS.map((slot) => slot.id));

export function getCharacterSkinTone(character) {
  const requestedTone = character?.appearance?.skinTone || character?.skinTone;
  return isCharacterSkinTone(requestedTone) ? requestedTone : CHARACTER_DEFAULT_SKIN_TONE;
}

export function migrateCharacterAppearance(character) {
  if (!character) return character;
  const next = structuredClone(character);
  const model = next.baseModel || next.identity?.sex || 'woman';
  next.baseModel = CHARACTER_BASE_MODELS[model] ? model : 'woman';
  next.identity = { ...(next.identity || {}), sex: next.baseModel };
  next.appearance = { ...(next.appearance || {}), skinTone: getCharacterSkinTone(next) };
  next.schemaVersion = Math.max(Number(next.schemaVersion || 1), CHARACTER_SYSTEM_DEFAULTS.schemaVersion);
  return next;
}

export function createNewCharacter({ name, sex, pronouns, skinTone = CHARACTER_DEFAULT_SKIN_TONE }) {
  const cleanName = String(name || '').trim();
  if (!cleanName) throw new Error('A character name is required.');
  if (!CHARACTER_BASE_MODELS[sex]) throw new Error('Choose either the man or woman character model.');
  const cleanPronouns = String(pronouns || '').trim();
  if (!cleanPronouns) throw new Error('Pronouns are required.');
  if (!isCharacterSkinTone(skinTone)) throw new Error('Choose a valid skin tone.');

  return {
    schemaVersion: CHARACTER_SYSTEM_DEFAULTS.schemaVersion,
    identity: { name: cleanName.slice(0, 32), sex, pronouns: cleanPronouns.slice(0, 32) },
    appearance: { skinTone },
    baseModel: sex,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inventory: [...CHARACTER_SYSTEM_DEFAULTS.initialInventory],
    equipped: { ...CHARACTER_STARTER_LOADOUT },
    seenItemIds: [],
    customizationTutorialSeen: false
  };
}

// Skin tone is an always-free appearance choice, not an inventory item or store transaction.
export function setCharacterSkinTone(character, skinTone) {
  if (!character) throw new Error('A character is required.');
  if (!isCharacterSkinTone(skinTone)) throw new Error('Choose a valid skin tone.');
  const next = structuredClone(character);
  next.appearance = { ...(next.appearance || {}), skinTone };
  next.updatedAt = new Date().toISOString();
  return next;
}

export function getCharacterItem(itemId) {
  return itemById.get(itemId) || null;
}

export function ownsCharacterItem(character, itemId) {
  return Boolean(character?.inventory?.includes(itemId));
}

export function grantCharacterItem(character, itemId, reason = 'quest_reward') {
  const item = getCharacterItem(itemId);
  if (!item) throw new Error(`Unknown character item: ${itemId}`);
  if (ownsCharacterItem(character, itemId)) {
    return { character, changed: false, reason: 'already_owned', item };
  }
  const next = structuredClone(character);
  next.inventory.push(itemId);
  next.seenItemIds = next.seenItemIds || [];
  next.updatedAt = new Date().toISOString();
  return { character: next, changed: true, reason, item };
}

export function equipCharacterItem(character, itemId) {
  const item = getCharacterItem(itemId);
  if (!item) throw new Error(`Unknown character item: ${itemId}`);
  if (!validSlots.has(item.slot)) throw new Error(`Invalid character item slot: ${item.slot}`);
  if (!ownsCharacterItem(character, itemId)) throw new Error('Students can only equip items they own.');
  const next = structuredClone(character);
  next.equipped[item.slot] = itemId;
  next.updatedAt = new Date().toISOString();
  return next;
}

export function unequipCharacterSlot(character, slot) {
  if (!validSlots.has(slot)) throw new Error(`Invalid character slot: ${slot}`);
  const next = structuredClone(character);
  next.equipped[slot] = null;
  next.updatedAt = new Date().toISOString();
  return next;
}

export function getCharacterLayers(character) {
  if (!character) return [];
  const baseModel = character.baseModel || character.identity?.sex || 'woman';
  const skinTone = getCharacterSkinTone(character);
  const baseAsset = getCharacterBaseAsset(baseModel, skinTone);
  const layers = [
    { slot: 'base', assetPath: baseAsset, zIndex: 1, id: `base-${baseModel}-${skinTone}`, skinTone }
  ];
  for (const slot of validSlots) {
    const itemId = character.equipped?.[slot];
    if (!itemId) continue;
    const item = getCharacterItem(itemId);
    if (!item) continue;
    layers.push({ slot, assetPath: item.assetPath, zIndex: item.equipOrder, id: item.id });
  }
  return layers.filter((layer) => Boolean(layer.assetPath)).sort((a, b) => a.zIndex - b.zIndex);
}

export function getSlotInventory(character, slot) {
  if (!validSlots.has(slot)) return [];
  return (character?.inventory || [])
    .map((id) => getCharacterItem(id))
    .filter((item) => item?.slot === slot)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function markCharacterItemsSeen(character, itemIds) {
  const next = structuredClone(character);
  const known = new Set(next.seenItemIds || []);
  itemIds.forEach((id) => known.add(id));
  next.seenItemIds = [...known];
  next.updatedAt = new Date().toISOString();
  return next;
}
