/**
 * Starter store catalog. All items are cosmetic or optional ungraded tools.
 * Add image paths when matching avatar/town assets are ready.
 */
export const STARTER_STORE_ITEMS = [
  { id: 'profile-frame-parchment', name: 'Parchment Profile Frame', category: 'profile', price: 6, rarity: 'common', cosmeticOnly: true, description: 'A weathered parchment frame for the student profile.' },
  { id: 'pin-quill', name: 'Quill Pin', category: 'accessory', price: 8, rarity: 'common', cosmeticOnly: true, description: 'A small historian’s quill accessory.' },
  { id: 'pin-compass', name: 'Compass Pin', category: 'accessory', price: 8, rarity: 'common', cosmeticOnly: true, description: 'A small compass accessory for a profile or avatar.' },
  { id: 'journal-skin-indigo', name: 'Indigo Journal Skin', category: 'journal', price: 12, rarity: 'common', cosmeticOnly: true, description: 'A deep-blue cover for the Historian Journal.' },
  { id: 'banner-archive', name: 'Archive Banner', category: 'profile', price: 15, rarity: 'common', cosmeticOnly: true, description: 'A banner patterned after archival labels and seals.' },
  { id: 'room-map-table', name: 'Map Table', category: 'room', price: 24, rarity: 'uncommon', cosmeticOnly: true, description: 'A decorative table scattered with maps and a compass.' },
  { id: 'room-document-case', name: 'Document Case', category: 'room', price: 28, rarity: 'uncommon', cosmeticOnly: true, description: 'A display case for prized historical documents.' },
  { id: 'title-source-sleuth', name: 'Source Sleuth Title', category: 'title', price: 30, rarity: 'uncommon', cosmeticOnly: true, description: 'Adds the “Source Sleuth” title to the profile.' },
  { id: 'u1-atlantic-map-banner', name: 'Atlantic Map Banner', category: 'unit-1', price: 36, rarity: 'uncommon', cosmeticOnly: true, requiresBadgeId: 'u1-atlantic-cartographer', description: 'A Unit 1 banner inspired by Atlantic navigation charts.' },
  { id: 'u1-exchange-garden', name: 'Columbian Exchange Garden', category: 'unit-1', price: 42, rarity: 'rare', cosmeticOnly: true, requiresBadgeId: 'u1-exchange-investigator', description: 'A decorative garden display inspired by exchange across the Atlantic.' },
  { id: 'u1-settlement-desk', name: 'Settlement Chronicler Desk', category: 'unit-1', price: 48, rarity: 'rare', cosmeticOnly: true, requiresBadgeId: 'u1-settlement-chronicler', description: 'A writing desk with an ink bottle, journal, and colonial map.' },
  { id: 'badge-case-oak', name: 'Oak Badge Case', category: 'badge-case', price: 55, rarity: 'rare', cosmeticOnly: true, description: 'An upgraded wooden display case for earned badges.' },
  { id: 'profile-frame-gilded', name: 'Gilded Historian Frame', category: 'profile', price: 70, rarity: 'epic', cosmeticOnly: true, description: 'A rare framed profile style with gold archival details.' },
  { id: 'practice-replay-token', name: 'Practice Replay Pass', category: 'practice', price: 9, rarity: 'common', cosmeticOnly: false, ungradedOnly: true, description: 'Replay one completed ungraded practice activity. Never usable on graded work.' }
];

export function getStoreItemById(itemId, items = STARTER_STORE_ITEMS) {
  return items.find((item) => item.id === itemId) || null;
}
