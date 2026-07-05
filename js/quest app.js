import { UNIT, QUESTS, SOURCES, SKILLS, RUBRICS } from './data.js';
import { loadState, saveState } from './store.js';

let state = loadState();
let activeQuest = null;
let activeBossMode = 'saq';
let royaleIndex = 0;
let royaleScore = 0;
let vocabIndex = 0;
let vocabScore = 0;

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function text(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}

function getQuest(id) {
  return QUESTS.find((quest) => quest.id === id);
}

function setDispatch(title, copy) {
  state.dispatch = { title, copy };
  saveState(state);
  $('#dispatch-title').textContent = title;
  $('#dispatch-copy').textContent = copy;
}

function updateHud() {
  const completedCount = Object.keys(state.completed).length;
  const totalQuestCount = QUESTS.length;
  const percent = Math.round((completedCount / totalQuestCount) * 100);
  $('#quest-progress-label').textContent = `${completedCount} of ${totalQuestCount} quests completed`;
  $('#unit-progress-bar').style.width = `${percent}%`;
  $('#xp-label').textContent = `${state.xp} / 500 XP`;
  $('#xp-bar').style.width = `${Math.min((state.xp / 500) * 100, 100)}%`;
  $('#player-level').textContent = Math.max(1, Math.floor(state.xp / 100) + 1);
  $('#inventory-count').textContent = state.inventory.length;
  $('#source-count-badge').textContent = SOURCES.length;
  $('#archive-header-count').textContent = SOURCES.length;

  const skillList = $('#skill-mini-list');
  skillList.innerHTML = SKILLS.slice(0, 4).map((skill) => {
    const gain = state.skills[skill.id] || 0;
    const value = Math.min(20, skill.value + gain);
    return `<div class="skill-mini"><span>${skill.icon} ${text(skill.label)}</span><b>${value}/20</b></div>`;
  }).join('');

  const toggle = $('#teacher-mode-toggle');
  toggle.classList.toggle('on', state.teacherMode);
  $('span', toggle).textContent = state.teacherMode ? 'on' : 'off';

  if (state.dispatch) {
    $('#dispatch-title').textContent = state.dispatch.title;
    $('#dispatch-copy').textContent = state.dispatch.copy;
  }
}

function renderTopicChips() {
  $('#topic-chips').innerHTML = UNIT.topics.map((topic) => `<span>${text(topic.replace(/^\d\.\d\s/, ''))}</span>`).join('');
}

function renderMap() {
  $('#map-quests').innerHTML = QUESTS.map((quest) => {
    const done = Boolean(state.completed[quest.id]);
    return `
      <button class="map-quest ${quest.mode} ${done ? 'completed' : ''}" data-quest-id="${quest.id}" style="left:${quest.coordinates.left}; top:${quest.coordinates.top};" aria-label="Open ${text(quest.title)}">
        <span class="quest-beacon">${quest.icon}</span>
        <span class="quest-label"><b>${text(quest.shortTitle)}</b><em>${quest.mode === 'hipp' ? 'HIPP Challenge' : quest.mode === 'royale' ? 'Evidence Royale' : quest.mode === 'vocab' ? 'Vocabulary Bounty' : 'Boss Battle'}</em></span>
        ${done ? '<span class="quest-check">✓</span>' : ''}
      </button>`;
  }).join('');
}

function openOverlay() {
  $('#overlay').hidden = false;
  requestAnimationFrame(() => $('#overlay').classList.add('visible'));
}

function closeOverlay() {
  $('#overlay').classList.remove('visible');
  setTimeout(() => { $('#overlay').hidden = true; }, 180);
}

function closeDrawer() {
  const drawer = $('#library-drawer');
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  closeOverlay();
}

function closeModal() {
  const modal = $('#modal-layer');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = '';
  activeQuest = null;
  closeOverlay();
}

