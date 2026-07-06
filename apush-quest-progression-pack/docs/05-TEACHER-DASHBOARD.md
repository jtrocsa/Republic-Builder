# Teacher Dashboard Requirements

## Design principle

The dashboard should make it easy to adjust the economy and pacing without requiring a teacher to edit code. It should show the projected effect of each change before it is saved.

## A. Progression Settings page

### Required controls

1. **Level scale**
   - Default: 20 levels.
   - Editable cumulative XP threshold for each level.
   - Display a warning if a threshold is lower than the level before it.
   - Display the total XP required for Level 20.

2. **Mastery gate**
   - Toggle on/off.
   - Default: enabled.
   - Default requirement: `unit-9-master-seal`.
   - Student-facing message: “Master Historian is unlocked after the Unit 9 Master Seal.”

3. **Reward presets**
   - Warm-up, Practice, Core Quest, Major Task, Boss Battle, Revision, Optional Review.
   - XP and Token amount fields.
   - Recommended ranges shown beneath each field.

4. **Economy guardrails**
   - Expected tokens per unit.
   - Recommended maximum quest token reward.
   - Recommended store price range.
   - Warning when a teacher’s planned required work would produce excessive token totals.

5. **Unit pacing projection**
   - Per-unit required XP total.
   - Per-unit optional XP total.
   - Estimated level after each unit for a typical student.

### Suggested dashboard table

| Unit | Required XP | Optional XP | Required Tokens | Badge XP | Expected Level | Teacher note |
|---|---:|---:|---:|---:|---:|---|
| Unit 1 | 380 | 145 | 29 | 145 | 5 | Target is healthy |

## B. Quest Editor

Every quest editor should require these fields before publishing:

- Activity Type
- Historical Topic / Title
- Unit
- Mode
- Estimated minutes
- XP reward
- Archive Token reward
- Assessment badge link(s)
- Unit badge link(s), if any
- Grading mode: ungraded / formative / graded external link
- Replay policy

### Validation rules

- XP must be 0–100, with a warning above 60.
- Tokens must be 0–10, with a warning above 6.
- A quest cannot list a Badge name that does not exist in the badge catalog.
- A graded quest cannot use a store item as an answer-affecting requirement.
- A replayable quest requires a `replayRewardPolicy` to prevent accidental farming.

## C. Badge Editor

Teachers can change names, descriptions, rewards, image path, and criteria. The dashboard should show a preview of the progress rules in plain English.

Example preview:

```text
MCQ Mastery Badge — Silver
Awarded after 3 qualifying MCQ sets with scores of 70% or above.
Reward: 60 XP and 8 Archive Tokens.
```

Avoid a visual condition builder in Version 1. Use guided fields for common criteria and reserve advanced JSON editing for an admin/developer area.

## D. Student progress view

Teacher view should show:

- Current level / XP / token balance.
- Current badge tier for each badge.
- Progress toward the next tier.
- Transaction history.
- Quest completion history.
- Manual award/refund controls with a required reason.
- A visible “do not use for grades” reminder.

## E. Export / import

Version 1 should support JSON export and import for:

- Progression configuration.
- Badge definitions.
- Store catalog.
- Individual student progress.
- Whole-class student progress.

This keeps the prototype portable while the project uses local storage or static hosting.
