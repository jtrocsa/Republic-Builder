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
      category: 'DBQ Boss Fight',
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
      category: 'Vocabulary Bounty',
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
  ]
};
