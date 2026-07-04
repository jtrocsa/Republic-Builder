# Republic Builder Roadmap

## Phase 0 — Layout prototype (included now)

- Static GitHub Pages-ready dashboard
- Responsive game UI
- Sample Unit 3 quests
- Local browser progress
- Teacher-demo controls
- Content and visual documentation

## Phase 1 — A real playable single-student prototype

- Character creator with a handful of non-stereotyped avatar choices
- A landing/onboarding sequence
- Unit 1 quest set
- Better quest interactions: matching, sorting, source annotation, short answer, and teacher-reviewed completion
- Progress journal and unlocked artifact lore
- Sound toggle with optional, non-intrusive audio feedback

## Phase 2 — Teacher-created classroom game

- Teacher login and role permissions
- Class roster and student accounts
- Teacher quest builder
- Student progress dashboard
- Assignment deadlines and manual score approval
- Rubric-aligned DBQ/LEQ/SAQ submissions
- Exportable progress data

## Phase 3 — Full APUSH campaign

- Nine complete APUSH units
- Unit maps and primary-source encounters
- Historical figures as context-rich guides rather than collectible “powers”
- Timeline missions and evidence quests
- Boss battles tied to writing skills and historical reasoning
- Differentiation paths and accessible alternatives

## Phase 4 — Advanced features

- Cloud saves and cross-device progress
- School-safe class leaderboard controls
- Optional classroom teams
- Audio, ambient sound, and screen-reader-safe captions/transcripts
- Teacher analytics by AP history skill rather than only total points
- Import tools for existing assignments, videos, documents, and LMS links

## Technology decision point

The static version is right for early design because it deploys easily and lets you refine the classroom experience. Move to a fuller app architecture only when you need real accounts, cloud data, teacher/student permissions, collaborative features, or dependable device-to-device saving.

A likely transition would be a modern front end plus a managed authentication/database service. Decide that after the game rules and teacher workflow are tested with real students.
