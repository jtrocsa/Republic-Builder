export const UNIT = {
  id: 'unit-1',
  title: 'Atlantic Crossroads',
  period: '1491–1607',
  apWeight: '4–6%',
  topics: [
    '1.1 Contextualizing Period 1',
    '1.2 Native American Societies Before European Contact',
    '1.3 European Exploration in the Americas',
    '1.4 Columbian Exchange, Spanish Exploration, and Conquest',
    '1.5 Labor, Slavery, and Caste in the Spanish Colonial System',
    '1.6 Cultural Interactions Between Europeans, Native Americans, and Africans',
    '1.7 Causation in Period 1'
  ]
};

export const SKILLS = [
  { id: 'context', label: 'Context', icon: '◌', value: 5 },
  { id: 'evidence', label: 'Evidence', icon: '◆', value: 5 },
  { id: 'sourcing', label: 'Sourcing', icon: '◈', value: 5 },
  { id: 'argument', label: 'Argument', icon: '▲', value: 5 },
  { id: 'reasoning', label: 'Reasoning', icon: '⟡', value: 5 },
  { id: 'comparison', label: 'Comparison', icon: '⇄', value: 5 }
];

export const RUBRICS = {
  saq: {
    title: 'AP Short-Answer Question Rubric',
    total: 3,
    officialNote: '3 points total: one independently earned point for each response part (A, B, and C).',
    criteria: [
      { id: 'a', label: 'Part A', points: 1, description: 'Accurately responds to part A with relevant historical information. A description requires more than naming an isolated term.' },
      { id: 'b', label: 'Part B', points: 1, description: 'Accurately responds to part B with relevant historical information. An explanation tells how or why a relationship, process, or development occurred.' },
      { id: 'c', label: 'Part C', points: 1, description: 'Accurately responds to part C with specific, relevant historical evidence and explanation.' }
    ]
  },
  leq: {
    title: 'AP Long Essay Question Rubric',
    total: 6,
    officialNote: 'Points are earned independently. Use this same 6-point rubric for every LEQ practice in Republic Builder.',
    criteria: [
      { id: 'thesis', label: 'Thesis / Claim', points: 1, description: 'Makes a historically defensible claim that responds to the prompt and establishes a line of reasoning.' },
      { id: 'context', label: 'Contextualization', points: 1, description: 'Describes a broader historical context relevant to the prompt.' },
      { id: 'evidence1', label: 'Evidence', points: 1, description: 'Provides specific examples of evidence relevant to the topic of the prompt.' },
      { id: 'evidence2', label: 'Evidence supports argument', points: 1, description: 'Uses specific and relevant evidence to support an argument in response to the prompt.' },
      { id: 'reasoning', label: 'Analysis and Reasoning', points: 1, description: 'Uses historical reasoning—such as comparison, causation, or continuity and change—to frame or structure an argument.' },
      { id: 'complexity', label: 'Complexity', points: 1, description: 'Demonstrates a complex understanding of the historical development that is the focus of the prompt.' }
    ]
  },
  dbq: {
    title: 'AP Document-Based Question Rubric',
    total: 7,
    officialNote: 'Points are earned independently. The 2027 AP History updates retain the existing free-response scoring criteria.',
    criteria: [
      { id: 'thesis', label: 'Thesis / Claim', points: 1, description: 'Responds to the prompt with a historically defensible thesis or claim that establishes a line of reasoning.' },
      { id: 'context', label: 'Contextualization', points: 1, description: 'Describes a broader historical context relevant to the prompt.' },
      { id: 'docDescribe', label: 'Evidence: documents described', points: 1, description: 'Accurately describes, rather than simply quotes, the content of at least three documents.' },
      { id: 'docSupport', label: 'Evidence: documents support argument', points: 1, description: 'Uses at least four documents to support an argument in response to the prompt.' },
      { id: 'outside', label: 'Evidence beyond documents', points: 1, description: 'Uses at least one additional piece of specific historical evidence beyond those found in the documents to support or qualify an argument.' },
      { id: 'sourcing', label: 'Analysis: sourcing', points: 1, description: 'For at least two documents, explains how or why the document’s point of view, purpose, historical situation, and/or audience is relevant to an argument.' },
      { id: 'complexity', label: 'Analysis: complexity', points: 1, description: 'Demonstrates a complex understanding of the historical development that is the focus of the prompt.' }
    ]
  }
};

