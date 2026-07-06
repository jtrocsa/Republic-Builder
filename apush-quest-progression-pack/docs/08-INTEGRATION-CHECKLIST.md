# Integration Checklist

## Before copying files

- [ ] Back up the current repository or make a Git branch.
- [ ] Confirm existing quest file names; this pack uses `quest-` prefixes to reduce collisions.
- [ ] Confirm whether your site currently uses script modules. The supplied JavaScript is ES-module based.
- [ ] Find every old UI label that uses “Evidence Royale,” “Boss Battle” without an activity type, or “Town Marks.”

## Copy this package

- [ ] Copy `assets/badges/` into the repository’s existing `assets/` folder.
- [ ] Copy `css/quest-progression.css` into the existing `css/` folder.
- [ ] Copy the files in `js/` into the existing `js/` folder.
- [ ] Copy `data/` into the existing `data/` folder.
- [ ] Copy `docs/` into the existing `docs/` folder.

## Update the site shell

- [ ] Load `quest-progression.css` after the general game stylesheet.
- [ ] Import the progression modules from the quest dashboard entry file.
- [ ] Add the Historian Journey level bar and Archive Token chip to the main game header.
- [ ] Add the Badge Case route/modal/page.
- [ ] Add a store route/modal/page that reads `quest-store-data.js`.

## Update existing quest cards

Every existing quest card must be migrated to:

```text
Activity Type: Historical Topic
Mode • Time • Item count
Builds: Badge(s)
Rewards: XP + Archive Tokens
```

- [ ] Replace the large text “Evidence Royale” with `MCQ Challenge: [topic]`.
- [ ] Keep any lore name only as optional decoration or subtitle.
- [ ] Replace “Town Marks” with “Archive Tokens.”
- [ ] Add `xpReward`, `tokenReward`, and `badgeLinks` to every quest object.
- [ ] Confirm replay rules before publishing.

## Build the first usable vertical slice

1. Use Unit 1 only.
2. Add the five example Unit 1 quests from the sample catalog.
3. Show XP and token rewards on each card.
4. Write rewards through `awardQuestCompletion()`.
5. Show Unit 1 badge progress.
6. Add five low-cost test items to the store.
7. Test duplicate completion prevention, manual teacher awards, and token spending.

## Validation tests

- [ ] Completing a quest once adds XP, tokens, history, and badge metrics.
- [ ] Completing the same first-completion-only quest again gives no duplicate reward.
- [ ] Spending tokens cannot reduce XP.
- [ ] A later lower assessment score cannot remove a badge tier.
- [ ] A Unit Master Seal unlocks only after the required number of unique Unit badges.
- [ ] Level 20 remains locked until the Unit 9 Master Seal requirement is satisfied.
- [ ] No UI text says “Mastery” for a raw grade alone; badge descriptions explain the evidence.
