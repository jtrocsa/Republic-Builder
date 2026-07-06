# 07 — Acceptance Tests

## Roles and security

- [ ] A signed-out visitor cannot open Teacher Dashboard routes.
- [ ] A student cannot reveal teacher controls by editing localStorage, URL query strings, or DOM classes.
- [ ] A student cannot fetch a hidden/locked source/prompt through a direct request.
- [ ] A teacher sees only their own classes/submissions.

## Editing and versions

- [ ] Teacher edits a draft title and prompt, previews it, and publishes.
- [ ] A new student receives the new published version.
- [ ] A student who already opened the old version retains that original version.
- [ ] Teacher can restore a previous version without deleting history.
- [ ] Existing submission grading shows the correct historical prompt/rubric.

## Access controls

- [ ] Hidden quest does not show on student map.
- [ ] Visible Locked quest shows only title/reason, not source content.
- [ ] Scheduled quest unlocks at the intended time.
- [ ] Prerequisite unlock works after the required quest is completed.
- [ ] Individual override gives one student access without unlocking it for classmates.
- [ ] Review-only quest opens but blocks new submission.
- [ ] Teacher can bulk lock/unlock a unit/location/type.

## Submission and grading

- [ ] Student answer autosaves.
- [ ] Student submits SAQ and teacher sees it in Submission Archive.
- [ ] Teacher filters by class, quest, and ungraded status.
- [ ] Teacher opening a submission sees the familiar student quest screen and populated answers.
- [ ] SAQ Part A/B/C point controls total correctly to 3.
- [ ] Teacher feedback remains invisible until Return to Student.
- [ ] Request Revision reopens only intended fields and preserves prior submission data.
- [ ] Graded work can be reopened deliberately by a teacher.

## Unit advancement

- [ ] Teacher sees outstanding work warning before advancing.
- [ ] Unit can be scheduled or activated immediately.
- [ ] Teacher selects whether previous unit is open, review only, or locked.
- [ ] Student navigation updates after unit release.

## Resilience

- [ ] Mock mode still permits a demo without backend credentials.
- [ ] Failed database request shows a clear recoverable error, not a blank screen.
- [ ] No data loss occurs after refresh while saving a draft.
