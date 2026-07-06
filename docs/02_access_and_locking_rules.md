# 02 — Quest Access, Locks, Releases, and Overrides

## Goal

Teachers need fine-grained control without forcing students to see assessment content early.

## Access resolution order

When resolving a student’s access to a quest, use this precedence:

1. Quest is `draft` or `archived` → teacher only.
2. Student-specific override, if active.
3. Matching class-level rule, if active.
4. Unit state/default rule.
5. Prerequisite evaluation.
6. Scheduled release / close time.
7. Default quest mode.

A more specific student override beats a class rule. A class rule beats the course default.

## Visible vs hidden locks

| State | Map/card shown? | Prompt/source/rubric shown? | Student can submit? |
|---|---:|---:|---:|
| hidden | no | no | no |
| visible_locked | yes | no | no |
| scheduled (pre-release) | teacher choice | no | no |
| available | yes | yes | yes |
| review_only | yes | yes | no, unless reopened |
| archived | no | no | no |

## Student-facing copy examples

Use short, non-spoiler copy:

- `Locked — Complete Virginia Evidence Royale first.`
- `Unlocks Friday at 3:00 PM.`
- `Available after Unit 1 is activated.`
- `Review only — your submitted attempt has already been graded.`
- `This quest has been assigned only to another expedition group.`

Do not reveal the primary source, questions, prompt, full rubric, or answer-box text in a locked preview unless a teacher separately enables that behavior.

## Required teacher controls

- Lock/unlock one quest.
- Lock/unlock one assessment tab inside a boss battle.
- Lock/unlock all quests in a map location.
- Lock/unlock all quests in one unit.
- Bulk lock boss battles while leaving practice quests available.
- Schedule a release/close date.
- Set a visible or hidden pre-release state.
- Release to selected class periods.
- Release to selected students only.
- Add a prerequisite quest.
- Give individual accommodations/make-up access.
- Change completed work to review only.
- Reopen a completed quest for resubmission.

## Assignment version freeze

Once a student can open an assessment, call `ensureStudentQuestAssignment(questId)`. It creates an assignment carrying the then-published `quest_version_id`. A subsequent teacher publish changes the live version for new assignments, but existing assigned students continue seeing and being graded against their original version unless the teacher deliberately reassigns them.

## Teacher warnings

Show confirmation warnings before:

- locking a quest with students currently in progress;
- publishing a new version while assignments exist;
- advancing a unit with ungraded submissions;
- setting a close time that blocks requested accommodations.
