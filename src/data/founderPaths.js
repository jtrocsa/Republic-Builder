export const FOUNDER_PATHS = [
  {
    id: "scholar",
    label: "Scholar",
    icon: "✦",
    tagline: "Keeper of records and seeker of forgotten stories.",
    role: "Archivist, reader, map keeper",
    narrativeStrengths: ["archive dialogue", "study décor", "record-keeping quest routes"],
    starterReward: "Archive desk"
  },
  {
    id: "maker",
    label: "Maker",
    icon: "⚒",
    tagline: "Builder of useful things and practical solutions.",
    role: "Builder, artisan, craftsperson",
    narrativeStrengths: ["workshop dialogue", "crafting décor", "build-project quest routes"],
    starterReward: "Workshop lantern"
  },
  {
    id: "orator",
    label: "Orator",
    icon: "◈",
    tagline: "A public voice who can move a room with an idea.",
    role: "Speaker, writer, organizer",
    narrativeStrengths: ["speech dialogue", "town-square décor", "public-message quest routes"],
    starterReward: "Wax-seal kit"
  },
  {
    id: "pathfinder",
    label: "Pathfinder",
    icon: "✺",
    tagline: "A traveler willing to enter uncertain terrain.",
    role: "Scout, traveler, explorer",
    narrativeStrengths: ["map dialogue", "expedition décor", "exploration quest routes"],
    starterReward: "Field compass"
  },
  {
    id: "mediator",
    label: "Mediator",
    icon: "⌁",
    tagline: "A community connector who sees room for common ground.",
    role: "Negotiator, coalition builder, community connector",
    narrativeStrengths: ["coalition dialogue", "community décor", "reconciliation quest routes"],
    starterReward: "Council ledger"
  },
  {
    id: "steward",
    label: "Steward",
    icon: "⚖",
    tagline: "A dependable civic caretaker devoted to the common good.",
    role: "Civic caretaker, reliable neighbor",
    narrativeStrengths: ["civic-trust dialogue", "public-service décor", "stewardship quest routes"],
    starterReward: "Town charter"
  }
];

export const FOUNDER_PATH_BY_ID = Object.fromEntries(
  FOUNDER_PATHS.map((path) => [path.id, path])
);

export const LEGACY_TRAIT_TO_FOUNDER_PATH = {
  intellect: "scholar",
  industry: "maker",
  influence: "orator",
  courage: "pathfinder",
  diplomacy: "mediator",
  integrity: "steward"
};