function openLibrary() {
  openOverlay();
  const drawer = $('#library-drawer');
  drawer.innerHTML = `
    <header class="drawer-header">
      <div><p class="eyebrow">Historical Library · Unit 1</p><h2>Atlantic Crossroads Field Archive</h2><p>${SOURCES.length} primary-source records used by Unit 1 quests and writing battles.</p></div>
      <button class="close-button" data-close-drawer aria-label="Close archive">×</button>
    </header>
    <div class="archive-toolbar">
      <label>Search the archive <input id="archive-search" placeholder="Columbus, map, labor …" /></label>
      <span>Every record carries a source link, citation, and usage note.</span>
    </div>
    <div id="archive-list" class="archive-list">${renderArchiveEntries(SOURCES)}</div>
    <footer class="archive-footer">Use rights-cleared reproductions or repository links in student-facing deployment. This demo stores citations and source locations, not external scans.</footer>
  `;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  $('#archive-search').focus();
  $('#archive-search').addEventListener('input', (event) => {
    const query = event.target.value.trim().toLowerCase();
    const filtered = SOURCES.filter((item) => `${item.title} ${item.author} ${item.type} ${item.region} ${item.questUse.join(' ')}`.toLowerCase().includes(query));
    $('#archive-list').innerHTML = renderArchiveEntries(filtered);
  });
}

function renderArchiveEntries(items) {
  if (!items.length) return '<p class="empty-note">No source records match that search.</p>';
  return items.map((item) => `
    <article class="source-record">
      <div class="source-meta"><span>${text(item.type)}</span><span>${text(item.date)}</span><span>${text(item.region)}</span></div>
      <h3>${text(item.title)}</h3>
      <p class="source-author">${text(item.author)}</p>
      <p>${text(item.description)}</p>
      <blockquote>${text(item.classroomExcerpt)}</blockquote>
      <div class="source-quest-tags">${item.questUse.map((quest) => `<span>${text(quest)}</span>`).join('')}</div>
      <details><summary>Citation & source access</summary><p>${text(item.citation)}</p><a href="${text(item.sourceUrl)}" target="_blank" rel="noreferrer">Open source repository ↗</a><p class="rights-note">${text(item.rights)}</p></details>
    </article>
  `).join('');
}

function openQuest(questId) {
  activeQuest = getQuest(questId);
  if (!activeQuest) return;
  royaleIndex = 0;
  royaleScore = 0;
  vocabIndex = 0;
  vocabScore = 0;
  activeBossMode = 'saq';
  openOverlay();
  const modal = $('#modal-layer');
  modal.innerHTML = `
    <article class="quest-modal ${activeQuest.mode}">
      <header class="quest-modal-header">
        <div>
          <p class="eyebrow">${text(activeQuest.location)} · ${text(activeQuest.skill)} skill</p>
          <h2><span class="mode-icon ${activeQuest.mode}">${activeQuest.icon}</span>${text(activeQuest.title)}</h2>
          <p>${text(activeQuest.description)}</p>
        </div>
        <div class="quest-header-meta"><span>${activeQuest.xp} XP</span><button class="close-button" data-close-modal aria-label="Close quest">×</button></div>
      </header>
      <div class="quest-modal-body" id="quest-modal-body"></div>
    </article>`;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  renderActiveQuest();
}

function renderActiveQuest() {
  if (!activeQuest) return;
  const body = $('#quest-modal-body');
  if (activeQuest.mode === 'hipp') body.innerHTML = renderHippQuest(activeQuest);
  if (activeQuest.mode === 'royale') body.innerHTML = renderRoyaleQuest(activeQuest);
  if (activeQuest.mode === 'vocab') body.innerHTML = renderVocabQuest(activeQuest);
  if (activeQuest.mode === 'boss') body.innerHTML = renderBossQuest(activeQuest);
  bindQuestEvents();
}

function sourceCard(source) {
  return `
    <aside class="source-card">
      <div class="source-card-top"><span>${text(source.type)}</span><span>${text(source.date)}</span></div>
      <h3>${text(source.title)}</h3>
      <p>${text(source.author)}</p>
      <blockquote>${text(source.classroomExcerpt)}</blockquote>
      <a href="${text(source.sourceUrl)}" target="_blank" rel="noreferrer">Open citation record ↗</a>
    </aside>`;
}

