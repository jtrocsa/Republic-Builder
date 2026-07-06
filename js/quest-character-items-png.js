/**
 * PNG-first character catalog and renderer contract.
 * Source references are kept in apush-png-character-art-pack-v2/.
 */

const PNG_PREVIEW_ROOT = './apush-png-character-art-pack-v2/assets/unit-1/store-previews-transparent';

const PREVIEW_BY_SLOT = Object.freeze({
  hats: `${PNG_PREVIEW_ROOT}/weathered-tricorn.png`,
  shirts: `${PNG_PREVIEW_ROOT}/homespun-linen-shirt.png`,
  belts: `${PNG_PREVIEW_ROOT}/brass-buckle-belt.png`,
  pants: `${PNG_PREVIEW_ROOT}/colonial-field-breeches.png`,
  shoes: `${PNG_PREVIEW_ROOT}/colonial-buckle-shoes.png`,
  hands: `${PNG_PREVIEW_ROOT}/rolled-sea-chart.png`,
  transportation: `${PNG_PREVIEW_ROOT}/bay-mare.png`
});

const SLOT_LABELS = Object.freeze({
  hats: 'Hat',
  shirts: 'Shirt',
  belts: 'Belt',
  pants: 'Pants',
  shoes: 'Shoes',
  hands: 'Hand',
  transportation: 'Transportation'
});

export const SLOT_INTERNAL_TO_CANONICAL = Object.freeze({
  hats: 'hat',
  shirts: 'shirt',
  belts: 'belt',
  pants: 'pants',
  shoes: 'shoes',
  hands: 'hand',
  transportation: 'transportation'
});

export const SLOT_CANONICAL_TO_INTERNAL = Object.freeze(
  Object.fromEntries(Object.entries(SLOT_INTERNAL_TO_CANONICAL).map(([internal, canonical]) => [canonical, internal]))
);

export const LEGACY_ITEM_ID_ALIASES = Object.freeze({
  'hats-tricorn-hat': 'weathered-tricorn',
  'shirts-starter-linen-tunic': 'homespun-linen-shirt',
  'belts-starter-rope-belt': 'brass-buckle-belt',
  'belts-brass-buckle-belt': 'brass-buckle-belt',
  'pants-starter-wool-trousers': 'colonial-field-breeches',
  'pants-colonial-breeches': 'colonial-field-breeches',
  'shoes-starter-leather-shoes': 'colonial-buckle-shoes',
  'shoes-colonial-buckles': 'colonial-buckle-shoes',
  'hands-starter-journal': 'rolled-sea-chart',
  'hands-rolled-map': 'rolled-sea-chart',
  'transportation-horse': 'bay-mare',
  'transportation-covered-wagon': 'covered-wagon',
  'hands-spyglass': 'brass-spyglass',
  'hands-compass': 'navigator-compass'
});

export function resolveCharacterItemId(itemId) {
  if (!itemId) return null;
  return LEGACY_ITEM_ID_ALIASES[itemId] || itemId;
}

function createItem({
  id,
  name,
  slot,
  rarity,
  acquisition,
  price,
  description,
  previewAssetPath,
  equipmentLayerAssetPath = null,
  fallbackSvgAssetPath = null,
  starter = false,
  questRequirement = null,
  badgeRequirement = null,
  equipOrder
}) {
  return {
    id,
    name,
    slot,
    rarity,
    acquisition,
    price,
    description,
    previewAssetPath,
    equipmentLayerAssetPath,
    fallbackSvgAssetPath,
    // Kept for compatibility with existing rendering/purchase code paths.
    assetPath: fallbackSvgAssetPath,
    equipOrder,
    starter,
    questRequirement,
    badgeRequirement,
    categoryLabel: SLOT_LABELS[slot] || slot
  };
}

