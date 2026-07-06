/**
 * DOM hooks only. Keep actual visual markup in the existing app components.
 * These helpers let legacy/static quest screens opt into teacher tools gradually.
 */

export function applyTeacherEditableState(root, { isTeacher, onEdit }) {
  if (!root) return;
  root.querySelectorAll('[data-teacher-editable]').forEach((element) => {
    const field = element.dataset.teacherEditable;
    element.toggleAttribute('data-teacher-mode', Boolean(isTeacher));
    const existing = element.querySelector(':scope > .quest-teacher-edit-trigger');
    if (!isTeacher && existing) existing.remove();
    if (!isTeacher || existing) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quest-teacher-edit-trigger';
    button.setAttribute('aria-label', `Edit ${field}`);
    button.textContent = '✎';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onEdit?.({ field, element });
    });
    element.append(button);
  });
}

export function setQuestViewerMode(root, mode) {
  if (!root) return;
  root.dataset.questViewerMode = mode;
}

export function mountTeacherGradingPanel({ container, submission, rubricScores, onSave, onReturn, onRevisionRequest }) {
  if (!container) return;
  container.replaceChildren();
  const panel = document.createElement('aside');
  panel.className = 'quest-teacher-grading-panel';
  panel.innerHTML = `
    <div class="quest-teacher-panel-kicker">TEACHER GRADING</div>
    <h2>${submission?.student?.display_name ?? submission?.student?.displayName ?? 'Student submission'}</h2>
    <div class="quest-teacher-score-summary">${submission?.score ?? 0} / ${submission?.max_score ?? submission?.maxScore ?? '—'} pts</div>
    <div class="quest-teacher-rubric-slot"></div>
    <label class="quest-teacher-feedback-label">Overall feedback
      <textarea class="quest-teacher-overall-feedback" rows="6">${submission?.overall_feedback ?? submission?.overallFeedback ?? ''}</textarea>
    </label>
    <div class="quest-teacher-panel-actions">
      <button type="button" data-action="save">Save grading draft</button>
      <button type="button" data-action="return">Return to student</button>
      <button type="button" data-action="revision">Request revision</button>
    </div>
  `;
  container.append(panel);
  panel.querySelector('[data-action="save"]')?.addEventListener('click', () => onSave?.());
  panel.querySelector('[data-action="return"]')?.addEventListener('click', () => onReturn?.());
  panel.querySelector('[data-action="revision"]')?.addEventListener('click', () => onRevisionRequest?.());
  return panel;
}
