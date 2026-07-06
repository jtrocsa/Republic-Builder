# Data and Migration

## Character data shape

```json
{
  "characterVersion": 4,
  "character": {
    "name": "Aria",
    "sex": "woman",
    "pronouns": "she/her",
    "appearance": {
      "skinTone": "tone-3"
    }
  },
  "inventory": {
    "ownedItemIds": [
      "weathered-tricorn",
      "homespun-linen-shirt",
      "brass-buckle-belt",
      "colonial-field-breeches",
      "colonial-buckle-shoes",
      "rolled-sea-chart",
      "bay-mare"
    ],
    "newItemIds": []
  },
  "equipped": {
    "hat": "weathered-tricorn",
    "shirt": "homespun-linen-shirt",
    "belt": "brass-buckle-belt",
    "pants": "colonial-field-breeches",
    "shoes": "colonial-buckle-shoes",
    "hand": "rolled-sea-chart",
    "transportation": "bay-mare"
  }
}
```

## Migration requirements

1. preserve name and pronouns if present
2. map legacy avatar selection to `woman` or `man`
3. default missing skin tone to `tone-4`
4. grant Unit 1 starter set if missing
5. preserve Historian XP, Archive Tokens, badges, quests, transaction history, and valid item ownership
6. hide former room/builder data instead of deleting it
7. never convert skin tone into inventory or a purchasable attribute
