export const STEPS = [
  { id: 'identity', number: 1, title: 'Identity', subtitle: 'Who are you?' },
  { id: 'profession', number: 2, title: 'Profession', subtitle: 'What is your role in the republic?' },
  { id: 'path', number: 3, title: 'Founder Path', subtitle: 'What kind of founder are you?' },
  { id: 'skills', number: 4, title: 'Historian Skills', subtitle: 'Choose your strengths.' },
  { id: 'review', number: 5, title: 'Review', subtitle: 'Confirm your choices.' }
];

export const HOMETOWNS = ['Boston', 'Charleston', 'New York', 'Philadelphia', 'Williamsburg', 'New Orleans', 'Santa Fe', 'Detroit'];
export const PRONOUNS = ['She / Her', 'He / Him', 'They / Them', 'Use my name'];
export const GENDERS = ['Woman', 'Man'];

export const APPEARANCE = {
  face: [
    { id: 'face-a', label: 'Aster' }, { id: 'face-b', label: 'Briar' }, { id: 'face-c', label: 'Cedar' }, { id: 'face-d', label: 'Dawn' }
  ],
  hair: [
    { id: 'hair-chestnut', label: 'Chestnut' }, { id: 'hair-ebony', label: 'Ebony' }, { id: 'hair-auburn', label: 'Auburn' }, { id: 'hair-blonde', label: 'Honey Blonde' }
  ],
  skin: [
    { id: 'skin-1', label: 'Warm Ivory' }, { id: 'skin-2', label: 'Golden Beige' }, { id: 'skin-3', label: 'Copper' }, { id: 'skin-4', label: 'Deep Umber' }, { id: 'skin-5', label: 'Espresso' }
  ],
  eyes: [
    { id: 'eyes-hazel', label: 'Hazel' }, { id: 'eyes-blue', label: 'Blue' }, { id: 'eyes-green', label: 'Green' }, { id: 'eyes-brown', label: 'Brown' }, { id: 'eyes-gray', label: 'Gray' }
  ]
};

export const CLOTHING = {
  hat: [
    { id: 'hat-none', label: 'No Hat', description: 'Travel light.' },
    { id: 'hat-tricorn', label: 'Tricorn Hat', description: 'A civic classic.' },
    { id: 'hat-wide', label: 'Wide-Brim Hat', description: 'Built for the frontier.' },
    { id: 'hat-coif', label: 'Linen Coif', description: 'Simple and practical.' }
  ],
  shirt: [
    { id: 'shirt-linen', label: 'Linen Shirt', description: 'The founder standard.' },
    { id: 'shirt-collar', label: 'High-Collar Shirt', description: 'Formal townwear.' },
    { id: 'shirt-work', label: 'Work Shirt', description: 'Ready for labor.' }
  ],
  vest: [
    { id: 'vest-none', label: 'No Vest', description: 'Keep it simple.' },
    { id: 'vest-leather', label: 'Leather Vest', description: 'A durable layer.' },
    { id: 'vest-brocade', label: 'Brocade Vest', description: 'For formal debate.' }
  ],
  pants: [
    { id: 'pants-breeches', label: 'Navy Breeches', description: 'Sturdy and versatile.' },
    { id: 'pants-trousers', label: 'Canvas Trousers', description: 'Made for travel.' },
    { id: 'pants-skirt', label: 'Traveling Skirt', description: 'Practical townwear.' }
  ],
  boots: [
    { id: 'boots-work', label: 'Work Boots', description: 'Reliable leather.' },
    { id: 'boots-riding', label: 'Riding Boots', description: 'Long-road comfort.' },
    { id: 'boots-shoes', label: 'Buckled Shoes', description: 'A polished finish.' }
  ]
};

