# Avatar Layer Contract

## Locked production master canvas

All production avatar layers must use exactly one canvas and anchor contract:

```text
Master art: 2048 × 3072 PNG
Display export: 1024 × 1536 PNG
Small HUD export: 512 × 768 PNG
```

Each exported layer retains the full canvas dimensions even when most pixels are transparent.

## Fixed pose

- front-facing
- neutral upright posture
- relaxed arms
- no animation rig
- camera framing unchanged across all assets
- lighting from upper left
- warm cream / muted navy / brass visual language

## Base model rules

The base model contains:
- body
- neutral underlayer only where needed for modesty and seamless equipment overlaps
- hair/face styling for that base model

The base model does not contain:
- a hat
- finished shirt
- finished pants
- belt
- shoes
- hand object
- transportation

## Equipment layer requirements

Each equipped image must:

- have transparent background
- use the exact locked master canvas
- align to the base pose without CSS positioning adjustments
- use the matching lighting and scale
- occupy only the correct visual region
- be named with the stable item ID

Examples:

```text
assets/characters/equipment/shirt/homespun-linen-shirt.png
assets/characters/equipment/pants/colonial-field-breeches.png
assets/characters/equipment/shoes/colonial-buckle-shoes.png
```

## Do not use standalone item art as an equipment layer
The included Unit 1 product art is ideal for store presentation. It is not pose-aligned avatar art. Equipment versions must be redrawn/exported in the layer contract before they are equipped in the live avatar.