export const CHARACTER_ITEM_CATALOG = [
  createItem({
    id: 'weathered-tricorn',
    name: 'Weathered Tricorn',
    slot: 'hats',
    rarity: 'common',
    acquisition: 'starter',
    price: 0,
    description: 'A dependable hat for long days along the Atlantic coast.',
    previewAssetPath: PREVIEW_BY_SLOT.hats,
    fallbackSvgAssetPath: './assets/characters/hats/tricorn-hat.svg',
    starter: true,
    equipOrder: 8
  }),
  createItem({
    id: 'homespun-linen-shirt',
    name: 'Homespun Linen Shirt',
    slot: 'shirts',
    rarity: 'common',
    acquisition: 'starter',
    price: 0,
    description: 'Plain, breathable linen for travel, study, and shipboard wind.',
    previewAssetPath: PREVIEW_BY_SLOT.shirts,
    fallbackSvgAssetPath: './assets/characters/shirts/starter-linen-tunic.svg',
    starter: true,
    equipOrder: 5
  }),
  createItem({
    id: 'brass-buckle-belt',
    name: 'Brass Buckle Belt',
    slot: 'belts',
    rarity: 'common',
    acquisition: 'starter',
    price: 0,
    description: 'Worn leather with a sturdy brass buckle.',
    previewAssetPath: PREVIEW_BY_SLOT.belts,
    fallbackSvgAssetPath: './assets/characters/belts/brass-buckle-belt.svg',
    starter: true,
    equipOrder: 6
  }),
  createItem({
    id: 'colonial-field-breeches',
    name: 'Colonial Field Breeches',
    slot: 'pants',
    rarity: 'common',
    acquisition: 'starter',
    price: 0,
    description: 'Hard-wearing breeches for roads, docks, and frontier paths.',
    previewAssetPath: PREVIEW_BY_SLOT.pants,
    fallbackSvgAssetPath: './assets/characters/pants/colonial-breeches.svg',
    starter: true,
    equipOrder: 4
  }),
  createItem({
    id: 'colonial-buckle-shoes',
    name: 'Colonial Buckle Shoes',
    slot: 'shoes',
    rarity: 'common',
    acquisition: 'starter',
    price: 0,
    description: 'Sturdy leather shoes with brass buckles, built for long roads.',
    previewAssetPath: PREVIEW_BY_SLOT.shoes,
    fallbackSvgAssetPath: './assets/characters/shoes/colonial-buckles.svg',
    starter: true,
    equipOrder: 7
  }),
  createItem({
    id: 'rolled-sea-chart',
    name: 'Rolled Sea Chart',
    slot: 'hands',
    rarity: 'common',
    acquisition: 'starter',
    price: 0,
    description: 'A hand-marked chart of routes, winds, and coastlines.',
    previewAssetPath: PREVIEW_BY_SLOT.hands,
    fallbackSvgAssetPath: './assets/characters/hands/rolled-map.svg',
    starter: true,
    equipOrder: 8
  }),
  createItem({
    id: 'bay-mare',
    name: 'Bay Mare',
    slot: 'transportation',
    rarity: 'common',
    acquisition: 'starter',
    price: 0,
    description: 'A reliable riding horse for exploration across the Atlantic World.',
    previewAssetPath: PREVIEW_BY_SLOT.transportation,
    fallbackSvgAssetPath: './assets/characters/transportation/horse.svg',
    starter: true,
    equipOrder: 1
  }),
  createItem({
    id: 'field-cartographer-cap',
    name: 'Field Cartographer Cap',
    slot: 'hats',
    rarity: 'uncommon',
    acquisition: 'store',
    price: 14,
    description: 'A practical brimmed cap favored by mapmakers who work in wind and weather.',
    previewAssetPath: PREVIEW_BY_SLOT.hats,
    fallbackSvgAssetPath: './assets/characters/hats/field-hat.svg',
    equipOrder: 8
  }),
  createItem({
    id: 'frontier-flannel-shirt',
    name: 'Frontier Flannel Shirt',
    slot: 'shirts',
    rarity: 'uncommon',
    acquisition: 'store',
    price: 16,
    description: 'Heavy weave and reinforced seams make this shirt fit for rough roads and cold mornings.',
    previewAssetPath: PREVIEW_BY_SLOT.shirts,
    fallbackSvgAssetPath: './assets/characters/shirts/frontier-flannel.svg',
    equipOrder: 5
  }),
  createItem({
    id: 'leather-traveler-belt',
    name: 'Leather Traveler Belt',
    slot: 'belts',
    rarity: 'uncommon',
    acquisition: 'store',
    price: 15,
    description: 'Built to carry tools, notes, and essentials while crossing ports and inland roads.',
    previewAssetPath: PREVIEW_BY_SLOT.belts,
    fallbackSvgAssetPath: './assets/characters/belts/traveler-sash.svg',
    equipOrder: 6
  }),
  createItem({
    id: 'frontier-trail-trousers',
    name: 'Frontier Trail Trousers',
    slot: 'pants',
    rarity: 'uncommon',
    acquisition: 'store',
    price: 17,
    description: 'Tailored for movement and durability when travel means mud, timber, and steep grades.',
    previewAssetPath: PREVIEW_BY_SLOT.pants,
    fallbackSvgAssetPath: './assets/characters/pants/frontier-denim.svg',
    equipOrder: 4
  }),
  createItem({
    id: 'frontier-riding-boots',
    name: 'Frontier Riding Boots',
    slot: 'shoes',
    rarity: 'rare',
    acquisition: 'store',
    price: 23,
    description: 'Thick leather boots with reinforced uppers for saddle travel and long overland routes.',
    previewAssetPath: PREVIEW_BY_SLOT.shoes,
    fallbackSvgAssetPath: './assets/characters/shoes/riding-boots.svg',
    equipOrder: 7
  }),
  createItem({
    id: 'navigator-compass',
    name: 'Navigator Compass',
    slot: 'hands',
    rarity: 'uncommon',
    acquisition: 'store',
    price: 16,
    description: 'A brass compass used to keep bearings on open water and uncertain roads.',
    previewAssetPath: PREVIEW_BY_SLOT.hands,
    fallbackSvgAssetPath: './assets/characters/hands/compass.svg',
    equipOrder: 8
  }),
  createItem({
    id: 'brass-spyglass',
    name: 'Brass Spyglass',
    slot: 'hands',
    rarity: 'rare',
    acquisition: 'quest',
    price: null,
    description: 'A polished scope for scanning coastlines, harbors, and distant sails.',
    previewAssetPath: PREVIEW_BY_SLOT.hands,
    fallbackSvgAssetPath: './assets/characters/hands/spyglass.svg',
    questRequirement: 'configured-by-teacher',
    equipOrder: 8
  }),
  createItem({
    id: 'covered-wagon',
    name: 'Covered Wagon',
    slot: 'transportation',
    rarity: 'epic',
    acquisition: 'quest',
    price: null,
    description: 'A long-haul overland wagon for carrying provisions through rough interior routes.',
    previewAssetPath: PREVIEW_BY_SLOT.transportation,
    fallbackSvgAssetPath: './assets/characters/transportation/covered-wagon.svg',
    questRequirement: 'configured-by-teacher',
    equipOrder: 1
  }),
  createItem({
    id: 'coastal-sloop',
    name: 'Coastal Sloop',
    slot: 'transportation',
    rarity: 'legendary',
    acquisition: 'badge',
    price: null,
    description: 'A swift single-mast vessel for crossing coastal routes and carrying critical dispatches.',
    previewAssetPath: PREVIEW_BY_SLOT.transportation,
    fallbackSvgAssetPath: './assets/characters/transportation/roadster.svg',
    badgeRequirement: 'configured-by-teacher',
    equipOrder: 1
  })
];

