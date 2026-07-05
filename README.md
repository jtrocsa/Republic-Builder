# Republic Builder

A visual, classroom-focused AP U.S. History RPG prototype. Students create a founder, build a fictional republic across the nine APUSH units, complete historically grounded quests, earn artifacts, and eventually practice writing through DBQ boss battles.

This is a **front-end starter**, built with HTML, CSS, JavaScript, SVG assets, and browser-local saves. It is ready for GitHub Pages.

## What this build includes

- A full-screen, RPG-style **Founder’s Character Forge**
- Founder name, gender/presentation, town, profession, starting wardrobe, republic name, and motto
- Six capped character traits: Intellect, Industry, Influence, Courage, Diplomacy, and Integrity
- Eight professions with balanced starting advantages
- SVG paper-doll layers for hat, shirt/tunic, pants, socks, and shoes
- A quest dashboard with XP, Republic Points, Republic Pillars, inventory, Unit 1–9 progression, daily bonus, and demo teacher controls
- A repeatable content model in `data.js`
- A swappable save adapter in `storage.js`

## Character Creator

The founder forge now lives as a dedicated feature page at `features/character-forge/character-forge.html` and is opened from the existing game shell. It uses a compact five-step layout with a left-step panel, center preview, and right summary rail, while saving the in-progress creator state locally so refreshes do not erase choices.

The creator flow covers Identity, Profession, Founder Path, Historian Skills, and Review. Historian Skills begin at 5/20, with the chosen primary and secondary skills starting at 7/20. The final founder profile is written back into the same browser storage used by the dashboard.

## Open the demo

Open `index.html` in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

For GitHub Pages, upload this repository, then enable Pages from the repository’s settings using the main branch and the root folder.

## File guide

```txt
index.html            Game layout and Character Forge shell
styles.css            Dashboard and Forge visual design
app.js                Rendering, game rules, quest interactions, character flow
data.js               Teacher-editable quest, unit, character, profession, town, and wardrobe content
storage.js            One-file save adapter; localStorage now, remote database later
assets/               Original SVG game art and character wardrobe layers
docs/                 Content, design, assets, persistence, and roadmap documentation
```

## Current save behavior

Progress is stored only in the same browser through `localStorage`. It is excellent for the prototype, but it will not sync across student devices. The code is already structured so that `storage.js` can later be replaced with a secure account/database adapter.

Read: [Progress Saving and Future Accounts](docs/PERSISTENCE_ARCHITECTURE.md)

## Core documentation

- [Character Creation System](docs/CHARACTER_CREATION.md)
- [Asset Catalog](docs/ASSET_CATALOG.md)
- [Progress Saving and Future Accounts](docs/PERSISTENCE_ARCHITECTURE.md)
- [Content Model](docs/CONTENT_MODEL.md)
- [Design System](docs/DESIGN_SYSTEM.md)
- [Roadmap](docs/ROADMAP.md)

## Development principle

Build reusable engines, not isolated activities:

- A new quest should be a new data object.
- A new DBQ boss battle should use the same writing/rubric infrastructure with different documents.
- A new profession or era outfit should be content in `data.js` plus an asset—not a rewrite of game logic.
- A future database should replace the save adapter—not force a redesign of the game.

## Next logical build

Create the reusable **DBQ Boss Battle engine**: source viewer, structured thesis/context/evidence/HIPP fields, rubric progress, teacher review state, and provisional XP. The system should coach students toward better historical writing without treating automated feedback as a final grade.
