# Progress Saving and Future Accounts

## What works now

The starter uses `localStorage` through `storage.js`.

This means a founder profile, outfit, traits, XP, Republic Points, quest completion, inventory, and unlocked units persist when the same student returns to the **same browser on the same device**.

It is useful for:

- prototyping the game
- testing the character creator
- individual classroom devices that are not shared
- GitHub Pages demos

It does **not** support:

- multiple devices for the same student
- secure passwords
- class rosters
- teacher dashboards
- reliable recovery after browser data is cleared
- FERPA/COPPA-sensitive student records

## The adapter boundary

`app.js` does not call `localStorage` directly. It calls this interface from `storage.js`:

```js
window.RepublicBuilderStorage = {
  load(key) {},
  save(key, value) {},
  clear(key) {}
};
```

That is deliberate. Later, the implementation can be replaced with a school-approved remote save system without rewriting the character creator, quests, DBQ engine, or dashboard.

## Saved state

The current key is:

```txt
republic-builder-state-v2
```

The saved object includes a `schemaVersion`, character profile, game progress, and inventory. It should not contain passwords, full student names, emails, grades, IEP/504 information, or any sensitive student data.

## Low-cost roadmap

### Stage 1 — static GitHub Pages

Keep the current local save system. Use it for design, testing, and gameplay demonstrations.

### Stage 2 — classroom codes and teacher review

Add a small server-side layer only when students must use multiple devices or when the teacher needs to see submissions. The system should create a student record only after a student joins a class with a teacher-generated code.

### Stage 3 — school-approved sign-in

Use the school’s approved identity process, ideally through existing Google Workspace or another district-approved solution. Do not invent a password system in front-end JavaScript.

### Stage 4 — cloud progress and submissions

Move `load()` and `save()` to authenticated requests. The data model should separate:

- account identity
- class enrollment
- game profile/progress
- teacher-authored content
- writing submissions and rubric feedback

## Recommended data separation later

```txt
users
  id, display_name, role

classes
  id, teacher_id, title, period, join_code_hash

enrollments
  class_id, user_id

characters
  user_id, town, profession, traits, outfit

progress
  user_id, class_id, xp, rp, unlocked_unit, inventory

submissions
  user_id, quest_id, response, status, rubric_feedback
```

The game itself should never need a student’s legal name. A display name, nickname, or school-provided identifier is enough for normal play.

## Privacy and classroom safeguards

- Keep game progress separate from official grades until you intentionally decide how they connect.
- Let the teacher control who can see a leaderboard; default to private or pseudonymous display names.
- Do not let students publicly read one another’s writing submissions by default.
- Treat AI-generated writing feedback as coaching, not a final grade.
- Require teacher review for high-stakes writing scores and for any data that may be reported to students or families.

## Migration note

Because all save calls are isolated in `storage.js`, the eventual remote adapter can preserve the same state shape. Start by moving only `characters` and `progress`; add DBQ submissions once the writing workflow is stable.
