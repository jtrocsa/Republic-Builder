# Implementation Notes

## What Changed

- `app.js` now routes the existing dashboard creator entry points to the new forge page.
- `js/app.js` powers the standalone creator flow and saves both the in-progress draft and the finished founder profile.
- `features/character-forge/character-forge.html` adds the feature entry point inside the current site.
- `features/character-forge/character-forge.css` styles the forge in the dark navy / gold visual language.
- `README.md` now includes a short Character Creator section.

## Central Character State

- The creator’s single source of truth lives in `js/app.js` as the `state` object.
- That state owns the full founder draft: identity, appearance, clothing, profession, Founder Path, and Historian Skills.
- The final dashboard-compatible profile is built from that same state, not from separate card variables.

## Current Layout

- The live forge uses a compact five-step flow: Identity, Profession, Founder Path, Historian Skills, and Review.
- The page is arranged as a left step panel, a large center preview, and a right summary rail, matching the screenshot-style layout.

## Local Storage Keys

- `republic-builder-character-forge-v1` stores the in-progress creator draft.
- `republic-builder-profile` stores the finalized founder profile used by the dashboard.
- `republic-builder-state-v2` remains the existing game progress save for the main APUSH dashboard.

## Clothing Previews

- Clothing changes update the avatar immediately through the `avatarSvg()` renderer in `js/app.js`.
- The preview is layered inline SVG, so hat, shirt, vest, pants, and boots update without relying on external image URLs.
- Missing assets fail gracefully because the avatar is built from SVG markup and local fallbacks.

## How To Extend The Creator

- Add a profession in `js/data.js` under `PROFESSIONS`, then add any new review text or bonuses in the same data file.
- Add a Founder Path in `js/data.js` under `PATHS`, then update any profile summary text if the new path needs custom language.
- Add a clothing option in `js/data.js` under `CLOTHING`, then map it inside `mapClothingToOutfit()` and `avatarSvg()` in `js/app.js`.
- Add a Historian Skill in `js/data.js` under `SKILLS`, then update the profile-save logic if the new skill needs a special preview or reward rule.
