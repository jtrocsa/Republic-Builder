# Character Forge QA Checklist

Use this before publishing to students.

## Required functional checks

- [ ] The page loads through a local server without console errors.
- [ ] Name input updates the founder name in the current panel.
- [ ] Pronouns save and appear in Review.
- [ ] Hometown saves and appears in Review.
- [ ] Every appearance selector highlights the active choice.
- [ ] Changing hair, skin tone, and eye color visibly changes the avatar.
- [ ] Every clothing choice highlights the active option.
- [ ] Changing hat visibly changes or removes the hat.
- [ ] Changing shirt changes the shirt color/collar.
- [ ] Removing the vest visibly removes the vest layer.
- [ ] Changing pants visibly changes the lower-garment style/color.
- [ ] Changing boots visibly changes the footwear style/color.
- [ ] Selecting every profession highlights only one card.
- [ ] The selected profession appears in its detail panel and in Review.
- [ ] Selecting every Founder Path highlights only one path.
- [ ] The selected Founder Path appears in its detail panel and in Review.
- [ ] The app blocks Next when Profession is blank.
- [ ] The app blocks Next when Founder Path is blank.
- [ ] The app blocks Next when the two Historian Skills are incomplete.
- [ ] The app prevents the same skill from being both Primary and Secondary.
- [ ] The Primary Skill displays 7/20.
- [ ] The Secondary Skill displays 7/20.
- [ ] The other four skills display 5/20.
- [ ] Refreshing the page preserves the founder locally.
- [ ] Start Over clears the saved founder after confirmation.
- [ ] Download founder profile produces a JSON file with the selected profession, path, and skills.

## Accessibility checks

- [ ] Every action can be reached with the keyboard.
- [ ] A focused form control remains visually obvious.
- [ ] Selection cards expose `aria-pressed` appropriately.
- [ ] The Skip link works from a keyboard.
- [ ] Color is not the only indication of selection; the active state also uses border/background/checkmark changes.
- [ ] Text remains readable at 200% browser zoom.
- [ ] The site works on a narrow phone-sized viewport.

## Instructional checks

- [ ] No path or profession description promises a scoring advantage.
- [ ] Skill values are not displayed as grades or percentages.
- [ ] Any XP reward later added is tied to a specific demonstrated skill.
- [ ] Graded assessments use the same questions, criteria, time rules, and rubric regardless of player path or level.
- [ ] Optional tools unlocked in practice are equivalent in rigor and accessible to all learners through reasonable alternatives.
