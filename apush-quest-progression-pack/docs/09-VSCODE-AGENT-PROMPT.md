# Prompt for the VS Code Agent

Copy and paste this after you have copied this pack’s folders into the existing repository.

```text
Implement the new APUSH quest progression system using the files I added under assets/badges, css, js, data, and docs. Do not replace or delete existing unrelated files. Inspect the current project first and preserve its current routing, naming conventions, and visual style.

Use docs/00-START-HERE.md, docs/01-PROGRESSION-ARCHITECTURE.md, docs/04-QUEST-TAXONOMY.md, docs/05-TEACHER-DASHBOARD.md, and docs/08-INTEGRATION-CHECKLIST.md as the source of truth.

Required changes:
1. Replace old currency text such as “Town Marks” with “Archive Tokens.” Historian XP and Archive Tokens must be separate balances; spending tokens must never reduce XP.
2. Replace ambiguous quest names. Every quest card must visibly use: “Activity Type: Historical Topic,” then show mode, estimated time, badges built, XP reward, and Archive Token reward. “Boss Battle” is a mode tag only, never a stand-alone activity type.
3. Build a Historian Journey header using the 20-level default curve from js/quest-progression-config.js. Use the mastery gate so Level 20 / Master Historian remains locked until the Unit 9 Master Seal is earned.
4. Build a Badge Case with two sections: Assessment Mastery badges and Unit Collection badges. Use the SVG files from assets/badges. Locked badges should be grayscale/low-opacity; active badges must show a progress bar or ring; earned badges must show the correct tier/state.
5. Use js/quest-progression-engine.js as the single place for calculating XP, tokens, quest completion, badge progress, level state, and purchases. Do not mutate localStorage directly from UI components.
6. Add Unit 1 using data/unit-1-quest-catalog.example.json and the Unit 1 badge catalog. Implement the five Unit 1 quests as a working vertical slice.
7. Add a simple store with a visible Archive Token balance. Use the starter catalog in js/quest-store-data.js. Prevent purchases when students lack tokens; record each purchase in the transaction log.
8. Add a teacher settings page or admin panel that can edit the level thresholds, reward presets, mastery gate, and per-quest XP/token values. Use sensible validation and show warnings when token/XP values exceed recommended ranges.
9. Preserve academic fairness. No badge, purchase, or cosmetic can grant an answer advantage, change a graded rubric, or alter assessment conditions.
10. Add accessible labels, keyboard focus states, alt text/ARIA labels for all badge images, and responsive layouts.

At the end, provide a concise file-by-file summary, list anything that could not be safely integrated without a decision from me, and do not rewrite the project into a different framework.
```