export const CHARACTER_SLOT_ORDER = [
  'transportation', 'base', 'pants', 'shirts', 'belts', 'shoes', 'hands', 'hats'
];

export const CHARACTER_SLOTS = [
  { id: 'hats', label: 'Hat', emptyLabel: 'No hat' },
  { id: 'shirts', label: 'Shirt', emptyLabel: 'Basic undershirt' },
  { id: 'belts', label: 'Belt', emptyLabel: 'No belt' },
  { id: 'pants', label: 'Pants', emptyLabel: 'Basic trousers' },
  { id: 'shoes', label: 'Shoes', emptyLabel: 'Walking shoes' },
  { id: 'hands', label: 'Hand Item', emptyLabel: 'Empty hand' },
  { id: 'transportation', label: 'Transportation', emptyLabel: 'Walking' }
];

export const CHARACTER_STARTER_LOADOUT = {
  hats: 'weathered-tricorn',
  shirts: 'homespun-linen-shirt',
  belts: 'brass-buckle-belt',
  pants: 'colonial-field-breeches',
  shoes: 'colonial-buckle-shoes',
  hands: 'rolled-sea-chart',
  transportation: 'bay-mare'
};

export const CHARACTER_SKIN_TONES = [
  { id: 'tone-1', label: 'Tone 1', swatch: '#F6D8C2' },
  { id: 'tone-2', label: 'Tone 2', swatch: '#EDC3A1' },
  { id: 'tone-3', label: 'Tone 3', swatch: '#D99D74' },
  { id: 'tone-4', label: 'Tone 4', swatch: '#BB7855' },
  { id: 'tone-5', label: 'Tone 5', swatch: '#96593F' },
  { id: 'tone-6', label: 'Tone 6', swatch: '#78432E' },
  { id: 'tone-7', label: 'Tone 7', swatch: '#573123' },
  { id: 'tone-8', label: 'Tone 8', swatch: '#3D251D' }
];

