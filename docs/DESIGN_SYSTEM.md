# Republic Builder Design System

## Visual goal

Republic Builder should feel like an approachable historical strategy game: **navy command panels, warm parchment content cards, brass/gold details, and clear visual hierarchy**. The interface should feel polished enough for high school students without becoming visually overwhelming or making history look like a cartoon.

## Core palette

| Token | Use |
|---|---|
| Deep navy | Primary command panels, backgrounds, navigation |
| Parchment | Quest cards and reading-oriented content |
| Gold | Progress, rewards, key labels, borders |
| Red | Bosses, critical choices, danger, high-energy calls to action |
| Green | Completed work, positive progress, routine quest actions |
| Blue | XP, research, source-analysis cues |

The reusable CSS variables are at the top of `styles.css`.

## Typography

- **Cinzel** gives labels, headings, badges, and game UI an engraved civic feel.
- **Spectral** is used for historic/story text and helps the parchment panels feel readable.
- **DM Sans** carries numbers, controls, and dense interface details.

Do not use decorative display fonts for paragraph-length instructions, DBQ prompts, or source excerpts.

## UI hierarchy

1. The Founder’s Character Forge is the first-run entry point: a high-contrast RPG onboarding screen with a live avatar preview.
2. Current student progress appears first on the dashboard: profile, XP, points, and streak.
3. Founder Traits show personal skill growth; Republic Pillars show civic/historical tensions. Keep those systems visually and conceptually distinct.
4. The Quest Board is the center of the dashboard and should stay the primary action area.
5. The right column holds persistent context: republic status, inventory, upcoming boss.
6. The APUSH unit rail makes the year-long journey visible.

## Accessibility non-negotiables

- Buttons retain visible keyboard focus states.
- Color is never the only indicator of completion, correctness, or locked content.
- The layout includes a `prefers-reduced-motion` fallback.
- Quest cards use clear text labels in addition to iconography.
- Maintain a readable font size and high contrast for instructions, sources, and answer options.
- In the production game, do not tie leaderboard visibility or rewards to student disability status, speed of completion, or private performance data.

## Visual asset direction

The starter includes original lightweight SVG assets so the prototype works without image licensing questions or third-party hosting. Character bases and clothing layers share a `400 × 500` SVG coordinate system so they can stack in the Forge. As the game expands, add art intentionally:

- Use original, public-domain, or properly licensed archival images.
- Credit source images where needed.
- Avoid using AI-generated portraits for real historical people when reliable public-domain portraits are available.
- Use art to support a historical context, not just to decorate a card.
