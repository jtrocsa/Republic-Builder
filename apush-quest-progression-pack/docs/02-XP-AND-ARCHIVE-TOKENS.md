# Historian XP and Archive Tokens

## Why there are two systems

XP answers: **How far have I progressed through the year?**

Archive Tokens answer: **What can I choose to buy?**

They should never be the same balance. Spending a cosmetic should not make a student lose a level, and gaining a level should not create store inflation.

## Historian XP

Historian XP is permanent. It only moves upward.

### Awarding principles

- Use XP for completion, persistence, revision, and meaningful evidence of learning.
- Give a predictable baseline for required work.
- Let difficult or longer tasks award more XP, but do not create extreme gaps.
- Prefer extra XP for completing a revision loop over raw speed.
- Never take XP away for behavior, a late submission, or a later lower score.

### Recommended XP bands

- 10 XP: brief check-in, exit ticket, or mini review.
- 20 XP: short practice activity.
- 30 XP: standard core quest.
- 45 XP: extended task, multi-source challenge, or collaborative mission.
- 60 XP: major writing task or formal Boss Battle.
- 35 XP: meaningful revision with student reflection.

## Archive Tokens

Archive Tokens are a small, visible currency represented by a coin/seal icon. They can be spent only in the store.

### Token guardrails

- Most quests should award **1–3 tokens**.
- Major tasks should award **4–6 tokens**.
- Badge rewards should be memorable but modest: 5 / 8 / 12 for Bronze / Silver / Gold.
- Avoid token multipliers, streak multipliers, random loot boxes, and student-to-student trading in the first version.
- Keep the most expensive standard item at 99 tokens or below.

### What Tokens can buy

Safe purchases include avatar cosmetics, profile frames, journal skins, room decorations, town scene cosmetics, title colors, badges-case display styles, optional ungraded practice replays, and optional organizers.

Unsafe purchases include extra grading points, answer hints on graded work, extensions on assessments, rubric exemptions, extra test time, or access to hidden assessment answers.

## Transaction history

Every token change must write an immutable transaction record:

```json
{
  "id": "txn_2026_09_12_001",
  "type": "earn",
  "amount": 3,
  "reason": "Completed MCQ Challenge: Columbian Exchange",
  "sourceType": "quest",
  "sourceId": "u1-columbian-exchange-mcq",
  "createdAt": "2026-09-12T21:15:00.000Z"
}
```

Use `type: "spend"`, `"teacher_award"`, `"refund"`, or `"migration"` as appropriate. The ledger is essential for teacher corrections and future backend migration.
