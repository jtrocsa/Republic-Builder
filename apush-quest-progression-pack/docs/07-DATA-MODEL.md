# Data Model and Storage Contract

## Why this is structured this way

The site can begin on static hosting with browser storage. Every read and write should still pass through the progression engine, which makes later migration to a database a storage change instead of a game rewrite.

## Required entities

```text
progressionConfig
badgeDefinitions
questDefinitions
storeItems
studentProgress
transactions
```

## Student progress shape

```json
{
  "schemaVersion": 1,
  "studentId": "demo-student",
  "totalXp": 355,
  "archiveTokens": 18,
  "completedQuestIds": ["u1-atlantic-world-map"],
  "questCompletions": [],
  "assessmentResults": [],
  "badgeProgress": {
    "mcq-mastery": {
      "tier": "bronze",
      "metrics": { "qualifyingSets": 1, "bestPercent": 75 },
      "awardedTiers": ["bronze"]
    }
  },
  "earnedBadgeIds": ["u1-atlantic-cartographer"],
  "inventoryItemIds": [],
  "equipped": {},
  "transactions": [],
  "updatedAt": "2026-09-12T21:15:00.000Z"
}
```

## Quest definition shape

```json
{
  "id": "u1-columbian-exchange-mcq",
  "unitId": "unit-1",
  "activityType": "MCQ Challenge",
  "mode": "core",
  "title": "Columbian Exchange",
  "estimatedMinutes": 10,
  "xpReward": 30,
  "tokenReward": 3,
  "replayRewardPolicy": "first_completion_only",
  "badgeLinks": [
    { "badgeId": "mcq-mastery", "metric": "qualifyingSets", "amount": 1 },
    { "badgeId": "u1-exchange-investigator", "metric": "completion", "amount": 1 }
  ]
}
```

## Assessment result shape

```json
{
  "id": "result_u1_saq_01",
  "questId": "u1-saq-contact",
  "assessmentType": "SAQ",
  "earnedPoints": 2,
  "possiblePoints": 3,
  "percent": 66.67,
  "unitId": "unit-1",
  "submittedAt": "2026-09-12T21:15:00.000Z",
  "isRevision": false
}
```

## Badge definition shape

Tiered badges need an ID, asset path, human-readable criteria, and machine-readable thresholds. Unit badges need stable prerequisite IDs.

The supplied `js/quest-badge-data.js` is the source-of-truth starter catalog. The JSON example files are easy to import/export; choose one source of truth in production to prevent version drift.

## Storage adapter contract

A future backend adapter only needs these methods:

```js
getStudentProgress(studentId)
saveStudentProgress(studentId, nextProgress)
getConfig()
saveConfig(nextConfig)
```

Do not call `localStorage` directly from quest cards, badges, or store UI. Call a small repository/service layer that invokes the engine and then the storage adapter.
