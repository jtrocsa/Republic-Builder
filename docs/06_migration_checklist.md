# 06 — Migration Checklist

## Before coding

- [ ] Back up the current repository.
- [ ] Identify current static Unit 1 quest data.
- [ ] Identify the existing quest modal/page renderer.
- [ ] Identify CSS tokens and typography used by existing map and boss-battle screens.
- [ ] Confirm whether the project uses ES modules or global scripts.

## Database

- [ ] Create Supabase project.
- [ ] Apply schema, security, functions, then optional demo seed SQL.
- [ ] Enable email/password or preferred school-safe login method in Supabase Auth.
- [ ] Create first teacher profile manually in SQL after creating the authenticated user.
- [ ] Confirm RLS remains enabled.

## Static site integration

- [ ] Add configuration file without committing production credentials in a public repo.
- [ ] Add service factory and default to mock mode without configuration.
- [ ] Convert one existing Unit 1 quest to the content schema.
- [ ] Render that quest through `dataService`.
- [ ] Confirm no regression to the Atlas Map and SAQ UI.
- [ ] Convert remaining Unit 1 quests.

## Teacher tools

- [ ] Authenticate Teacher Mode.
- [ ] Build Command Center.
- [ ] Build Quest Studio with draft/publish/version controls.
- [ ] Build Submission Archive and same-screen grading.
- [ ] Add class/student locks and schedules.
- [ ] Add Unit Command Board.
- [ ] Add roster and view-as-student.
- [ ] Add analytics/exports.

## Launch checks

- [ ] Run acceptance tests.
- [ ] Test on a student account, not only teacher account.
- [ ] Test locked and hidden quests from direct URL attempts.
- [ ] Test editing a prompt after a student has submitted.
- [ ] Test mobile/desktop enough for classroom use.
- [ ] Create backup/export procedure.
