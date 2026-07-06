# Atlantic Crossroads — PNG Character Art Pack (v2)

This package contains the revised hybrid-art documentation and the complete current Unit 1 PNG art set.

## Major correction: one model per visual type
There are **not** eight man PNGs and eight woman PNGs in the production system.

The final architecture uses:

```text
1 static man base model + 1 man skin mask
1 static woman base model + 1 woman skin mask
8 selectable skin-tone values applied dynamically at runtime
```

That means each student chooses one visual model (`man` or `woman`) and a skin tone. The game changes skin tone through a dedicated masked color layer. It does **not** download, store, or swap eight separate character-body images per model.

## What is inside

- `assets/reference/` — art direction and model/skin-tone reference sheets
- `assets/unit-1/source-concepts/` — original high-fidelity Unit 1 item art
- `assets/unit-1/store-previews-transparent/` — transparent store-card versions of those item images
- `docs/` — architecture, skin-tone, data, migration, and VS Code implementation instructions
- `data/` — starter Unit 1 item definitions and the one-model skin tone configuration
- `css/` — the layered PNG renderer contract

## Unit 1 starter loadout

| Slot | Item name | Item ID |
|---|---|---|
| Hat | Weathered Tricorn | `weathered-tricorn` |
| Shirt | Homespun Linen Shirt | `homespun-linen-shirt` |
| Belt | Brass Buckle Belt | `brass-buckle-belt` |
| Pants | Colonial Field Breeches | `colonial-field-breeches` |
| Shoes | Colonial Buckle Shoes | `colonial-buckle-shoes` |
| Hand | Rolled Sea Chart | `rolled-sea-chart` |
| Transportation | Bay Mare | `bay-mare` |

## Important asset-status note
The transparent Unit 1 files are ready for **store cards, inventory previews, reward popups, and item detail views**.

They are not yet final avatar-aligned equipment layers. The final gear-layer export must be drawn on the single locked avatar canvas and pose described in `docs/03-AVATAR-LAYER-CONTRACT.md`.

Do not stretch, shrink, or place the standalone product art directly over the character as a permanent equipment solution. It will look like stickers rather than clothing.
