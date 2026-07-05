export const PROFESSIONS = [
  {
    id: "blacksmith",
    label: "Blacksmith",
    icon: "⚒",
    description: "Shapes tools and fittings for the settlement.",
    worldBonus: "Earn one additional common crafting material from qualifying town-build quests.",
    starterItem: "Iron tongs"
  },
  {
    id: "printer",
    label: "Printer",
    icon: "▤",
    description: "Sets type, prints notices, and carries public ideas into the world.",
    worldBonus: "Unlock pamphlet and newspaper dialogue routes in public-message quests.",
    starterItem: "Printer's block"
  },
  {
    id: "farmer",
    label: "Farmer",
    icon: "❋",
    description: "Grows supplies that sustain the settlement.",
    worldBonus: "Earn an additional supply token from qualifying community projects.",
    starterItem: "Seed pouch"
  },
  {
    id: "merchant",
    label: "Merchant",
    icon: "◍",
    description: "Moves goods, news, and resources across communities.",
    worldBonus: "Receive improved non-premium trade offers in market quests.",
    starterItem: "Trade ledger"
  },
  {
    id: "surveyor",
    label: "Surveyor",
    icon: "⌖",
    description: "Reads the land and plans roads, boundaries, and routes.",
    worldBonus: "Reveal one optional route or map detail in qualifying exploration quests.",
    starterItem: "Measuring chain"
  },
  {
    id: "healer",
    label: "Healer",
    icon: "✚",
    description: "Cares for neighbors and steadies a community in difficult moments.",
    worldBonus: "Create one recovery item after qualifying community-care quests.",
    starterItem: "Herb satchel"
  }
];

export const PROFESSION_BY_ID = Object.fromEntries(
  PROFESSIONS.map((profession) => [profession.id, profession])
);
