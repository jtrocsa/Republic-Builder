# 03 — Teacher Dashboard Specification

## Visual rule

Teacher Mode must look like a command extension of Atlantic Crossroads, not a separate corporate admin product.

- Preserve the deep navy left rail, parchment/cream surfaces, gold accents, muted teal map palette, historical serif headlines, and rounded card system.
- Reuse the current student shell where appropriate.
- Add teacher-only tools through panels, drawers, badges, and contextual pencil controls.
- Avoid generic blue dashboards, square tables, or unrelated icon sets.

## Navigation

```text
Teacher Command Center
Quest Studio
Submission Archive
Unit Command Board
Roster & Classes
Historian Analytics
Announcements
Settings & Export
Return to Student View
```

## Command Center

Show:

- active unit and its access state
- classes taught
- ungraded submissions count
- submissions due/recently submitted
- quests locked / scheduled / available
- student progress snapshot
- quick actions: Create Quest, Unlock Quest, Grade Next, Advance Unit, Send Notice

## Quest Studio

### List view

- group by unit and map location
- state badges: Draft, Hidden, Locked, Scheduled, Available, Review Only, Archived
- sort/filter by unit, type, status, and release time
- quick actions: edit, preview, duplicate, publish, lock/unlock, schedule, archive

### Editor view

Editable with in-place pencil affordances:

- title/subtitle
- quest type and XP
- map marker/location details
- opening description and reward
- primary-source cards, excerpts, attributions, images, alt text
- assessment instructions
- SAQ A/B/C prompts and answer settings
- LEQ/DBQ prompt/rubric/document panels
- hints, supports, vocabulary, resource links
- access rules, release schedule, prerequisites

Controls:

- Save draft
- Publish new version
- Preview as student
- Restore a previous version
- Duplicate
- Archive

## Submission Archive

### Filters

- class/period
- student
- unit
- quest/location
- assessment type
- status
- submit date
- score state

### Row/card fields

- student avatar, display name, student ID
- class period
- quest title and assessment type
- assigned version number
- submission timestamp
- score / maximum score
- status
- feedback/revision indicator

### Grading view

Open the exact existing student quest interface in `teacherGrading` mode.

Add teacher panels for:

- score controls and criterion explanation
- quick feedback bank
- per-question feedback
- overall feedback
- Save draft
- Return to student
- Request revision
- Reopen
- Print/export

For SAQ, use 1 point each for Parts A, B, and C. Keep Part A/B/C rubric text tied to the assignment version.

## Unit Command Board

- represent every unit by state: Draft, Upcoming, Active, Review Only, Archived
- activate/advance a unit immediately or on a schedule
- choose impacted class periods/students
- decide whether the prior unit becomes review-only, remains open, or locks
- warn about ungraded submissions and incomplete work
- optionally create an in-game announcement

## Roster & classes

- class creation and join code
- manual student add, CSV import, student self-join
- student detail drawer with work, scores, XP, skills, access overrides, and view-as-student
- never show student data to another student

## Historian Analytics

- quest completion rates
- submissions awaiting grading
- median score by quest/rubric category
- historian skills by student and class
- common missed SAQ/LEQ/DBQ categories
- CSV exports