function renderHippQuest(quest) {
  const saved = state.attempts[quest.id]?.response || {};
  return `
    <div class="quest-layout two-column">
      <div>
        <div class="instruction-band"><span>HIPP Challenge</span><p>Use the source and its historical setting. Specific evidence matters more than a generic definition of HIPP.</p></div>
        ${sourceCard(quest.source)}
      </div>
      <form id="hipp-form" class="hipp-form">
        ${Object.entries(quest.prompts).map(([key, prompt]) => `
          <label class="hipp-field">
            <span><b>${key === 'historicalSituation' ? 'H' : key === 'audience' ? 'I' : key === 'purpose' ? 'P' : 'P'}</b><strong>${key === 'historicalSituation' ? 'Historical Situation' : key === 'audience' ? 'Intended Audience' : key === 'purpose' ? 'Purpose' : 'Point of View'}</strong></span>
            <small>${text(prompt)}</small>
            <textarea name="${key}" rows="4" placeholder="Use a source detail and explain why it matters.">${text(saved[key] || '')}</textarea>
          </label>`).join('')}
        <div class="practice-note">Practice scoring: your response is saved locally for teacher review. It earns XP for a complete evidence-based attempt; it does not replace a graded AP score.</div>
        <div class="quest-actions"><button class="primary-button" type="submit">Record HIPP analysis</button><button class="text-button" type="button" data-show-model>Reveal a model analysis</button></div>
        <div id="hipp-feedback" class="quest-feedback" hidden></div>
      </form>
    </div>`;
}

function renderRoyaleQuest(quest) {
  const question = quest.questions[royaleIndex];
  const progress = `${royaleIndex + 1} / ${quest.questions.length}`;
  return `
    <div class="royale-shell">
      <div class="royale-topline"><span>Evidence Royale · Round ${progress}</span><span>${royaleScore} correct</span></div>
      ${question.stimulus ? `<aside class="stimulus-card"><span>Evidence packet</span><blockquote>${text(question.stimulus)}</blockquote></aside>` : ''}
      <h3 class="question-prompt">${text(question.prompt)}</h3>
      <div class="answer-list" id="answer-list">
        ${question.choices.map((choice, index) => `<button class="answer-choice" data-answer-index="${index}"><span>${String.fromCharCode(65 + index)}</span>${text(choice)}</button>`).join('')}
      </div>
      <div id="royale-feedback" class="quest-feedback" hidden></div>
      <div class="royale-footer"><span>APUSH skill: ${text(question.skill)}</span><span>Read → claim → eliminate distractors.</span></div>
    </div>`;
}

function renderVocabQuest(quest) {
  const card = quest.cards[vocabIndex];
  return `
    <div class="vocab-shell">
      <div class="royale-topline"><span>Vocabulary Bounty · ${vocabIndex + 1} / ${quest.cards.length}</span><span>${vocabScore} recovered</span></div>
      <article class="wanted-card">
        <div class="wanted-stamp">WANTED CONCEPT</div>
        <p class="eyebrow">Unit 1 vocabulary</p>
        <h3>${text(card.term)}</h3>
        <p>${text(card.definition)}</p>
        <div class="false-trail"><b>False trail:</b> ${text(card.misconception)}</div>
      </article>
      <h3 class="question-prompt">${text(card.application)}</h3>
      <div class="answer-list" id="answer-list">
        ${card.choices.map((choice, index) => `<button class="answer-choice" data-answer-index="${index}"><span>${String.fromCharCode(65 + index)}</span>${text(choice)}</button>`).join('')}
      </div>
      <div id="vocab-feedback" class="quest-feedback" hidden></div>
    </div>`;
}