export const SOURCES = [
  {
    id: 'waldseemuller-1507',
    title: 'Universalis cosmographia (Waldseemüller World Map)',
    author: 'Martin Waldseemüller',
    date: '1507',
    type: 'Map',
    region: 'Atlantic world',
    description: 'A world map that depicted the Western Hemisphere as a separate continent and used the name “America.”',
    classroomExcerpt: 'Visual source: the map separates the western landmass from Asia and labels part of the new continent “America.”',
    questUse: ['New Atlantic Chart', 'Empire’s Reckoning DBQ'],
    sourceUrl: 'https://www.loc.gov/resource/g3200.ct000725/',
    citation: 'Martin Waldseemüller, Universalis cosmographia, 1507. Library of Congress.',
    rights: 'Library of Congress digital collection; verify current Rights & Access statement before redistributing images.'
  },
  {
    id: 'columbus-1493',
    title: 'Letter to Luis de Santángel',
    author: 'Christopher Columbus',
    date: '1493',
    type: 'Letter',
    region: 'Caribbean',
    description: 'A report of Columbus’s first Atlantic voyage sent to a royal official connected to the Spanish crown.',
    classroomExcerpt: '“Their Highnesses may see that I shall give them as much gold as they need … and spices and cotton.”',
    questUse: ['Columbus’s Dispatch', 'Caribbean Crossroads Royale', 'Empire’s Reckoning DBQ'],
    sourceUrl: 'https://www.loc.gov/item/18018461/',
    citation: 'Christopher Columbus, letter to Luis de Santángel, 1493. Library of Congress.',
    rights: 'Library of Congress states it is not aware of U.S. copyright restrictions for the digitized item; verify current Rights & Access statement.'
  },
  {
    id: 'requerimiento-1513',
    title: 'El Requerimiento',
    author: 'Spanish Crown / Juan López de Palacios Rubios',
    date: '1513',
    type: 'Royal declaration',
    region: 'Spanish America',
    description: 'A declaration read to Indigenous peoples asserting Spanish and Catholic authority and demanding submission.',
    classroomExcerpt: '“We ask and require you to acknowledge the Church as the ruler and superior of the whole world … and the King and Queen … as lords and superiors.”',
    questUse: ['Conquest & Conscience', 'Empire’s Reckoning DBQ'],
    sourceUrl: 'https://sourcebooks.fordham.edu/mod/1513requirement.asp',
    citation: 'El Requerimiento, 1513, English translation in Fordham Internet Modern History Sourcebook.',
    rights: 'Historical text; verify translation permissions before republishing beyond classroom use.'
  },
  {
    id: 'cortes-second-letter-1520',
    title: 'Second Letter to Charles V',
    author: 'Hernán Cortés',
    date: '1520',
    type: 'Letter',
    region: 'Mesoamerica',
    description: 'Cortés’s report to the Spanish monarch describing Tenochtitlan and defending his actions during the conquest.',
    classroomExcerpt: '“This great city of Temixtitan is built in the midst of a salt lake … The principal streets are very wide and straight.”',
    questUse: ['MCQ Challenge: Tenochtitlan', 'Conquest & Conscience', 'Empire’s Reckoning DBQ'],
    sourceUrl: 'https://www.loc.gov/item/2021666768/',
    citation: 'Hernán Cortés, Second Letter to Charles V, 1520. Library of Congress.',
    rights: 'Library of Congress digital collection; verify current Rights & Access statement before redistributing scans.'
  },
  {
    id: 'tenochtitlan-map-1524',
    title: 'Map of Tenochtitlan',
    author: 'Published with Cortés’s letters',
    date: '1524',
    type: 'Map / print',
    region: 'Mesoamerica',
    description: 'An early European printed plan of Tenochtitlan that represented the city after Spanish contact and conquest.',
    classroomExcerpt: 'Visual source: the city appears as an island settlement with monumental buildings, causeways, and surrounding water.',
    questUse: ['MCQ Challenge: Tenochtitlan', 'Empire’s Reckoning DBQ'],
    sourceUrl: 'https://www.loc.gov/item/2021668313/',
    citation: 'Map of Tenochtitlan, published with Hernán Cortés’s letters, 1524. Library of Congress.',
    rights: 'Library of Congress digital collection; verify current Rights & Access statement before redistributing scans.'
  },
  {
    id: 'codex-azcatitlan',
    title: 'Codex Azcatitlan',
    author: 'Nahua artists and scribes',
    date: 'Sixteenth century',
    type: 'Indigenous codex',
    region: 'Mesoamerica',
    description: 'A pictorial Indigenous account that depicts Aztec rulers, the arrival of Spanish forces, and religious change.',
    classroomExcerpt: 'Visual source: a pictorial account of the arrival of Spanish troops and the transformation of central Mexico.',
    questUse: ['MCQ Challenge: Tenochtitlan', 'Empire’s Reckoning DBQ'],
    sourceUrl: 'https://www.loc.gov/resource/gdcwdl.wdl_15280/',
    citation: 'Codex Azcatitlan, sixteenth century. Library of Congress / World Digital Library.',
    rights: 'Use the repository’s Rights & Access statement for the individual image selected.'
  },
  {
    id: 'florentine-codex-smallpox',
    title: 'Florentine Codex, Book 12: Account of the Smallpox Epidemic',
    author: 'Nahua informants working with Bernardino de Sahagún',
    date: 'c. 1577',
    type: 'Indigenous testimony / manuscript',
    region: 'Mesoamerica',
    description: 'A Nahua account recording the effects of disease during the conquest of Mexico.',
    classroomExcerpt: '“They were covered with pustules; their faces, their heads, their breasts.”',
    questUse: ['Caribbean Crossroads Royale', 'Empire’s Reckoning DBQ'],
    sourceUrl: 'https://www.loc.gov/item/2021667814/',
    citation: 'Florentine Codex, Book 12, compiled c. 1577; translated excerpt from Nahua testimony.',
    rights: 'Historical manuscript; verify the rights for the selected translation and image before publication.'
  },
  {
    id: 'las-casas-1552',
    title: 'A Short Account of the Destruction of the Indies',
    author: 'Bartolomé de las Casas',
    date: '1552',
    type: 'Religious critique',
    region: 'Caribbean and Spanish America',
    description: 'A Dominican friar’s account condemning Spanish violence and exploitation in the Americas.',
    classroomExcerpt: '“The Spaniards fell upon them with the sword in hand … and grew more cruel and more inhuman.”',
    questUse: ['Conquest & Conscience', 'Empire’s Reckoning DBQ'],
    sourceUrl: 'https://www.loc.gov/exhibits/exploring-the-early-americas/interpreting-the-conquest.html',
    citation: 'Bartolomé de las Casas, Brevísima relación de la destrucción de las Indias, 1552. Library of Congress exhibition.',
    rights: 'Historical text; verify translation permissions before republication.'
  },
  {
    id: 'new-laws-1542',
    title: 'New Laws of the Indies',
    author: 'Spanish Crown',
    date: '1542',
    type: 'Royal law',
    region: 'Spanish America',
    description: 'Spanish royal laws intended to limit Indigenous enslavement and restrain abuses in the encomienda system.',
    classroomExcerpt: 'Classroom excerpt: the laws limited the inheritance of encomiendas and prohibited the enslavement of Indigenous people.',
    questUse: ['Conquest & Conscience', 'Vocabulary Challenge', 'Empire’s Reckoning DBQ'],
    sourceUrl: 'https://sourcebooks.fordham.edu/mod/1542newlawsindies.asp',
    citation: 'New Laws of the Indies, 1542, English translation in Fordham Internet Modern History Sourcebook.',
    rights: 'Historical legal text; verify translation permissions before republishing.'
  },
  {
    id: 'hakluyt-1584',
    title: 'A Discourse Concerning Western Planting',
    author: 'Richard Hakluyt',
    date: '1584',
    type: 'Promotional memorandum',
    region: 'England / Atlantic',
    description: 'An English argument for colonization emphasizing trade, security, religion, and imperial competition.',
    classroomExcerpt: '“This enterprise will be for the increase of the forces of our country … and for the enlargement of the Queen’s dominions.”',
    questUse: ['MCQ Challenge: Virginia', 'Empire’s Reckoning DBQ'],
    sourceUrl: 'https://www.gutenberg.org/ebooks/5262',
    citation: 'Richard Hakluyt, A Discourse Concerning Western Planting, 1584. Project Gutenberg transcription.',
    rights: 'Public-domain historical work; confirm any transcription site terms before direct reuse.'
  },
  {
    id: 'harriot-1590',
    title: 'A Briefe and True Report of the New Found Land of Virginia',
    author: 'Thomas Harriot',
    date: '1590',
    type: 'Promotional report',
    region: 'English Atlantic',
    description: 'An English account presenting the resources and peoples of the Roanoke region to a European readership.',
    classroomExcerpt: '“The soile is very plentifull, sweete, fruitfull and wholesome.”',
    questUse: ['MCQ Challenge: Virginia', 'Empire’s Reckoning DBQ'],
    sourceUrl: 'https://www.loc.gov/item/48032384/',
    citation: 'Thomas Harriot, A briefe and true report of the new found land of Virginia, 1590. Library of Congress.',
    rights: 'Library of Congress digital collection; verify current Rights & Access statement before redistributing scans.'
  },
  {
    id: 'john-white-1585',
    title: 'Watercolor of Secotan Village',
    author: 'John White',
    date: '1585',
    type: 'Watercolor / visual source',
    region: 'North Carolina coast',
    description: 'An English watercolor of an Algonquian settlement near Roanoke, later reproduced by Theodore de Bry.',
    classroomExcerpt: 'Visual source: a planned settlement with fields, houses, and community structures, filtered through an English observer.',
    questUse: ['Virginia: Evidence Royale', 'HIPP: The English Observer'],
    sourceUrl: 'https://www.loc.gov/resource/cph.3a45878/',
    citation: 'John White, The town of Pomeiooc, c. 1585. Library of Congress.',
    rights: 'Library of Congress digital collection; verify current Rights & Access statement before redistributing scans.'
  },
  {
    id: 'oviedo-1535',
    title: 'Natural History of the Indies',
    author: 'Gonzalo Fernández de Oviedo',
    date: '1535',
    type: 'Chronicle / natural history',
    region: 'Caribbean',
    description: 'A Spanish chronicler’s descriptions and illustrations of unfamiliar American plants, foods, and goods.',
    classroomExcerpt: 'Classroom source note: Oviedo described and illustrated goods unfamiliar to Europeans, including tobacco, hammocks, and pineapple.',
    questUse: ['Vocabulary Challenge', 'MCQ Challenge: Caribbean Crossroads'],
    sourceUrl: 'https://www.loc.gov/exhibits/exploring-the-early-americas/columbus-and-the-taino.html',
    citation: 'Gonzalo Fernández de Oviedo, Historia general y natural de las Indias, 1535. Library of Congress exhibition.',
    rights: 'Historical work; verify the selected image and translation rights before republishing.'
  },
  {
    id: 'cabeza-de-vaca-1542',
    title: 'La Relación (The Account)',
    author: 'Álvar Núñez Cabeza de Vaca',
    date: '1542',
    type: 'Travel narrative',
    region: 'North American Southwest',
    description: 'A Spanish survivor’s account of years spent traveling through Indigenous North American communities.',
    classroomExcerpt: 'Classroom source note: Cabeza de Vaca described survival, trade, and cultural encounters across the Gulf Coast and Southwest.',
    questUse: ['Southwest Survey', 'Empire’s Reckoning DBQ'],
    sourceUrl: 'https://www.gutenberg.org/ebooks/49673',
    citation: 'Álvar Núñez Cabeza de Vaca, La Relación, 1542. Public-domain translation available through Project Gutenberg.',
    rights: 'Public-domain historical work; confirm any transcription site terms before direct reuse.'
  },
  {
    id: 'pizarro-1533',
    title: 'Narrative of the Conquest of Peru',
    author: 'Francisco de Xerez',
    date: '1534',
    type: 'Conquest narrative',
    region: 'Andes',
    description: 'A Spanish account of the conquest of the Inca Empire and the seizure of Atahualpa.',
    classroomExcerpt: 'Classroom source note: the narrative links military conquest, extraction of wealth, and Spanish claims to authority in the Andes.',
    questUse: ['Empire’s Reckoning DBQ'],
    sourceUrl: 'https://www.gutenberg.org/ebooks/40870',
    citation: 'Francisco de Xerez, True Account of the Conquest of Peru, 1534. Public-domain translation available through Project Gutenberg.',
    rights: 'Public-domain historical work; confirm any transcription site terms before direct reuse.'
  },
  {
    id: 'laws-of-burgos-1512',
    title: 'Laws of Burgos',
    author: 'Spanish Crown',
    date: '1512–1513',
    type: 'Royal law',
    region: 'Caribbean and Spanish America',
    description: 'Early Spanish regulations addressing Indigenous labor, conversion, residence, and treatment in the Caribbean.',
    classroomExcerpt: 'Classroom source note: the laws regulated Indigenous labor and required instruction in Christianity while preserving Spanish colonial control.',
    questUse: ['Vocabulary Challenge', 'Conquest & Conscience', 'Empire’s Reckoning DBQ'],
    sourceUrl: 'https://sourcebooks.fordham.edu/mod/1512burgos.asp',
    citation: 'Laws of Burgos, 1512–1513, English translation in Fordham Internet Modern History Sourcebook.',
    rights: 'Historical legal text; verify translation permissions before republishing.'
  }
];