export const PROFESSIONS = [
  { id: 'blacksmith', icon: 'anvil', title: 'Blacksmith', short: 'Crafts tools and strengthens the republic.', bonus: 'Forgeworker: unlocks production-themed town tasks and a starter metalwork cosmetic.' },
  { id: 'printer', icon: 'press', title: 'Printer', short: 'Spreads ideas and public news.', bonus: 'Broadside: unlocks civic communication quests and a printmaker banner.' },
  { id: 'farmer', icon: 'wheat', title: 'Farmer', short: 'Feeds the people through practical work.', bonus: 'Harvest Hand: unlocks land-and-labor quests and a fieldwork cosmetic.' },
  { id: 'merchant', icon: 'crate', title: 'Merchant', short: 'Trades goods and connects towns.', bonus: 'Trade Route: unlocks exchange-themed quests and a merchant satchel.' },
  { id: 'surveyor', icon: 'compass', title: 'Surveyor', short: 'Maps the land and charts the future.', bonus: 'Trail Marker: unlocks map-and-expansion quests and a compass badge.' },
  { id: 'healer', icon: 'herb', title: 'Healer', short: 'Tends to communities in hardship.', bonus: 'Caretaker: unlocks public-health quests and a healer’s kit cosmetic.' }
];

export const PATHS = [
  { id: 'scholar', icon: 'book', title: 'Scholar', short: 'Seeks truth and preserves knowledge.', effect: 'Dialogue: source analysis options. Town role: archive keeper. Cosmetic: illuminated ledger. Resource: +1 Library Supply.' },
  { id: 'maker', icon: 'hammer', title: 'Maker', short: 'Builds, creates, and innovates.', effect: 'Dialogue: invention options. Town role: workshop lead. Cosmetic: craft apron. Resource: +1 Workshop Supply.' },
  { id: 'orator', icon: 'lyre', title: 'Orator', short: 'Inspires, persuades, and rallies others.', effect: 'Dialogue: speech and coalition options. Town role: assembly voice. Cosmetic: civic sash. Resource: +1 Civic Favor.' },
  { id: 'pathfinder', icon: 'compass', title: 'Pathfinder', short: 'Explores, discovers, and paves the way.', effect: 'Dialogue: exploration options. Town role: trail guide. Cosmetic: explorer’s cloak. Resource: +1 Travel Supply.' },
  { id: 'mediator', icon: 'handshake', title: 'Mediator', short: 'Brings people together and builds consensus.', effect: 'Dialogue: compromise options. Town role: council liaison. Cosmetic: treaty pin. Resource: +1 Community Favor.' },
  { id: 'steward', icon: 'tree', title: 'Steward', short: 'Protects, nurtures, and sustains the republic.', effect: 'Dialogue: care and stewardship options. Town role: commons keeper. Cosmetic: steward’s mantle. Resource: +1 Commons Supply.' }
];

export const SKILLS = [
  { id: 'developments', icon: 'scroll', title: 'Developments', definition: 'Analyze historical developments and processes.' },
  { id: 'sourcing', icon: 'quill', title: 'Sourcing', definition: 'Analyze sourcing and the situation of a source.' },
  { id: 'evidence', icon: 'seal', title: 'Evidence', definition: 'Use evidence to support a historical argument.' },
  { id: 'context', icon: 'hourglass', title: 'Context', definition: 'Explain the broader historical context.' },
  { id: 'connections', icon: 'links', title: 'Connections', definition: 'Make historical connections across time and place.' },
  { id: 'argument', icon: 'torch', title: 'Argument', definition: 'Construct and defend a historical argument.' }
];

export const DEFAULT_STATE = {
  currentStep: 0,
  identity: { name: 'Aria', gender: 'Woman', pronouns: 'She / Her', hometown: 'Philadelphia' },
  appearance: { face: 'face-a', hair: 'hair-chestnut', skin: 'skin-2', eyes: 'eyes-hazel' },
  clothing: { hat: 'hat-wide', shirt: 'shirt-linen', vest: 'vest-leather', pants: 'pants-breeches', boots: 'boots-work' },
  profession: null,
  path: null,
  primarySkill: null,
  secondarySkill: null
};
