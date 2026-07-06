# APUSH Quest Progression Pack

A drop-in architecture package for the APUSH Website quest system. It replaces ambiguous game labels with a clear academic activity taxonomy, adds a 20-level Historian Journey, uses **Archive Tokens** for the store, and introduces a collectible badge case with tiered assessment badges and Unit 1 badges.

## What is included

- A 20-level XP curve designed to reach **Master Historian** in Unit 9, not early in the year.
- A non-inflationary store economy using Archive Tokens.
- Eight general assessment badge definitions with Bronze, Silver, and Gold tiers.
- Six Unit 1 badge definitions, including a Unit 1 master seal.
- Fourteen original SVG badge assets plus four UI/support SVGs.
- Plain-language quest naming rules and examples.
- Vanilla JavaScript starter modules, JSON examples, and stylesheet components.
- Teacher-dashboard settings and data-model documentation.
- A copy/paste prompt for the VS Code agent.

## Add this package to the repository

1. Copy the contents of `assets/`, `css/`, `js/`, and `data/` into the matching folders in the website repository. These files intentionally use the `quest-` prefix so they can coexist with existing files.
2. Read `docs/00-START-HERE.md` and `docs/08-INTEGRATION-CHECKLIST.md` before changing existing code.
3. Give the VS Code agent the exact instructions in `docs/09-VSCODE-AGENT-PROMPT.md`.
4. Treat `data/progression-config.example.json` as the teacher-editable default profile. Do not hard-code XP thresholds or token prices in UI components.

## Core design in one sentence

Students complete clearly labeled APUSH activities, gain Historian XP and Archive Tokens, visibly progress toward badges, and spend only Archive Tokens on cosmetics and optional ungraded practice tools.

## Important fairness rule

No cosmetic, store purchase, badge, level, or path may provide an answer advantage on graded work. Rewards may unlock visual customization, optional practice, review organizers, story flavor, and replays of ungraded work only.

## Source alignment

The assessment badges are designed around the official AP U.S. History assessment types and rubrics. The current Course and Exam Description effective Fall 2026 lists the 55-question multiple-choice section, three short-answer questions, a DBQ, and an LEQ; College Board says the May 2027 SAQ/LEQ format changes retain the same scoring criteria. See `docs/10-AP-ALIGNMENT.md` for source links and implementation notes.