const source = (id) => SOURCES.find((item) => item.id === id);

export const QUESTS = [
  {
    id: 'q-southwest-survey',
    title: 'Southwest Survey',
    shortTitle: 'Southwest Survey',
    mode: 'royale',
    icon: '⌁',
    location: 'American Southwest',
    coordinates: { left: '20%', top: '45%' },
    description: 'Read geographic evidence to compare how Native societies adapted to different North American environments.',
    skill: 'Comparison',
    xp: 45,
    unlocked: true,
    sources: ['cabeza-de-vaca-1542'],
    questions: [
      {
        prompt: 'Which development most directly supported the growth of more permanent settlements in parts of the present-day Southwest before European contact?',
        choices: ['The spread of maize cultivation and irrigation techniques', 'The introduction of European livestock', 'The growth of Atlantic commerce', 'The establishment of the encomienda system'],
        answer: 0,
        rationale: 'Maize cultivation and irrigation supported settlement and social diversification in the Southwest before European contact. The other choices occurred after contact or describe Spanish colonial systems.',
        skill: '1.A Developments and Processes'
      },
      {
        prompt: 'Compared with societies on the Great Plains, many societies in the Northeast were more likely to develop permanent villages primarily because they',
        choices: ['had access to mixed agriculture and hunting-gathering economies', 'were protected from all climate variation', 'had already adopted European weapons', 'were governed by Spanish colonial officials'],
        answer: 0,
        rationale: 'The CED highlights that mixed agricultural and hunter-gatherer economies in the Northeast, Mississippi Valley, and Atlantic seaboard favored permanent villages.',
        skill: '4.A Contextualization'
      },
      {
        prompt: 'The varied economic adaptations of Native societies before 1491 most strongly support which interpretation?',
        choices: ['Native societies were shaped by regional environmental conditions.', 'Native societies had little influence on their environments.', 'Native societies were culturally identical before European contact.', 'European colonization created all major regional differences.'],
        answer: 0,
        rationale: 'The question tests the relationship between geography and regional diversity, a central Unit 1 theme.',
        skill: '6.A Causation'
      }
    ]
  },
  {
    id: 'q-maize-bounty',
    title: 'The Maize Ledger',
    shortTitle: 'Maize Ledger',
    mode: 'vocab',
    icon: '✣',
    location: 'River Valleys',
    coordinates: { left: '25%', top: '25%' },
    description: 'Recover the key concepts that explain adaptation, exchange, and power before European contact.',
    skill: 'Context',
    xp: 40,
    unlocked: true,
    sources: ['cabeza-de-vaca-1542', 'oviedo-1535'],
    cards: [
      {
        term: 'Maize cultivation',
        definition: 'The farming of corn, which supported population growth, settlement, irrigation, and social diversification in several Native societies.',
        application: 'Which development best demonstrates the effects of maize cultivation in North America before 1491?',
        choices: ['The growth of irrigation systems and settled farming communities', 'The arrival of transatlantic slave ships', 'The adoption of Christianity by Spanish settlers', 'The creation of the Atlantic triangular trade'],
        answer: 0,
        misconception: 'Maize cultivation predates European contact; do not confuse it with Atlantic-world systems created after 1492.'
      },
      {
        term: 'Columbian Exchange',
        definition: 'The widespread transfer of plants, animals, people, pathogens, and ideas between the Eastern and Western Hemispheres after 1492.',
        application: 'Which item is the clearest example of a Columbian Exchange effect on American populations?',
        choices: ['The spread of smallpox among Indigenous communities', 'The development of irrigation before 1491', 'The formation of Iroquois political alliances before contact', 'The construction of Cahokia before 1200'],
        answer: 0,
        misconception: 'The Columbian Exchange is a process of interhemispheric transfer after European contact, not a term for all Native American trade.'
      },
      {
        term: 'Encomienda',
        definition: 'A Spanish colonial labor system that granted colonists the right to demand labor or tribute from Indigenous communities.',
        application: 'The encomienda system most directly reflected Spain’s desire to',
        choices: ['extract labor and wealth from conquered Indigenous populations', 'create representative legislatures in the Americas', 'end all racial distinctions in colonial society', 'prevent the spread of Catholic missions'],
        answer: 0,
        misconception: 'Encomienda did not mean legal ownership of land alone; it centered on extracting labor and tribute.'
      },
      {
        term: 'Caste system',
        definition: 'A hierarchy in Spanish colonial society that categorized people by ancestry, legal status, and place of birth.',
        application: 'A caste system most directly reinforced which outcome in Spanish America?',
        choices: ['Unequal access to power and status based on ancestry', 'Complete social equality among colonists', 'Political independence from Spain', 'The end of coerced labor'],
        answer: 0,
        misconception: 'Caste refers to social hierarchy, not simply a list of cultural groups.'
      }
    ]
  },
  {
    id: 'q-columbus-dispatch',
    title: 'Columbus’s Dispatch',
    shortTitle: 'Columbus Dispatch',
    mode: 'hipp',
    icon: '◈',
    location: 'Guanahaní / Caribbean',
    coordinates: { left: '47%', top: '47%' },
    description: 'Interrogate a victory report sent from the Caribbean to Spanish officials after the first voyage.',
    skill: 'Sourcing',
    xp: 60,
    unlocked: true,
    sources: ['columbus-1493'],
    source: source('columbus-1493'),
    prompts: {
      historicalSituation: 'What developments in late-fifteenth-century Europe help explain why Columbus wrote this report in 1493?',
      audience: 'Who was the intended audience, and what would that audience most want to know?',
      purpose: 'What did Columbus hope to persuade his audience to do or believe?',
      pov: 'How might Columbus’s role as a voyage leader seeking royal support shape the way he described the people and resources he encountered?'
    },
    model: 'Columbus wrote after Spain had financed a voyage seeking routes, wealth, and imperial advantage. Because he wrote to people connected to the Spanish Crown, he emphasized gold, trade goods, conversion, and the usefulness of the islands in order to secure continued royal support.'
  },
  {
    id: 'q-new-atlantic-chart',
    title: 'The New Atlantic Chart',
    shortTitle: 'Atlantic Chart',
    mode: 'hipp',
    icon: '◈',
    location: 'St. Dié / Europe',
    coordinates: { left: '75%', top: '24%' },
    description: 'Read a 1507 map as evidence of how European knowledge and imperial imagination changed after Atlantic voyages.',
    skill: 'Context',
    xp: 60,
    unlocked: true,
    sources: ['waldseemuller-1507'],
    source: source('waldseemuller-1507'),
    prompts: {
      historicalSituation: 'What new voyages and claims made a map like this possible by 1507?',
      audience: 'Who would be likely to use or value a world map in early-sixteenth-century Europe?',
      purpose: 'Why might mapmakers emphasize a separate western continent and new geographic knowledge?',
      pov: 'How might a European cartographer’s perspective shape what appears important on the map and what is left out?'
    },
    model: 'The map emerged after Iberian Atlantic voyages disrupted older European geographic assumptions. A European cartographer drew the new hemisphere for European audiences interested in trade, exploration, and imperial competition; the map treats the Americas as newly “discovered” even though Indigenous peoples had long lived there.'
  },
  {
    id: 'q-tenochtitlan-royale',
    title: 'Tenochtitlan Under Watch',
    shortTitle: 'Tenochtitlan',
    mode: 'royale',
    icon: '⌁',
    location: 'Tenochtitlan',
    coordinates: { left: '31%', top: '62%' },
    description: 'Compare European and Indigenous evidence to evaluate the conquest of a powerful Mesoamerican city.',
    skill: 'Evidence',
    xp: 55,
    unlocked: true,
    sources: ['cortes-second-letter-1520', 'tenochtitlan-map-1524', 'codex-azcatitlan'],
    questions: [
      {
        stimulus: 'Hernán Cortés, Second Letter to Charles V, 1520: “This great city of Temixtitan is built in the midst of a salt lake … The principal streets are very wide and straight.”',
        prompt: 'Cortés’s description most directly challenges which European assumption about the Americas?',
        choices: ['That American societies lacked large, complex urban centers', 'That Atlantic crossings were impossible', 'That Spain should avoid competition with Portugal', 'That Europe had no demand for precious metals'],
        answer: 0,
        rationale: 'By comparing Tenochtitlan to major Spanish cities and describing its design, Cortés provided evidence of a complex urban society.',
        skill: '3.B Claims and Evidence in Sources'
      },
      {
        stimulus: 'Compare a European map of Tenochtitlan with a sixteenth-century Nahua pictorial account of the Spanish arrival.',
        prompt: 'Which historical skill would be most useful for evaluating differences between the two sources?',
        choices: ['Sourcing each document’s point of view and purpose', 'Memorizing the exact date of every conquest', 'Calculating the distance from Spain to Mexico', 'Identifying a single “neutral” source'],
        answer: 0,
        rationale: 'The sources were created from different cultural perspectives and for different purposes; sourcing helps explain why they may frame conquest differently.',
        skill: '2.B Sourcing and Situation'
      },
      {
        stimulus: 'A map of Tenochtitlan depicts causeways, canals, central religious structures, and an island setting.',
        prompt: 'The map best supports which claim about the city before Spanish rule?',
        choices: ['It was a planned urban center shaped by its lake environment.', 'It depended entirely on European architecture.', 'It had no political or religious significance.', 'It was isolated from regional exchange networks.'],
        answer: 0,
        rationale: 'The depicted causeways, canals, and central structures support the claim that Tenochtitlan was an organized urban center adapted to its environment.',
        skill: '1.B Developments and Processes'
      }
    ]
  },
  {
    id: 'q-conquest-conscience',
    title: 'Conquest & Conscience',
    shortTitle: 'Conquest & Conscience',
    mode: 'hipp',
    icon: '◈',
    location: 'Spanish Indies',
    coordinates: { left: '55%', top: '52%' },
    description: 'Compare royal authority with a Dominican critic as Spain debated conquest, labor, and Indigenous humanity.',
    skill: 'Sourcing',
    xp: 65,
    unlocked: true,
    sources: ['requerimiento-1513', 'las-casas-1552', 'new-laws-1542'],
    source: source('las-casas-1552'),
    prompts: {
      historicalSituation: 'What features of Spanish conquest and colonial labor help explain why Las Casas wrote this critique?',
      audience: 'Who did Las Casas hope would read or respond to his account?',
      purpose: 'How could the purpose of condemning Spanish abuses shape the source’s language?',
      pov: 'How might Las Casas’s role as a Dominican friar and former settler influence his account?'
    },
    model: 'Las Casas wrote as Spanish conquest and colonial labor systems produced widespread exploitation and violence. As a Dominican critic seeking royal and religious reform, he stressed abuses in emotionally powerful language to persuade authorities that Indigenous people should receive protection.'
  },
  {
    id: 'q-virginia-royale',
    title: 'Virginia: Promise or Projection?',
    shortTitle: 'Virginia',
    mode: 'royale',
    icon: '⌁',
    location: 'Roanoke / English Coast',
    coordinates: { left: '29%', top: '34%' },
    description: 'Test the difference between an English promotional report and evidence of Indigenous communities on the Atlantic coast.',
    skill: 'Comparison',
    xp: 55,
    unlocked: true,
    sources: ['harriot-1590', 'john-white-1585', 'hakluyt-1584'],
    questions: [
      {
        stimulus: 'Thomas Harriot, 1590: “The soile is very plentifull, sweete, fruitfull and wholesome.”',
        prompt: 'Harriot’s language was most likely intended to',
        choices: ['encourage English investment and colonization', 'persuade Spain to abandon American claims', 'criticize plantation agriculture in Virginia', 'argue that Native societies had no economy'],
        answer: 0,
        rationale: 'Harriot’s report promoted the resources of Virginia to a European audience, reflecting English motives for colonization.',
        skill: '2.C Claims and Evidence in Sources'
      },
      {
        stimulus: 'John White’s watercolor of a Secotan village shows cultivated fields, buildings, and a planned community.',
        prompt: 'The image most directly provides evidence that',
        choices: ['many Indigenous communities on the Atlantic coast had developed settled, organized societies', 'English colonists had already created permanent settlements in 1585', 'Native people had rejected agriculture before contact', 'European diseases had not affected any American society'],
        answer: 0,
        rationale: 'The image documents a community with settlement and agriculture, though students should still source it as an English observer’s representation.',
        skill: '3.B Claims and Evidence in Sources'
      },
      {
        stimulus: 'Richard Hakluyt argued that western planting would increase English strength and enlarge the Queen’s dominions.',
        prompt: 'Hakluyt’s argument reflects which broader development?',
        choices: ['Competition among European states for wealth, trade, and empire', 'The decline of all Atlantic trade', 'The end of religious motives in Europe', 'The immediate independence of English colonies'],
        answer: 0,
        rationale: 'Hakluyt linked colonization to power and imperial competition, a major motive for European exploration and settlement.',
        skill: '4.A Contextualization'
      }
    ]
  },
  {
    id: 'q-empires-reckoning',
    title: 'Empire’s Reckoning',
    shortTitle: 'Empire’s Reckoning',
    mode: 'boss',
    icon: '✦',
    location: 'The Atlantic World',
    coordinates: { left: '59%', top: '30%' },
    description: 'Face the Unit 1 writing boss: analyze evidence, construct an argument, and score it with the AP rubrics.',
    skill: 'Argument',
    xp: 100,
    unlocked: true,
    sources: ['waldseemuller-1507', 'columbus-1493', 'requerimiento-1513', 'cortes-second-letter-1520', 'florentine-codex-smallpox', 'las-casas-1552', 'harriot-1590', 'new-laws-1542'],
    variants: {
      saq: {
        label: 'SAQ Skirmish',
        rubric: 'saq',
        prompt: 'Use the excerpt below and your knowledge of United States history to answer all parts of the question.\n\nChristopher Columbus, letter describing his first voyage, 1493: “Their Highnesses may see that I shall give them as much gold as they need … and spices and cotton.”',
        parts: [
          { label: 'A', text: 'Briefly describe ONE motive for European exploration in the Americas that is reflected in the excerpt.' },
          { label: 'B', text: 'Briefly explain ONE way the Columbian Exchange changed Indigenous societies in the Americas between 1492 and 1607.' },
          { label: 'C', text: 'Briefly explain ONE way that European competition shaped later colonization in North America before 1607.' }
        ]
      },
      leq: {
        label: 'LEQ Duel',
        rubric: 'leq',
        prompt: 'Evaluate the extent to which European exploration transformed societies in the Americas in the period from 1491 to 1607.',
        planningPrompts: [
          'What is your defensible thesis and line of reasoning?',
          'What broader context will you use?',
          'Which two or more specific pieces of evidence will support your argument?',
          'Will you organize by causation, comparison, or continuity and change?'
        ]
      },
      dbq: {
        label: 'DBQ Siege',
        rubric: 'dbq',
        prompt: 'Evaluate the extent to which European exploration and conquest transformed societies in the Americas in the period from 1491 to 1607.',
        documents: [
          { label: 'Document 1', source: source('waldseemuller-1507'), note: 'Map visual: depicts the Americas as a distinct western landmass and names part of it “America.”' },
          { label: 'Document 2', source: source('columbus-1493'), note: source('columbus-1493').classroomExcerpt },
          { label: 'Document 3', source: source('requerimiento-1513'), note: source('requerimiento-1513').classroomExcerpt },
          { label: 'Document 4', source: source('cortes-second-letter-1520'), note: source('cortes-second-letter-1520').classroomExcerpt },
          { label: 'Document 5', source: source('florentine-codex-smallpox'), note: source('florentine-codex-smallpox').classroomExcerpt },
          { label: 'Document 6', source: source('las-casas-1552'), note: source('las-casas-1552').classroomExcerpt },
          { label: 'Document 7', source: source('harriot-1590'), note: source('harriot-1590').classroomExcerpt }
        ]
      }
    }
  }
];

export const SOURCE_INDEX = Object.fromEntries(SOURCES.map((item) => [item.id, item]));
