# 04 — Submission and Grading Rules

## Submission lifecycle

```text
not_started → in_progress → submitted → grading → graded → completed
                                  │              │
                                  └→ revision_requested → returned → submitted
```

## Save behavior

- Student draft answers autosave while a quest is available.
- Submitting captures `submitted_at` and changes state to `submitted`.
- Teachers can score in draft without making feedback visible.
- `Return to Student` makes selected feedback/scores visible.
- `Request Revision` reopens only the allowed response fields and preserves the original submission history.
- `Reopen Submission` is an explicit teacher action; do not silently allow students to overwrite graded work.

## Immutable assessment context

A submission must store or resolve:

- `quest_id`
- `quest_version_id`
- `assignment_id`
- student and class
- response JSON
- submission snapshot timestamp

The grading screen must retrieve prompt/source/rubric content through `quest_version_id`.

## SAQ scoring model

Each part is independently scored:

```json
{
  "part-a": { "maxPoints": 1, "pointsEarned": 1, "feedback": "..." },
  "part-b": { "maxPoints": 1, "pointsEarned": 0, "feedback": "..." },
  "part-c": { "maxPoints": 1, "pointsEarned": 1, "feedback": "..." }
}
```

The UI should calculate a total out of 3 but allow the teacher to save before all parts are scored.

## Feedback bank

Provide a teacher-managed feedback bank grouped by category:

- Relevance
- Historical evidence
- Description vs. isolated term
- Explanation/how-why reasoning
- Sourcing/HIPP
- Claim and reasoning
- Document use
- Revision request

Feedback can be inserted into any comment field and then edited.

## Student privacy

- A student can read only their own assignments, drafts, submissions, scores, and feedback.
- A teacher can read submissions only for classes they teach.
- Student names/IDs must not be embedded in public static JSON, URL paths, or downloadable source files.