function renderBossQuest(quest) {
  const variant = quest.variants[activeBossMode];
  const saved = state.attempts[`${quest.id}-${activeBossMode}`]?.response || {};
  return `
    <div class="boss-shell">
      <div class="boss-tabs">${Object.entries(quest.variants).map(([id, item]) => `<button class="boss-tab ${id === activeBossMode ? 'active' : ''}" data-boss-mode="${id}">${text(item.label)} <span>${RUBRICS[item.rubric].total} pts</span></button>`).join('')}</div>
      <div class="boss-brief">
        <p class="eyebrow">${text(variant.label)} · Official AP rubric</p>
        <h3>${text(variant.prompt)}</h3>
        <p>Use this as an original, AP-style practice task. The prompt and questions in this project are teacher-created—not released College Board questions.</p>
      </div>
      ${activeBossMode === 'dbq' ? renderDbqDocuments(variant.documents) : ''}
      ${activeBossMode === 'leq' ? `<div class="planning-grid">${variant.planningPrompts.map((prompt, index) => `<label><span>Planning move ${index + 1}</span><textarea name="plan-${index}" rows="3" form="boss-form" placeholder="${text(prompt)}">${text(saved[`plan-${index}`] || '')}</textarea></label>`).join('')}</div>` : ''}
      <form id="boss-form" class="boss-form">
        ${activeBossMode === 'saq' ? variant.parts.map((part) => `<label class="saq-field"><span><b>${part.label}</b>${text(part.text)}</span><textarea name="${part.label.toLowerCase()}" rows="5" placeholder="Respond directly, with specific historical evidence.">${text(saved[part.label.toLowerCase()] || '')}</textarea></label>`).join('') : `<label class="writing-field"><span>Your historical argument</span><textarea name="essay" rows="16" placeholder="Write your complete response here. Use the rubric checklist while you draft.">${text(saved.essay || '')}</textarea></label>`}
        <div class="quest-actions"><button type="submit" class="primary-button">Save writing draft</button><button type="button" class="text-button" data-open-rubric="${variant.rubric}">Open ${RUBRICS[variant.rubric].total}-point rubric →</button></div>
      </form>
      ${state.teacherMode ? renderTeacherScorecard(quest.id, activeBossMode, variant.rubric) : `<div class="teacher-gate">Teacher scoring view is off. Turn it on in the left rail to use the rubric point checkboxes in this demo.</div>`}
      <div id="boss-feedback" class="quest-feedback" hidden></div>
    </div>`;
}

function renderDbqDocuments(documents) {
  return `<details class="dbq-documents" open><summary>Open the document packet · 7 documents</summary><div class="dbq-document-grid">${documents.map((doc) => `<article><span>${text(doc.label)}</span><h4>${text(doc.source.title)} (${text(doc.source.date)})</h4><p>${text(doc.source.author)}</p><blockquote>${text(doc.note)}</blockquote><a href="${text(doc.source.sourceUrl)}" target="_blank" rel="noreferrer">Citation record ↗</a></article>`).join('')}</div></details>`;
}

function renderTeacherScorecard(questId, mode, rubricId) {
  const scoreKey = `${questId}-${mode}`;
  const saved = state.attempts[scoreKey]?.teacherScore || {};
  const rubric = RUBRICS[rubricId];
  const total = rubric.criteria.reduce((sum, criterion) => sum + (saved[criterion.id] ? criterion.points : 0), 0);
  return `
    <aside class="teacher-scorecard" data-score-key="${scoreKey}" data-rubric-id="${rubricId}">
      <div><p class="eyebrow">Teacher scoring panel</p><h3>${text(rubric.title)} <span id="score-total">${total}/${rubric.total}</span></h3><p>${text(rubric.officialNote)}</p></div>
      ${rubric.criteria.map((criterion) => `<label class="rubric-check"><input type="checkbox" data-rubric-point="${criterion.id}" ${saved[criterion.id] ? 'checked' : ''}/><span><b>${criterion.label} · ${criterion.points} pt${criterion.points > 1 ? 's' : ''}</b>${text(criterion.description)}</span></label>`).join('')}
    </aside>`;
}

function openRubricIndex() {
  const existing = $('#modal-layer');
  existing.innerHTML = `
    <article class="small-modal">
      <header class="quest-modal-header"><div><p class="eyebrow">Official scoring structures</p><h2>APUSH Writing Rubrics</h2><p>Every Boss Battle uses the real 3-, 6-, and 7-point AP History structures.</p></div><button class="close-button" data-close-modal>×</button></header>
      <div class="rubric-index">${Object.entries(RUBRICS).map(([id, rubric]) => `<button data-open-rubric="${id}"><span>${rubric.total}</span><div><b>${text(rubric.title)}</b><small>${text(rubric.officialNote)}</small></div><em>View →</em></button>`).join('')}</div>
    </article>`;
}

