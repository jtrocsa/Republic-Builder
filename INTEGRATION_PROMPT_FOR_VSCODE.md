# VS Code AI — Integration Directive

You are integrating the Teacher Backend Infrastructure package into an existing vanilla JavaScript APUSH RPG website called **Republic Builder / Atlantic Crossroads**.

## Required first action

Inspect the current project tree and identify:

- the existing student shell/navigation
- the Atlas Map component
- current Unit 1 quest data and rendering code
- the SAQ / LEQ / DBQ / HIPP / boss-battle modal or page components
- current CSS variables, typography, colors, and responsive conventions
- the existing bottom-left Teacher Mode button

Do not replace existing screens with a generic admin template. Reuse the current visual language and existing quest components.

## Project goal

Add a secure teacher dashboard and a dynamic content/data layer while preserving the current student experience.

Teacher Mode must allow:

1. editing live quest content and response-box configuration in the existing visual style;
2. viewing, filtering, opening, grading, returning, and reopening student submissions in the same quest/boss-battle screen students used;
3. locking/unlocking quests individually, in bulk, by class, by student, by schedule, and by prerequisite;
4. advancing the active class to the next unit without losing prior data;
5. managing rosters, student access, XP, historian skills, feedback, announcements, and exports.

## Required integration principles

- Preserve all current student-facing features and styling.
- Use ES modules and plain JavaScript unless the existing project already uses another framework.
- Do not introduce React, Next.js, Tailwind, or a build tool unless the project already depends on it.
- Add database calls only through `dataService`.
- Keep mock mode functional when Supabase credentials are absent.
- Do not hard-code teacher status, student identities, unit state, quest prompts, or answers in UI files.
- Use the exact current student quest component to render teacher grading mode. Do not duplicate the quest markup.
- Content must be versioned. Student assignments reference a specific `quest_version_id`.
- Respect access mode before loading source text, documents, rubrics, prompts, or response fields.

## Folder mapping

Copy/adapt files from this package as follows:

```text
frontend/config/quest-backend.config.example.js
  -> src/js/config/quest-backend.config.js (or the project equivalent)

frontend/services/*.js
  -> src/js/services/

frontend/utils/*.js
  -> src/js/utils/

frontend/styles/teacher-dashboard-contract.css
  -> merge into the existing main stylesheet or import after the existing theme

database/*.sql
  -> keep under /supabase or /database in the repository

docs/*.md
  -> keep under /docs/teacher-backend/
```

Adapt paths to the existing project, but do not rename current quest files just to match this package.

## Implementation phases

### Phase 1 — Service boundary and mock mode

- Add `dataService.contract.js`, `mockDataService.js`, `supabaseDataService.js`, `serviceFactory.js`, `accessRules.js`, and `contentModel.js`.
- Start in mock mode when configuration is missing.
- Refactor existing hard-coded Unit 1 quest objects behind a single `dataService.getStudentQuestFeed()` and `dataService.getQuestContent()` flow.
- Confirm the existing student map and the Empire’s Reckoning SAQ still render correctly.

### Phase 2 — Secure backend

- Create a Supabase project and apply SQL files in the numbered order.
- Configure client initialization with the project URL and anon key.
- Keep RLS enabled.
- Provide a first-teacher setup note in the README. Do not leave a back door that makes any signed-in user a teacher.

### Phase 3 — Teacher shell

- Make the current Teacher Mode button open authentication for logged-out users and the Teacher Dashboard for verified teachers.
- Add teacher-only navigation: Command Center, Quest Studio, Submission Archive, Unit Control, Roster, Analytics, Announcements, Settings.
- Match current fonts, card design, dark navy side navigation, parchment panels, gold details, and historical/RPG tone.

### Phase 4 — Quest Studio

- Add inline pencil controls only in teacher mode.
- Let teachers edit title, XP, location, source metadata/excerpts, prompt, individual question parts, response-box placeholders, hints, rubric data, rewards, and access rules.
- Save as draft. Publish creates a new version. Preview renders exactly like the student view.
- Add duplicate, archive, restore prior version, and autosave with clear status.

### Phase 5 — Submission Archive and grading

- Build filters by class, student, unit, quest, assessment type, status, score status, and date.
- Show student display name, ID, avatar, class, quest, version, submit time, and score.
- Clicking a row opens the existing quest/boss-battle renderer in `teacherGrading` mode with responses populated.
- Use the saved `quest_version_id` — never the current live version — during grading.
- For SAQ, include A/B/C point toggles, feedback for each part, and a total out of 3.
- Include Save Draft, Return to Student, Request Revision, Reopen, and Export/Print actions.

### Phase 6 — Locks, releases, and unit advancement

- Add Visible Lock, Hidden Lock, Scheduled, Available, Review Only, and Archived quest states.
- Support class-level rules, individual student overrides, prerequisites, immediate and scheduled releases, and bulk actions.
- Locked quests can appear muted on the map, with a lock icon and non-spoiler reason. Hidden quests do not render at all.
- Add a Unit Command Board with Draft, Upcoming, Active, Review Only, and Archived unit states.
- Advancing a unit must warn about outstanding ungraded submissions and unfinished work, then let the teacher choose whether prior content is review-only or locked.

### Phase 7 — Verification

Run every scenario in `docs/07_acceptance_tests.md`. Fix all failures before declaring complete.

## Do not do these things

- Do not make a simple “teacherMode = true” toggle.
- Do not expose all quest data to students then hide it only with CSS.
- Do not alter old student submissions after changing a prompt.
- Do not replace the styled quest experience with a generic HTML form in grading mode.
- Do not require a paid database service beyond the selected free/low-cost Supabase plan.
- Do not delete teachers’ content when a unit is archived.
