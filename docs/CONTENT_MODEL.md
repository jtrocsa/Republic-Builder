# Republic Builder Content Model

## Purpose

The visual layout is designed so that classroom content eventually lives as structured data rather than hard-coded HTML. Right now, `data.js` is the temporary content source. It is safe to edit for a prototype, but a later version should store this content in a database or a teacher-friendly authoring tool.

## Quest fields

Each quest in `data.js` follows this pattern:

```js
{
  id: 'common-sense',
  category: 'Primary Source Battle',
  group: 'source',
  image: 'assets/quest-common-sense.svg',
  title: 'Common Sense',
  description: 'Short student-facing mission description.',
  prompt: 'A question or classroom task.',
  answers: ['Option A', 'Option B', 'Option C', 'Option D'],
  correctAnswer: 1,
  explanation: 'Feedback shown after a response.',
  rewards: {
    xp: 125,
    rp: 60,
    pillars: { liberty: 3, power: 1 },
    artifact: 'Paine’s Pamphlet'
  },
  boss: false
}
```

### Suggested categories

| Category | Classroom use |
|---|---|
| Unit Quest | Lesson, reading, activity, or unit milestone |
| Primary Source Battle | Source analysis, sourcing, contextualization, or evidence work |
| HIPP Challenge | Historical situation, intended audience, purpose, and point of view practice |
| Debate Duel | Structured academic controversy, seminar, or evidence-based debate |
| Timeline Mission | Chronology, causation, comparison, or continuity/change task |
| DBQ Boss Fight | DBQ, LEQ, SAQ, or extended evidence-based writing challenge |
| Vocabulary Bounty | Retrieval practice and contextual vocabulary use |

## Pillars

The six pillars are a *game framing device*, not historical grades or moral scores. Use them to signal tensions students should analyze.

| Pillar | Student-facing meaning |
|---|---|
| Liberty | Rights, freedoms, participation, reform |
| Order | Law, legitimacy, stability, political structure |
| Economy | Trade, labor, resources, opportunity |
| Unity | Compromise, cohesion, sectionalism, national identity |
| Justice | Equality, representation, rights, exclusion |
| Power | Government capacity, military power, diplomacy |

### Design guardrail

Avoid treating oppressive historical actions as simple “wins” because they increased a pillar. Use the pillar system to make tradeoffs visible and invite reflection. A quest can change more than one pillar, including a negative change where historically appropriate.

## APUSH map

The starter uses the standard nine-unit APUSH sequence:

1. Period 1 / Unit 1: 1491–1607
2. Period 2 / Unit 2: 1607–1754
3. Period 3 / Unit 3: 1754–1800
4. Period 4 / Unit 4: 1800–1848
5. Period 5 / Unit 5: 1844–1877
6. Period 6 / Unit 6: 1865–1898
7. Period 7 / Unit 7: 1890–1945
8. Period 8 / Unit 8: 1945–1980
9. Period 9 / Unit 9: 1980–Present

## Recommended content workflow

1. Create a teacher content document for each unit.
2. Identify 4–8 core quests, 1–2 primary-source battles, 1 HIPP challenge, one retrieval practice activity, and one culminating writing battle.
3. Write the historical skill and standard before writing rewards.
4. Use concise student language on quest cards; put background context and directions inside the quest detail screen.
5. Review factual claims and source excerpts before publishing them to students.
6. Test each quest with a small student group before making points or outcomes permanent.

## Future data additions

A fuller quest object will likely need:

- `unitId`
- `skillTags` such as sourcing, contextualization, evidence, argumentation, causation, comparison, or CCOT
- `sourceCitation`
- `difficulty`
- `estimatedMinutes`
- `dueDate`
- `teacherNotes`
- `submissionType`
- `rubric`
- `prerequisiteQuestIds`
- `branchingOutcomes`
- `accessibleAlternative`