function openRubric(rubricId) {
  const rubric = RUBRICS[rubricId];
  const existing = $('#modal-layer');
  existing.innerHTML = `
    <article class="rubric-modal">
      <header class="quest-modal-header"><div><p class="eyebrow">Official scoring structure</p><h2>${text(rubric.title)} <span>${rubric.total} points</span></h2><p>${text(rubric.officialNote)}</p></div><button class="close-button" data-close-modal>×</button></header>
      <div class="rubric-list">${rubric.criteria.map((criterion) => `<article><div><b>${text(criterion.label)}</b><span>${criterion.points} pt${criterion.points > 1 ? 's' : ''}</span></div><p>${text(criterion.description)}</p></article>`).join('')}</div>
      <footer class="rubric-footer">Rubric wording is summarized for interface use. The package documentation links directly to the official APUSH Course and Exam Description, effective Fall 2026.</footer>
    </article>`;
}

function bindQuestEvents() {
  const hippForm = $('#hipp-form');
  if (hippForm) {
    hippForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const response = Object.fromEntries(new FormData(hippForm).entries());
      state.attempts[activeQuest.id] = { response, savedAt: new Date().toISOString() };
      const complete = Object.values(response).every((value) => value.trim().length >= 25);
      if (complete) completeQuest(activeQuest, 'HIPP analysis saved. You earned practice XP for a complete, evidence-ready attempt.', { sourcing: 1, evidence: 1 });
      else {
        saveState(state);
        showFeedback('#hipp-feedback', 'Save recorded. Add at least one specific source detail and explanation to each HIPP category before claiming XP.', 'notice');
      }
    });
    $('[data-show-model]')?.addEventListener('click', () => showFeedback('#hipp-feedback', activeQuest.model, 'model'));
  }

  $$('.answer-choice').forEach((button) => button.addEventListener('click', () => handleChoice(Number(button.dataset.answerIndex))));

  $$('[data-boss-mode]').forEach((button) => button.addEventListener('click', () => {
    activeBossMode = button.dataset.bossMode;
    renderActiveQuest();
  }));

  const bossForm = $('#boss-form');
  if (bossForm) {
    bossForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const response = Object.fromEntries(new FormData(bossForm).entries());
      if (activeBossMode === 'leq') {
        $$('.planning-grid textarea').forEach((field) => { response[field.name] = field.value; });
      }
      state.attempts[`${activeQuest.id}-${activeBossMode}`] = { ...(state.attempts[`${activeQuest.id}-${activeBossMode}`] || {}), response, savedAt: new Date().toISOString() };
      saveState(state);
      const responseLength = Object.values(response).join('').trim().length;
      if (responseLength > 70) completeQuest(activeQuest, `${activeQuest.variants[activeBossMode].label} draft saved. Use the official ${RUBRICS[activeQuest.variants[activeBossMode].rubric].total}-point rubric to revise before scoring.`, { argument: 1, reasoning: 1 });
      else showFeedback('#boss-feedback', 'Draft saved. Add a complete response before earning practice XP.', 'notice');
    });
  }

  $$('[data-open-rubric]').forEach((button) => button.addEventListener('click', () => openRubric(button.dataset.openRubric)));

  $$('.teacher-scorecard input[type="checkbox"]').forEach((checkbox) => checkbox.addEventListener('change', saveTeacherScore));
}

