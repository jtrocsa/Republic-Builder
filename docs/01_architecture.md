# 01 — Architecture

## Design decision

Keep the existing website as a static front end and add a backend only where multi-user persistence and access control are necessary.

```text
Existing student UI
     │
     ▼
Quest renderer / map renderer / grading renderer
     │
     ▼
dataService (single application boundary)
     ├── MockDataService (localStorage, development/demo)
     └── SupabaseDataService (Auth + Postgres + Storage)
             │
             ▼
       Row Level Security + RPC functions
```

The UI must not query tables directly. Every screen asks `dataService` for data. That makes the current static quest content easy to migrate first and lets a future database change remain localized.

## Why versioned content is required

A live editor is unsafe without snapshots. A student may answer an SAQ at 10:00 AM, while the teacher revises the wording at noon. The student’s `student_quest_assignment` therefore stores the precise `quest_version_id` supplied when that student received/opened the assessment. Grading reads that version, not the newest published version.

## Roles

| Role | May do |
|---|---|
| Teacher | Own courses/classes, edit content, release work, view/grade submissions, manage roster, view analytics, export data. |
| Student | View only accessible quest shell/content, submit own work, view own feedback/progress. |

Use Supabase Auth for identity. The `profiles.role` value is an authorization fact protected by RLS, not a browser preference.

## Content hierarchy

```text
Course
  └── Unit
        └── Quest
              ├── Published quest version(s)
              ├── Draft quest version(s)
              ├── Class access rules
              ├── Prerequisites
              └── Student assignments / submissions
```

## State model

### Unit state

- `draft`: teacher only
- `upcoming`: visible in teacher planning only
- `active`: current instructional unit
- `review_only`: students may review permitted content
- `archived`: not part of normal student navigation, retained for data

### Quest access mode

- `draft`: teacher only
- `hidden`: not rendered for students
- `visible_locked`: map marker/card can appear, but content remains private
- `scheduled`: visible/hidden according to rule until release time
- `available`: students can open and submit
- `review_only`: students can revisit content but cannot submit a new attempt unless explicitly reopened
- `archived`: retained but excluded from normal play

### Student assignment state

- `not_started`
- `in_progress`
- `submitted`
- `grading`
- `returned`
- `revision_requested`
- `graded`
- `completed`

## Dynamic rendering contract

A quest renderer must accept:

```js
renderQuest({
  quest,
  version,
  assignment,
  submission,
  viewerMode: 'student' | 'teacherPreview' | 'teacherGrading',
  permissions,
});
```

The same renderer must handle student work and teacher grading. `viewerMode` changes tools around the screen, not the underlying prompt layout.

## Hosting

- Front end: existing GitHub Pages/static host.
- Auth/database: Supabase.
- Files/images: existing local assets when public; Supabase Storage only for teacher-uploaded private content or student artifacts.

Never put service-role credentials in the front end.
