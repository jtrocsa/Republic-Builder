/**
 * Final production contract: one neutral base and one skin mask per visual model.
 * The exact base/mask files are created during the aligned-avatar art pass.
 */
export const CHARACTER_PNG_ART = {
  canvas: { master: [2048, 3072], display: [1024, 1536], hud: [512, 768] },
  models: {
    woman: {
      basePath: 'assets/characters/base/woman-base-neutral.png',
      skinMaskPath: 'assets/characters/base/woman-skin-mask.png',
      label: 'Woman'
    },
    man: {
      basePath: 'assets/characters/base/man-base-neutral.png',
      skinMaskPath: 'assets/characters/base/man-skin-mask.png',
      label: 'Man'
    }
  },
  skinTones: {
    'tone-1': { label: 'Tone 1', color: '#F6D8C2' },
    'tone-2': { label: 'Tone 2', color: '#EDC3A1' },
    'tone-3': { label: 'Tone 3', color: '#D99D74' },
    'tone-4': { label: 'Tone 4', color: '#BB7855' },
    'tone-5': { label: 'Tone 5', color: '#96593F' },
    'tone-6': { label: 'Tone 6', color: '#78432E' },
    'tone-7': { label: 'Tone 7', color: '#573123' },
    'tone-8': { label: 'Tone 8', color: '#3D251D' }
  },
  layerOrder: ['transportation', 'base', 'skinTone', 'pants', 'shirt', 'belt', 'shoes', 'hand', 'hat']
};
