# Character Architecture

## Identity and appearance

```js
identity: {
  name: "Avery",
  sex: "woman", // Selects the illustrated base model: `woman` or `man`
  pronouns: "they/them"
},
appearance: {
  skinTone: "tone-4" // Free visual appearance setting, not equipment
}
```

`sex` is retained because it is the requested creation choice. In the interface, label this control **Character model** and explain that it only selects the illustrated model. `skinTone` is a separate, always-free appearance choice. Both choices affect only the paper-doll body layer; they never affect academic content, rewards, eligibility, pricing, or cosmetic compatibility.

## Skin-tone rule

- Provide all eight supplied skin tones for both models.
- Display swatches visually and provide an accessible label such as `Skin Tone 4`.
- Do not put skin tone in the store, inventory, equipment slots, quest rewards, or badge rewards.
- Keep **Appearance** accessible from Customize after creation. A student may change skin tone at any time at no cost.
- Existing characters without a saved tone render as `tone-4` until the next profile save/migration.

## Equipment slots

| Slot | Purpose | Layer order |
|---|---|---:|
| transportation | Visual companion/vehicle behind the character | 0 |
| base | Selected model plus selected skin tone | 1 |
| pants | Lower-body apparel | 2 |
| shoes | Footwear | 3 |
| shirts | Torso apparel and outerwear | 4 |
| belts | Belts, sashes, tool belts, suspenders | 5 |
| hands | Held item | 6 |
| hats | Headwear | 7 |

All students begin with the same starter clothing: Starter Linen Tunic, Starter Wool Trousers, Starter Leather Shoes, Starter Rope Belt, and Starter Journal. Hat and transportation start empty.

## Persistence model

Character identity, appearance, inventory, equipped slots, and item ownership must persist in the same profile save used by XP, Archive Tokens, badges, and the store. The character system should never create a competing student profile or its own isolated localStorage key.

## Acquisition paths

- `starter`: granted at creation.
- `store`: purchasable with Archive Tokens.
- `quest`: awarded by named quest/reward logic; not purchasable by default.
- `badge`: awarded by Badge/Unit Seal progression; not purchasable by default.

An item is only equipable after it has been granted into inventory. Duplicate rewards must not make duplicate inventory records. Skin tone is not an acquired item and therefore has no acquisition path.
