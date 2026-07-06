# Progression Architecture

## 1. Student loop

```text
Open a unit town
      ↓
Choose a clearly labeled APUSH activity
      ↓
Complete the activity or submit work
      ↓
Receive Historian XP + Archive Tokens
      ↓
Advance visible badge tracker(s)
      ↓
Unlock a badge tier or unit badge when criteria are met
      ↓
Receive a small bonus and optional cosmetic unlock
      ↓
Spend Archive Tokens in the store
```

## 2. The Historian Journey

The overall journey is a 20-level progress bar. It represents sustained engagement with the year, not a grade, class ranking, or aptitude label.

| Level range | Suggested display title |
|---:|---|
| 1–4 | Apprentice Historian |
| 5–8 | Developing Historian |
| 9–12 | Capable Historian |
| 13–16 | Accomplished Historian |
| 17–19 | Senior Historian |
| 20 | Master Historian |

Keep the numeric level visible beside the title. Students should understand the system without decoding lore.

### Default XP curve

| Reach level | Cumulative XP | XP from prior level |
|---:|---:|---:|
| 1 | 0 | — |
| 2 | 75 | 75 |
| 3 | 175 | 100 |
| 4 | 300 | 125 |
| 5 | 450 | 150 |
| 6 | 625 | 175 |
| 7 | 825 | 200 |
| 8 | 1,050 | 225 |
| 9 | 1,300 | 250 |
| 10 | 1,575 | 275 |
| 11 | 1,875 | 300 |
| 12 | 2,200 | 325 |
| 13 | 2,550 | 350 |
| 14 | 2,925 | 375 |
| 15 | 3,325 | 400 |
| 16 | 3,750 | 425 |
| 17 | 4,200 | 450 |
| 18 | 4,675 | 475 |
| 19 | 5,175 | 500 |
| 20 | 5,700 | 525 |

This makes every level meaningful without assigning 100 XP to a small quest. A normal activity should generally award 10–60 XP, and a badge unlock should award 25–80 XP.

## 3. Unit pacing target

The system does not punish students who complete optional activities early. Instead, the Level 20 title uses a Unit 9 gate. XP may bank, but Master Historian stays locked until the Unit 9 Master Seal is earned.

| Unit | Typical cumulative XP target | Typical level after unit |
|---|---:|---:|
| Unit 1 | ~500 | 5 |
| Unit 2 | ~1,050 | 8 |
| Unit 3 | ~1,650 | 10 |
| Unit 4 | ~2,250 | 12 |
| Unit 5 | ~2,900 | 13 |
| Unit 6 | ~3,550 | 15 |
| Unit 7 | ~4,250 | 17 |
| Unit 8 | ~4,950 | 18 |
| Unit 9 | ~5,750 | 20 |

Use this as a planning guardrail, not a hard student cap. The teacher dashboard should warn when planned required activities produce far more or far less than the target.

## 4. Store economy

Archive Tokens are deliberately small-value currency. Store prices stay in single or double digits, and a normal account balance should live in the tens or low hundreds instead of thousands.

### Recommended rewards

| Completion type | XP | Archive Tokens |
|---|---:|---:|
| Warm-up / check-in | 10 | 1 |
| Practice activity | 20 | 2 |
| Core quest | 30 | 3 |
| Major task | 45 | 4 |
| Boss Battle | 60 | 6 |
| Revision task | 35 | 3 |
| Optional review | 15 | 1 |
| Bronze badge | 40 | 5 |
| Silver badge | 60 | 8 |
| Gold badge | 80 | 12 |
| Unit badge | 25 | 3 |
| Unit Master Seal | 60 | 8 |

### Recommended store prices

| Item group | Price band |
|---|---:|
| Small color variation, pin, or accessory | 4–10 |
| Common clothing or profile item | 12–25 |
| Unit-themed cosmetic | 28–45 |
| Rare room, avatar, or banner item | 50–75 |
| Legendary cosmetic | 80–99 |

The default settings produce roughly 350–550 tokens for a student who completes most required and many optional experiences over a full year. That is enough for meaningful choices, not a runaway economy.

## 5. Non-negotiable fairness rules

1. Graded scores must be calculated separately from XP, badges, and store inventory.
2. The student with the highest token balance is not the “best historian.”
3. Cosmetic rewards cannot reveal correct answers, remove graded requirements, increase test time, or provide a rubric advantage.
4. Revision and persistence can earn XP and badge progress even when a student’s final score remains modest.
5. Teacher-awarded rewards must be logged with a reason so corrections are transparent.

## 6. Persistence strategy

Start with `localStorage` during prototype development. The data model in `docs/07-DATA-MODEL.md` keeps all mutation through the `quest-progression-engine.js` functions so a future Firebase, Supabase, or school-approved backend can replace the storage layer without rewriting quest or badge logic.