function handleChoice(answerIndex) {
  const isRoyale = activeQuest.mode === 'royale';
  const item = isRoyale ? activeQuest.questions[royaleIndex] : activeQuest.cards[vocabIndex];
  const correct = answerIndex === item.answer;
  if (correct) {
    if (isRoyale) royaleScore += 1;
    else vocabScore += 1;
  }
  $$('.answer-choice').forEach((button, index) => {
    button.disabled = true;
    if (index === item.answer) button.classList.add('correct');
    if (index === answerIndex && !correct) button.classList.add('incorrect');
  });
  const feedbackSelector = isRoyale ? '#royale-feedback' : '#vocab-feedback';
  const nextIndex = isRoyale ? royaleIndex + 1 : vocabIndex + 1;
  const total = isRoyale ? activeQuest.questions.length : activeQuest.cards.length;
  const rationale = isRoyale ? item.rationale : `Correct answer: ${item.choices[item.answer]}. ${item.misconception}`;
  const buttonLabel = nextIndex < total ? 'Next round →' : 'Complete expedition';
  showFeedback(feedbackSelector, `<strong>${correct ? 'Evidence secured.' : 'Recheck the evidence.'}</strong> ${text(rationale)}<button class="primary-button feedback-next" data-next-choice>${buttonLabel}</button>`, correct ? 'correct' : 'incorrect', true);
  $('[data-next-choice]')?.addEventListener('click', () => {
    if (nextIndex < total) {
      if (isRoyale) royaleIndex += 1;
      else vocabIndex += 1;
      renderActiveQuest();
    } else {
      const score = isRoyale ? royaleScore : vocabScore;
      const scoreText = `${score}/${total}`;
      completeQuest(activeQuest, `${isRoyale ? 'Evidence Royale' : 'Vocabulary Bounty'} complete: ${scoreText}. Review each rationale in the archive, then replay for mastery.`, isRoyale ? { evidence: score, reasoning: 1 } : { context: score, evidence: 1 });
    }
  });
}

function saveTeacherScore(event) {
  const scorecard = event.target.closest('.teacher-scorecard');
  const scoreKey = scorecard.dataset.scoreKey;
  const rubric = RUBRICS[scorecard.dataset.rubricId];
  const teacherScore = {};
  $$('[data-rubric-point]', scorecard).forEach((input) => { teacherScore[input.dataset.rubricPoint] = input.checked; });
  state.attempts[scoreKey] = { ...(state.attempts[scoreKey] || {}), teacherScore };
  saveState(state);
  const total = rubric.criteria.reduce((sum, criterion) => sum + (teacherScore[criterion.id] ? criterion.points : 0), 0);
  $('#score-total', scorecard).textContent = `${total}/${rubric.total}`;
}

function completeQuest(quest, message, skillGains = {}) {
  const firstCompletion = !state.completed[quest.id];
  state.completed[quest.id] = true;
  if (firstCompletion) {
    state.xp += quest.xp;
    Object.entries(skillGains).forEach(([skill, gain]) => { state.skills[skill] = (state.skills[skill] || 0) + gain; });
    if (Object.keys(state.completed).length === 1) state.inventory.push({ name: 'Evidence Seal', note: 'Awarded for completing your first Unit 1 quest.' });
    if (Object.keys(state.completed).length === QUESTS.length) state.inventory.push({ name: 'Atlantic Crossroads Charter', note: 'Awarded for completing all Unit 1 expeditions.' });
  }
  saveState(state);
  updateHud();
  renderMap();
  setDispatch(quest.title, message);
  const feedback = $('#hipp-feedback') || $('#boss-feedback') || $('#royale-feedback') || $('#vocab-feedback');
  if (feedback) showFeedback(feedback, `${message}${firstCompletion ? ` <strong>+${quest.xp} XP</strong>` : ' This quest was already completed; your new draft is still saved.'}`, 'correct', true);
}

function showFeedback(selector, message, mode = 'notice', allowHtml = false) {
  const element = $(selector);
  if (!element) return;
  element.hidden = false;
  element.className = `quest-feedback ${mode}`;
  element.innerHTML = allowHtml ? message : text(message);
}

function openInventory() {
  openOverlay();
  $('#modal-layer').innerHTML = `
    <article class="small-modal"><header class="quest-modal-header"><div><p class="eyebrow">Founder inventory</p><h2>Field Gear & Keepsakes</h2><p>Cosmetics and progress markers never change a correct academic answer.</p></div><button class="close-button" data-close-modal>×</button></header><div class="inventory-grid">${state.inventory.map((item) => `<article><span>◇</span><h3>${text(item.name)}</h3><p>${text(item.note)}</p></article>`).join('')}</div></article>`;
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
}