export const CHARACTER_DEFAULT_SKIN_TONE = 'tone-4';

export const CHARACTER_BASE_MODELS = {
  woman: {
    label: 'Woman',
    basePath: './assets/characters/base/woman-neutral.png',
    skinMaskPath: './assets/characters/base/woman-skin-mask.png',
    skinMaskReady: false,
    baseByTonePath: {
      'tone-1': './assets/characters/base/tones/woman/tone-1.png',
      'tone-2': './assets/characters/base/tones/woman/tone-2.png',
      'tone-3': './assets/characters/base/tones/woman/tone-3.png',
      'tone-4': './assets/characters/base/tones/woman/tone-4.png',
      'tone-5': './assets/characters/base/tones/woman/tone-5.png',
      'tone-6': './assets/characters/base/tones/woman/tone-6.png',
      'tone-7': './assets/characters/base/tones/woman/tone-7.png',
      'tone-8': './assets/characters/base/tones/woman/tone-8.png'
    },
    fallbackSvgByTone: {
      'tone-1': './assets/characters/base/base-woman-tone-1.svg',
      'tone-2': './assets/characters/base/base-woman-tone-2.svg',
      'tone-3': './assets/characters/base/base-woman-tone-3.svg',
      'tone-4': './assets/characters/base/base-woman-tone-4.svg',
      'tone-5': './assets/characters/base/base-woman-tone-5.svg',
      'tone-6': './assets/characters/base/base-woman-tone-6.svg',
      'tone-7': './assets/characters/base/base-woman-tone-7.svg',
      'tone-8': './assets/characters/base/base-woman-tone-8.svg'
    }
  },
  man: {
    label: 'Man',
    basePath: './assets/characters/base/man-neutral.png',
    skinMaskPath: './assets/characters/base/man-skin-mask.png',
    skinMaskReady: false,
    baseByTonePath: {
      'tone-1': './assets/characters/base/tones/man/tone-1.png',
      'tone-2': './assets/characters/base/tones/man/tone-2.png',
      'tone-3': './assets/characters/base/tones/man/tone-3.png',
      'tone-4': './assets/characters/base/tones/man/tone-4.png',
      'tone-5': './assets/characters/base/tones/man/tone-5.png',
      'tone-6': './assets/characters/base/tones/man/tone-6.png',
      'tone-7': './assets/characters/base/tones/man/tone-7.png',
      'tone-8': './assets/characters/base/tones/man/tone-8.png'
    },
    fallbackSvgByTone: {
      'tone-1': './assets/characters/base/base-man-tone-1.svg',
      'tone-2': './assets/characters/base/base-man-tone-2.svg',
      'tone-3': './assets/characters/base/base-man-tone-3.svg',
      'tone-4': './assets/characters/base/base-man-tone-4.svg',
      'tone-5': './assets/characters/base/base-man-tone-5.svg',
      'tone-6': './assets/characters/base/base-man-tone-6.svg',
      'tone-7': './assets/characters/base/base-man-tone-7.svg',
      'tone-8': './assets/characters/base/base-man-tone-8.svg'
    }
  }
};

export const CHARACTER_SYSTEM_DEFAULTS = {
  schemaVersion: 3,
  gameTitle: 'Atlantic Crossroads',
  initialInventory: Object.values(CHARACTER_STARTER_LOADOUT).filter(Boolean)
};

export function isCharacterSkinTone(skinTone) {
  return CHARACTER_SKIN_TONES.some((tone) => tone.id === skinTone);
}

export function getCharacterBaseAsset(baseModel, skinTone = CHARACTER_DEFAULT_SKIN_TONE) {
  const model = CHARACTER_BASE_MODELS[baseModel];
  if (!model) return null;
  return model.fallbackSvgByTone?.[skinTone]
    || model.fallbackSvgByTone?.[CHARACTER_DEFAULT_SKIN_TONE]
    || Object.values(model.fallbackSvgByTone || {})[0]
    || null;
}

export function getCharacterBaseModelConfig(baseModel) {
  return CHARACTER_BASE_MODELS[baseModel] || CHARACTER_BASE_MODELS.woman;
}

export function getSkinToneColor(skinTone = CHARACTER_DEFAULT_SKIN_TONE) {
  return CHARACTER_SKIN_TONES.find((tone) => tone.id === skinTone)?.swatch || '#BB7855';
}
