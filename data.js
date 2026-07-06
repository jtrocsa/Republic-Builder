/*
  CONTENT STARTER
  ------------------------------------------------------------------
  Keep teacher-authored quest content here for now. Later, move this
  data into a database or a CMS so a teacher can create quests without
  editing JavaScript.
*/

window.REPUBLIC_BUILDER_DATA = {
  pillars: [
    { id: 'liberty', name: 'Liberty', icon: '🔔', color: '#718d38', value: 72, description: 'Rights, freedoms, political participation, and reform.' },
    { id: 'order', name: 'Order', icon: '⚖', color: '#2477bb', value: 68, description: 'Law, government legitimacy, and civic stability.' },
    { id: 'economy', name: 'Economy', icon: '◉', color: '#bb8b19', value: 65, description: 'Trade, labor, resources, and economic opportunity.' },
    { id: 'unity', name: 'Unity', icon: '⟡', color: '#7a4d9e', value: 54, description: 'National cohesion, compromise, and shared identity.' },
    { id: 'justice', name: 'Justice', icon: '⚜', color: '#ad392c', value: 61, description: 'Equality, representation, and the pursuit of justice.' },
    { id: 'power', name: 'Power', icon: '🦅', color: '#4f555b', value: 58, description: 'Military, diplomatic, and governmental capacity.' }
  ],

  units: [
    { id: 1, title: 'Colonization', dates: '1491–1607', short: 'Unit 1', state: 'complete' },
    { id: 2, title: 'British America', dates: '1607–1754', short: 'Unit 2', state: 'complete' },
    { id: 3, title: 'Road to Revolution', dates: '1754–1800', short: 'Unit 3', state: 'current' },
    { id: 4, title: 'Early Republic', dates: '1800–1848', short: 'Unit 4', state: 'locked' },
    { id: 5, title: 'Division & Reform', dates: '1844–1877', short: 'Unit 5', state: 'locked' },
    { id: 6, title: 'The Rise of America', dates: '1865–1898', short: 'Unit 6', state: 'locked' },
    { id: 7, title: 'Progressive America', dates: '1890–1945', short: 'Unit 7', state: 'locked' },
    { id: 8, title: 'Cold War America', dates: '1945–1980', short: 'Unit 8', state: 'locked' },
    { id: 9, title: 'Modern America', dates: '1980–Present', short: 'Unit 9', state: 'locked' }
  ],

  inventory: [
    { id: 'constitution', name: 'Constitution', icon: '📜', quantity: 2, tone: 'ink' },
    { id: 'liberty-bell', name: 'Liberty Bell', icon: '🔔', quantity: 1, tone: 'gold' },
    { id: 'musket', name: 'Musket', icon: '⚔', quantity: 1, tone: 'steel' },
    { id: 'press', name: 'Printing Press', icon: '▤', quantity: 1, tone: 'bronze' },
    { id: 'federalist', name: 'Federalist Papers', icon: '▥', quantity: 1, tone: 'ink' },
    { id: 'quill', name: 'Quill & Ink', icon: '✒', quantity: 1, tone: 'silver' },
    { id: 'currency', name: 'Continental Currency', icon: '◉', quantity: 1, tone: 'gold' },
    { id: 'washington', name: 'Washington', icon: '★', quantity: 1, tone: 'bronze' }
  ],

  quests: [
    {
      id: 'stamp-act',
      category: 'Unit Quest',
      group: 'all',
      image: 'assets/quest-stamp.svg',
      title: 'The Stamp Act Crisis',
      description: 'Learn how colonists resisted British taxation—and why the crisis deepened political distrust.',
      prompt: 'Why did Parliament create the Stamp Act in 1765?',
      answers: [
        'To provide colonists with seats in Parliament.',
        'To raise revenue after the French and Indian War and assert imperial authority.',
        'To end mercantilism and encourage colonial manufacturing.',
        'To abolish all colonial taxes.'
      ],
      correctAnswer: 1,
      explanation: 'Parliament needed revenue after the French and Indian War and believed it had the authority to tax the colonies. Colonial resistance centered on taxation without representation.',
      rewards: { xp: 150, rp: 75, pillars: { liberty: 3, unity: 1 }, artifact: 'Sons of Liberty Seal' }
    },
    {
      id: 'common-sense',
      category: 'Primary Source Battle',
      group: 'source',
      image: 'assets/quest-common-sense.svg',
      title: 'Common Sense',
      description: 'Analyze Thomas Paine’s revolutionary pamphlet and identify how it tried to persuade colonists.',
      prompt: 'Which audience did Thomas Paine most directly seek to persuade in Common Sense?',
      answers: [
        'British aristocrats who supported the king.',
        'Ordinary colonists who were uncertain about independence.',
        'French military commanders serving in Europe.',
        'Enslaved people in the Caribbean.'
      ],
      correctAnswer: 1,
      explanation: 'Paine wrote in accessible language to reach broad colonial audiences and persuade them that independence was both practical and morally justified.',
      rewards: { xp: 125, rp: 60, pillars: { liberty: 3, power: 1 }, artifact: 'Paine’s Pamphlet' }
    },
    {
      id: 'hipp',
      category: 'HIPP Challenge',
      group: 'skill',
      image: 'assets/quest-hipp.svg',
      title: 'Who Said It?',
      description: 'Identify historical situation, intended audience, purpose, and point of view before you use a source as evidence.',
      prompt: 'A pamphlet argues that “the true object is that every man may be free.” What is the most plausible purpose?',
      answers: [
        'To persuade readers to support a political cause centered on liberty.',
        'To report neutral facts without influencing an audience.',
        'To give military orders to British soldiers.',
        'To advertise luxury goods to wealthy merchants.'
      ],
      correctAnswer: 0,
      explanation: 'A claim about freedom is usually an argumentative choice. Strong HIPP work explains how language, audience, and historical context reveal a source’s purpose.',
      rewards: { xp: 100, rp: 50, pillars: { liberty: 2, justice: 2 }, artifact: 'Historian’s Lens' }
    },
    {
      id: 'federal-power',
      category: 'Debate Duel',
      group: 'skill',
      image: 'assets/quest-debate.svg',
      title: 'States’ Rights vs. Federal Power',
      description: 'Choose a side, marshal historical evidence, and respond to a competing constitutional argument.',
      prompt: 'Which evidence would most strongly support the Federalist argument for a stronger national government?',
      answers: [
        'The weaknesses of the Articles of Confederation exposed by Shays’ Rebellion.',
        'The success of colonial assemblies under British rule.',
        'The invention of the cotton gin after 1793.',
        'The Homestead Act of 1862.'
      ],
      correctAnswer: 0,
      explanation: 'Federalists used the inability of the Confederation Congress to respond effectively to crises such as Shays’ Rebellion as evidence for a stronger national government.',
      rewards: { xp: 175, rp: 80, pillars: { order: 3, power: 2 }, artifact: 'Federalist Quill' }
    },
    {
      id: 'timeline',
      category: 'Timeline Mission',
      group: 'skill',
      image: 'assets/quest-timeline.svg',
      title: 'Cause & Effect',
      description: 'Put pivotal events in order, then explain how each pushed Britain and its colonies toward revolution.',
      prompt: 'Which sequence is in correct chronological order?',
      answers: [
        'Boston Tea Party → French and Indian War → Declaration of Independence → Stamp Act',
        'French and Indian War → Stamp Act → Boston Tea Party → Intolerable Acts',
        'Intolerable Acts → Stamp Act → French and Indian War → Boston Tea Party',
        'Declaration of Independence → Boston Tea Party → Stamp Act → French and Indian War'
      ],
      correctAnswer: 1,
      explanation: 'The French and Indian War ended in 1763. Parliament then imposed new taxes; the Boston Tea Party came in 1773, followed by the Intolerable Acts in 1774.',
      rewards: { xp: 120, rp: 55, pillars: { unity: 2, power: 1 }, artifact: 'Revolution Timeline' }
    },
    {
      id: 'revolution-dbq',
      category: 'DBQ Boss Battle',
      group: 'writing',
      image: 'assets/quest-revolution.svg',
      title: 'The American Revolution',
      description: 'Defeat the first DBQ boss by constructing a defensible historical argument with documents and outside evidence.',
      prompt: 'Which thesis best shows complexity for a DBQ evaluating the Revolution’s impact on American society?',
      answers: [
        'The Revolution changed everything for every person in America.',
        'The Revolution mattered because George Washington was important.',
        'The Revolution expanded political participation for many white men, but major inequalities for women, enslaved people, and Native peoples persisted.',
        'The Revolution had no impact at all.'
      ],
      correctAnswer: 2,
      explanation: 'The strongest thesis makes a historically defensible claim while qualifying it. It recognizes political change alongside persistent inequalities.',
      rewards: { xp: 300, rp: 150, pillars: { liberty: 4, justice: 4, unity: 2 }, artifact: 'Revolutionary Standard' },
      boss: true
    },
    {
      id: 'vocabulary',
      category: 'Vocabulary Challenge',
      group: 'skill',
      image: 'assets/quest-vocab.svg',
      title: 'Find the Term',
      description: 'Master high-value APUSH vocabulary by using the correct term in historical context.',
      prompt: 'A collective refusal to buy British goods as a form of protest is called a…',
      answers: ['boycott.', 'republic.', 'tariff.', 'militia.'],
      correctAnswer: 0,
      explanation: 'A boycott is the organized refusal to purchase goods or participate in an activity as a form of protest or pressure.',
      rewards: { xp: 80, rp: 40, pillars: { economy: 2, liberty: 1 }, artifact: 'Vocabulary Codex' }
    }
  ],

  /*
    CHARACTER CREATION CONTENT
    ------------------------------------------------------------------
    This object is intentionally separated from save logic. Add new
    professions, clothing, towns, or later-era unlocks here; app.js only
    reads the data and applies the selected effects.
  */
  character: {
    traitCap: 20,
    baseTraits: {
      intellect: 5,
      industry: 5,
      influence: 5,
      courage: 5,
      diplomacy: 5,
      integrity: 5
    },
    traits: [
      { id: 'intellect', name: 'Intellect', icon: '✦', description: 'Historical analysis, writing, sourcing, and document interpretation.' },
      { id: 'industry', name: 'Industry', icon: '⚒', description: 'Building, production, persistence, and economic development.' },
      { id: 'influence', name: 'Influence', icon: '◆', description: 'Argument, leadership, public speaking, and persuasion.' },
      { id: 'courage', name: 'Courage', icon: '✹', description: 'Facing risk, responding to crises, and taking principled action.' },
      { id: 'diplomacy', name: 'Diplomacy', icon: '⌁', description: 'Collaboration, compromise, alliances, and negotiation.' },
      { id: 'integrity', name: 'Integrity', icon: '⚖', description: 'Justice, civic responsibility, reform, and ethical choices.' }
    ],
    genders: [
      { id: 'woman', label: 'Woman', asset: 'assets/character/base/woman.svg' },
      { id: 'man', label: 'Man', asset: 'assets/character/base/man.svg' },
      { id: 'neutral', label: 'Nonbinary / another identity', asset: 'assets/character/base/neutral.svg' }
    ],
    towns: [
      { id: 'boston', name: 'Boston', region: 'New England', icon: '⚓', note: 'Ports, pamphlets, town meetings, and protest.' },
      { id: 'new-york', name: 'New York', region: 'Middle Colonies', icon: '⌂', note: 'A bustling crossroads of trade and cultures.' },
      { id: 'philadelphia', name: 'Philadelphia', region: 'Middle Colonies', icon: '✒', note: 'Printers, debate, civic life, and constitutional ideas.' },
      { id: 'williamsburg', name: 'Williamsburg', region: 'Chesapeake', icon: '♜', note: 'Plantations, assemblies, and imperial politics.' },
      { id: 'charleston', name: 'Charleston', region: 'Lower South', icon: '⛵', note: 'Atlantic commerce and a diverse port city.' },
      { id: 'backcountry', name: 'Backcountry', region: 'Frontier', icon: '⛰', note: 'Self-reliance, migration, and contested borderlands.' }
    ],
    professions: [
      { id: 'blacksmith', name: 'Blacksmith', icon: '⚒', description: 'Forge tools and turn raw materials into something useful.', bonuses: { industry: 3, courage: 1 }, starterItem: 'Ironworker’s Apron' },
      { id: 'newspaper-editor', name: 'Newspaper Editor', icon: '✒', description: 'Shape public debate through ideas, arguments, and persuasive writing.', bonuses: { intellect: 3, influence: 1 }, starterItem: 'Printer’s Proof' },
      { id: 'farmer', name: 'Farmer', icon: '♧', description: 'Sustain a community through stewardship, patience, and labor.', bonuses: { industry: 2, integrity: 2 }, starterItem: 'Seed Ledger' },
      { id: 'merchant', name: 'Merchant', icon: '◈', description: 'Navigate trade networks, relationships, and calculated risks.', bonuses: { diplomacy: 2, influence: 2 }, starterItem: 'Trade Ledger' },
      { id: 'teacher', name: 'Teacher', icon: '▤', description: 'Build knowledge, strengthen communities, and guide others.', bonuses: { intellect: 3, integrity: 1 }, starterItem: 'Lesson Primer' },
      { id: 'apprentice-lawyer', name: 'Apprentice Lawyer', icon: '⚖', description: 'Study arguments, civic institutions, and the rule of law.', bonuses: { intellect: 2, influence: 2 }, starterItem: 'Casebook' },
      { id: 'sailor', name: 'Sailor', icon: '⚓', description: 'Cross uncertain waters and rely on teamwork under pressure.', bonuses: { courage: 2, diplomacy: 2 }, starterItem: 'Navigator’s Knot' },
      { id: 'artisan', name: 'Artisan', icon: '✣', description: 'Apply craft, creativity, and technical knowledge to everyday life.', bonuses: { industry: 2, intellect: 2 }, starterItem: 'Maker’s Token' }
    ],
    wardrobe: {
      hat: [
        { id: 'hat-none', name: 'Bareheaded', asset: 'assets/character/wardrobe/hats/hat-none.svg', note: 'A practical start.' },
        { id: 'round-cap', name: 'Round Cap', asset: 'assets/character/wardrobe/hats/round-cap.svg', note: 'A simple cloth cap.' },
        { id: 'wide-brim', name: 'Wide-Brim Hat', asset: 'assets/character/wardrobe/hats/wide-brim.svg', note: 'Good shade on long roads.' },
        { id: 'tricorn', name: 'Tricorn', asset: 'assets/character/wardrobe/hats/tricorn.svg', note: 'A formal colonial-era look.' }
      ],
      shirt: [
        { id: 'basic-tunic', name: 'Basic Tunic', asset: 'assets/character/wardrobe/shirts/basic-tunic.svg', note: 'Every founder begins with this tunic.' },
        { id: 'linen-shirt', name: 'Linen Shirt', asset: 'assets/character/wardrobe/shirts/linen-shirt.svg', note: 'Clean lines for civic life.' },
        { id: 'work-shirt', name: 'Work Shirt', asset: 'assets/character/wardrobe/shirts/work-shirt.svg', note: 'Built for long days.' },
        { id: 'blue-vest', name: 'Blue Vest', asset: 'assets/character/wardrobe/shirts/blue-vest.svg', note: 'A bold layer for public debate.' }
      ],
      pants: [
        { id: 'plain-trousers', name: 'Plain Trousers', asset: 'assets/character/wardrobe/pants/plain-trousers.svg', note: 'Reliable and unadorned.' },
        { id: 'work-breeches', name: 'Work Breeches', asset: 'assets/character/wardrobe/pants/work-breeches.svg', note: 'Ready for labor and travel.' },
        { id: 'navy-breeches', name: 'Navy Breeches', asset: 'assets/character/wardrobe/pants/navy-breeches.svg', note: 'A polished civic look.' },
        { id: 'striped-trousers', name: 'Striped Trousers', asset: 'assets/character/wardrobe/pants/striped-trousers.svg', note: 'A little more character.' }
      ],
      socks: [
        { id: 'wool-socks', name: 'Wool Socks', asset: 'assets/character/wardrobe/socks/wool-socks.svg', note: 'Warm, sturdy, standard issue.' },
        { id: 'striped-socks', name: 'Striped Socks', asset: 'assets/character/wardrobe/socks/striped-socks.svg', note: 'A small flash of color.' },
        { id: 'blue-socks', name: 'Blue Wool', asset: 'assets/character/wardrobe/socks/blue-socks.svg', note: 'Dye is a statement.' },
        { id: 'charcoal-socks', name: 'Charcoal Wool', asset: 'assets/character/wardrobe/socks/charcoal-socks.svg', note: 'Quiet and practical.' }
      ],
      shoes: [
        { id: 'simple-shoes', name: 'Simple Shoes', asset: 'assets/character/wardrobe/shoes/simple-shoes.svg', note: 'The founder’s dependable footwear.' },
        { id: 'work-boots', name: 'Work Boots', asset: 'assets/character/wardrobe/shoes/work-boots.svg', note: 'A sturdy choice for an industrious character.' },
        { id: 'buckled-shoes', name: 'Buckled Shoes', asset: 'assets/character/wardrobe/shoes/buckled-shoes.svg', note: 'Ready for the assembly hall.' },
        { id: 'riding-boots', name: 'Riding Boots', asset: 'assets/character/wardrobe/shoes/riding-boots.svg', note: 'Made for travel and dispatches.' }
      ],
      special: [
        { id: 'locked-relic', name: 'Quest Artifact Slot', asset: 'assets/character/special/locked-relic.svg', note: 'Special items are earned through quests and boss battles.', locked: true }
      ]
    }
  }
};