function openLeaderboard() {
  openOverlay();
  const complete = Object.keys(state.completed).length;
  $('#modal-layer').innerHTML = `
    <article class="small-modal"><header class="quest-modal-header"><div><p class="eyebrow">Cooperative realm progress</p><h2>Atlantic Expedition Ledger</h2><p>No public academic ranking: this panel emphasizes shared milestones and your private skill growth.</p></div><button class="close-button" data-close-modal>×</button></header><div class="realm-grid"><article><span>Class archive goal</span><strong>42 / 80</strong><p>source investigations recorded</p></article><article><span>Your Unit 1 quests</span><strong>${complete} / ${QUESTS.length}</strong><p>expeditions completed</p></article><article><span>Writing drafts</span><strong>${Object.keys(state.attempts).filter((key) => key.includes('q-empires-reckoning')).length}</strong><p>saved for revision</p></article></div><div class="cooperative-note">Recommended class reward: unlock a shared Atlantic map mural when the class completes 80 documented source analyses.</div></article>`;
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
}

function openSkills() {
  openOverlay();
  $('#modal-layer').innerHTML = `
    <article class="small-modal"><header class="quest-modal-header"><div><p class="eyebrow">Historian profile</p><h2>Skill Ledger</h2><p>These practice meters track demonstrated work and revision; they do not modify graded answers.</p></div><button class="close-button" data-close-modal>×</button></header><div class="skills-large">${SKILLS.map((skill) => { const current = Math.min(20, skill.value + (state.skills[skill.id] || 0)); return `<article><span>${skill.icon}</span><div><h3>${text(skill.label)}</h3><p>${current}/20</p><div class="skill-track"><span style="width:${(current / 20) * 100}%"></span></div></div></article>`; }).join('')}</div></article>`;
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
}

function openHelp() {
  openOverlay();
  $('#modal-layer').innerHTML = `
    <article class="small-modal"><header class="quest-modal-header"><div><p class="eyebrow">Quest guide</p><h2>How the expedition works</h2></div><button class="close-button" data-close-modal>×</button></header><div class="help-grid"><article><span class="mode-icon hipp">◈</span><h3>HIPP Challenge</h3><p>Analyze historical situation, intended audience, purpose, and point of view with evidence.</p></article><article><span class="mode-icon royale">⌁</span><h3>Evidence Royale</h3><p>Practice AP-style stimulus questions, then study each rationale and distractor.</p></article><article><span class="mode-icon vocab">✣</span><h3>Vocabulary Bounty</h3><p>Define concepts, see them in context, and distinguish them from false trails.</p></article><article><span class="mode-icon boss">✦</span><h3>Boss Battle</h3><p>Draft SAQs, LEQs, and DBQs using the actual 3-, 6-, and 7-point AP scoring structures.</p></article></div></article>`;
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
}

function initializeEvents() {
  document.addEventListener('click', (event) => {
    const questButton = event.target.closest('[data-quest-id]');
    if (questButton) openQuest(questButton.dataset.questId);
    if (event.target.closest('[data-close-modal]')) closeModal();
    if (event.target.closest('[data-close-drawer]')) closeDrawer();
    if (event.target === $('#overlay')) { closeModal(); closeDrawer(); }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'open-library') openLibrary();
    if (action === 'open-inventory') openInventory();
    if (action === 'open-leaderboard') openLeaderboard();
    if (action === 'open-skills') openSkills();
    if (action === 'open-help') openHelp();
    if (action === 'open-rubrics') openRubricIndex();
    const rubricButton = event.target.closest('[data-open-rubric]');
    if (rubricButton) openRubric(rubricButton.dataset.openRubric);
  });
  $('#teacher-mode-toggle').addEventListener('click', () => {
    state.teacherMode = !state.teacherMode;
    saveState(state);
    updateHud();
    if (activeQuest?.mode === 'boss') renderActiveQuest();
  });
  $$('.rail-link[data-scroll-target]').forEach((button) => button.addEventListener('click', () => $(`#${button.dataset.scrollTarget}`).scrollIntoView({ behavior: 'smooth', block: 'start' })));
}

function init() {
  renderTopicChips();
  renderMap();
  updateHud();
  initializeEvents();
}

init();
