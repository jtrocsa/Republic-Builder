import { UNIT, QUESTS, SOURCES, SKILLS, RUBRICS } from './quest%20data.js';
import { loadState, saveState } from './quest%20store.js';
import { DEFAULT_STORAGE_KEY, loadProfile } from '../src/services/characterProfile.js';
import { PROFESSION_BY_ID } from '../src/data/professions.js';
import { getDataService, getDataModeLabel } from './services/dataService.js';
import { QUEST_BACKEND_CONFIG } from './config/quest-backend.config.js';

let state = loadState();
let activeQuest = null;
let activeBossMode = 'saq';
let royaleIndex = 0;
let royaleScore = 0;
let vocabIndex = 0;
let vocabScore = 0;
const CORE_STATE_KEY = 'republic-builder-state-v2';
const dataService = getDataService();
let studentClassId = QUEST_BACKEND_CONFIG.demoClassId;
let studentQuestFeed = [];
let teacherSession = null;
let teacherClasses = [];
let teacherActiveClassId = QUEST_BACKEND_CONFIG.demoClassId;
let teacherActiveTab = 'command-center';
let teacherDashboardSnapshot = null;
let teacherStudioSnapshot = [];
let activeTeacherSubmissionId = null;
let activeTeacherRubricMode = 'saq';
const RUBRIC_ASSETS = [
  { id: 'saq', title: 'SAQ Rubric', file: 'APUSH%20Rubrics/SAQ_Rubric.pdf', type: 'pdf', note: '3-point short-answer scoring structure.' },
  { id: 'leq', title: 'LEQ Rubric', file: 'APUSH%20Rubrics/LEQ%20Rubric.webp', type: 'image', note: '6-point long-essay scoring structure.' },
  { id: 'dbq', title: 'DBQ Rubric', file: 'APUSH%20Rubrics/DBQ%20Rubric.png', type: 'image', note: '7-point document-based question scoring structure.' }
];

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function text(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}

function getQuest(id) {
  return QUESTS.find((quest) => quest.id === id);
}

function getQuestFeedEntry(id) {
  return studentQuestFeed.find((entry) => entry.quest?.id === id || entry.questId === id);
}

function getRuntimeQuest(id) {
  const quest = getQuest(id);
  const feedEntry = getQuestFeedEntry(id);
  if (!quest) return null;
  if (!feedEntry) return { ...quest, unlocked: quest.unlocked !== false, accessMode: 'available', lockMessage: '' };
  return {
    ...quest,
    unlocked: Boolean(feedEntry.canOpen),
    accessMode: feedEntry.accessMode || 'available',
    lockMessage: feedEntry.noteToStudent || ''
  };
}

function getQuestCatalog() {
  return QUESTS.map((quest) => getRuntimeQuest(quest.id)).filter(Boolean);
}

function getAssignmentIdForQuest(questId) {
  const entry = getQuestFeedEntry(questId);
  return entry?.assignmentId || null;
}

function setTeacherMode(enabled) {
  state.teacherMode = enabled;
  document.body.setAttribute('data-app-mode', enabled ? 'teacher' : 'student');
  saveState(state);
}

function formatWhen(value) {
  if (!value) return 'Not scheduled';
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? String(value) : dt.toLocaleString();
}

function teacherBadge(status) {
  const textValue = String(status || 'unknown').replace(/_/g, ' ');
  return `<span class="quest-teacher-status-badge">${text(textValue)}</span>`;
}

function getTeacherTabs() {
  return [
    { id: 'command-center', label: 'Command Center' },
    { id: 'quest-studio', label: 'Quest Studio' },
    { id: 'submission-archive', label: 'Submission Archive' },
    { id: 'unit-control', label: 'Unit Control' },
    { id: 'roster', label: 'Roster & Classes' },
    { id: 'analytics', label: 'Historian Analytics' },
    { id: 'settings', label: 'Teacher Settings' }
  ];
}

function renderTeacherTabBar() {
  return `
    <nav class="teacher-tabs" aria-label="Teacher dashboard sections">
      ${getTeacherTabs().map((tab) => `<button type="button" data-teacher-tab="${tab.id}" class="${teacherActiveTab === tab.id ? 'active' : ''}">${text(tab.label)}</button>`).join('')}
    </nav>`;
}

function applyTeacherTabVisibility() {
  $$('[data-teacher-section]').forEach((section) => {
    const isActive = section.dataset.teacherSection === teacherActiveTab;
    section.hidden = !isActive;
  });
  $$('[data-teacher-tab]').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.teacherTab === teacherActiveTab);
  });
}

function readCoreState() {
  try {
    return JSON.parse(localStorage.getItem(CORE_STATE_KEY) || 'null');
  } catch {
    return null;
  }
}

function titleCaseFromSlug(value = '') {
  return String(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPlayerAdapter() {
  const profile = loadProfile(DEFAULT_STORAGE_KEY);
  const coreState = readCoreState();
  const character = coreState?.character || {};
  const identity = profile?.identity || {};
  const townRaw = identity.town || character.town || 'Frontier Outpost';
  const professionId = identity.professionId || character.profession || '';
  const profession = PROFESSION_BY_ID[professionId];
  const starterCount = Array.isArray(profile?.inventory?.starterItems) ? profile.inventory.starterItems.length : 0;

  return {
    name: identity.name || character.name || 'Unnamed Founder',
    pronouns: identity.pronouns || 'Pronouns not set',
    profession: profession?.label || titleCaseFromSlug(professionId || 'independent scholar'),
    settlement: titleCaseFromSlug(townRaw),
    gender: identity.gender || character.gender || 'neutral',
    outfit: identity.outfit || character.outfit || null,
    starterItemCount: starterCount
  };
}

function renderPortrait(player) {
  const portrait = $('#hud-portrait');
  if (!portrait) return;

  const gender = String(player.gender || 'neutral').toLowerCase();
  const baseAsset = gender === 'man' ? 'assets/character/base/man.svg' : gender === 'woman' ? 'assets/character/base/woman.svg' : 'assets/character/base/neutral.svg';
  const outfit = player.outfit || {};
  const layerAssets = [
    ['base', baseAsset],
    ['socks', outfit.socks ? `assets/character/wardrobe/socks/${outfit.socks}.svg` : ''],
    ['pants', outfit.pants ? `assets/character/wardrobe/pants/${outfit.pants}.svg` : ''],
    ['shoes', outfit.shoes ? `assets/character/wardrobe/shoes/${outfit.shoes}.svg` : ''],
    ['shirt', outfit.shirt ? `assets/character/wardrobe/shirts/${outfit.shirt}.svg` : ''],
    ['hat', outfit.hat ? `assets/character/wardrobe/hats/${outfit.hat}.svg` : '']
  ];

  const layers = layerAssets
    .filter(([, path]) => path)
    .map(([slot, path]) => `<img class="avatar-layer avatar-layer-${slot}" src="${path}" alt="" aria-hidden="true" loading="lazy" />`)
    .join('');

  portrait.innerHTML = layers || '<div class="portrait-fallback" aria-hidden="true"><div class="portrait-hair"></div><div class="portrait-face"></div><div class="portrait-tunic"></div></div>';
}

function setDispatch(title, copy) {
  state.dispatch = { title, copy };
  saveState(state);
  $('#dispatch-title').textContent = title;
  $('#dispatch-copy').textContent = copy;
}

function updateHud() {
  const player = getPlayerAdapter();
  const completedCount = Object.keys(state.completed).length;
  const totalQuestCount = QUESTS.length;
  const percent = Math.round((completedCount / totalQuestCount) * 100);

  $('#hud-player-name').textContent = player.name;
  $('#hud-pronouns').textContent = player.pronouns;
  $('#hud-profession').textContent = player.profession;
  $('#hud-settlement').textContent = player.settlement;
  renderPortrait(player);

  $('#quest-progress-label').textContent = `${completedCount} of ${totalQuestCount} quests completed`;
  $('#unit-progress-bar').style.width = `${percent}%`;
  $('#xp-label').textContent = `${state.xp} / 500 XP`;
  $('#xp-bar').style.width = `${Math.min((state.xp / 500) * 100, 100)}%`;
  $('#player-level').textContent = Math.max(1, Math.floor(state.xp / 100) + 1);
  $('#inventory-count').textContent = state.inventory.length + player.starterItemCount;
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
  document.body.setAttribute('data-app-mode', state.teacherMode ? 'teacher' : 'student');
  const teacherStatus = $('#teacher-mode-status');
  if (teacherStatus) {
    if (state.teacherMode && teacherSession?.user) {
      teacherStatus.textContent = `Signed in as ${teacherSession.user.displayName} (${getDataModeLabel()})`;
    } else {
      teacherStatus.textContent = `Teacher Mode is off (${getDataModeLabel()})`;
    }
  }

  if (state.dispatch) {
    $('#dispatch-title').textContent = state.dispatch.title;
    $('#dispatch-copy').textContent = state.dispatch.copy;
  }
}

function renderTopicChips() {
  $('#topic-chips').innerHTML = UNIT.topics.map((topic) => `<span>${text(topic.replace(/^\d\.\d\s/, ''))}</span>`).join('');
}

function renderMap() {
  const questCatalog = getQuestCatalog();
  $('#map-quests').innerHTML = questCatalog.map((quest) => {
    const unlocked = quest.unlocked !== false;
    const done = Boolean(state.completed[quest.id]);
    const statusLabel = quest.accessMode === 'review_only'
      ? 'Review only'
      : quest.accessMode === 'scheduled'
        ? 'Scheduled'
        : quest.accessMode === 'locked'
          ? 'Locked'
          : unlocked
            ? 'Unlocked'
            : 'Locked';
    const questType = quest.mode === 'hipp'
      ? 'HIPP Challenge'
      : quest.mode === 'royale'
        ? 'Evidence Royale'
        : quest.mode === 'vocab'
          ? 'Vocabulary Bounty'
          : 'Boss Battle';
    return `
      <button class="map-quest ${quest.mode} ${done ? 'completed' : ''} ${unlocked ? 'unlocked' : 'locked'}" data-quest-id="${quest.id}" style="left:${quest.coordinates.left}; top:${quest.coordinates.top};" aria-label="Open ${text(quest.title)}" ${unlocked ? '' : 'disabled'}>
        <span class="quest-beacon">${quest.icon}</span>
        <span class="quest-label"><b>${text(quest.shortTitle)}</b><em>${questType}</em><em>${text(quest.location)} · ${quest.xp} XP · ${done ? 'Completed' : statusLabel}</em>${quest.lockMessage && !unlocked ? `<em>${text(quest.lockMessage)}</em>` : ''}</span>
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
  activeQuest = getRuntimeQuest(questId);
  if (!activeQuest) return;
  const feedEntry = getQuestFeedEntry(questId);
  if (feedEntry && !feedEntry.canOpen) {
    openOverlay();
    const modal = $('#modal-layer');
    modal.innerHTML = `
      <article class="small-modal">
        <header class="quest-modal-header">
          <div>
            <p class="eyebrow">Quest currently locked</p>
            <h2>${text(activeQuest.title)}</h2>
            <p>${text(feedEntry.noteToStudent || 'Your teacher has not released this quest yet.')}</p>
          </div>
          <button class="close-button" data-close-modal aria-label="Close quest">×</button>
        </header>
        <div class="teacher-lock-panel">
          <p>${text(activeQuest.description)}</p>
          <div class="teacher-lock-meta">
            <span>Access mode: <b>${text(feedEntry.accessMode || 'locked')}</b></span>
            <span>Status: <b>${text(feedEntry.assignmentStatus || 'not_started')}</b></span>
          </div>
        </div>
      </article>`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    return;
  }
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
      <div class="rubric-gallery">
        ${RUBRIC_ASSETS.map((asset) => `
          <button class="rubric-card" data-open-rubric="${asset.id}" type="button">
            <div class="rubric-card-media ${asset.type}">
              ${asset.type === 'pdf'
                ? `<object data="${asset.file}" type="application/pdf" aria-label="${text(asset.title)} preview"></object><span class="rubric-card-fallback">PDF preview</span>`
                : `<img src="${asset.file}" alt="${text(asset.title)} preview" loading="lazy" />`}
            </div>
            <div class="rubric-card-body">
              <div><b>${text(asset.title)}</b><span>${asset.id.toUpperCase()}</span></div>
              <p>${text(asset.note)}</p>
            </div>
          </button>`).join('')}
      </div>
      <div class="rubric-index">${Object.entries(RUBRICS).map(([id, rubric]) => `<button data-open-rubric="${id}"><span>${rubric.total}</span><div><b>${text(rubric.title)}</b><small>${text(rubric.officialNote)}</small></div><em>View →</em></button>`).join('')}</div>
    </article>`;
}

function openRubric(rubricId) {
  const rubric = RUBRICS[rubricId];
  const existing = $('#modal-layer');
  existing.innerHTML = `
    <article class="rubric-modal">
      <header class="quest-modal-header"><div><p class="eyebrow">Official scoring structure</p><h2>${text(rubric.title)} <span>${rubric.total} points</span></h2><p>${text(rubric.officialNote)}</p></div><button class="close-button" data-close-modal>×</button></header>
      <div class="rubric-preview-strip">
        ${RUBRIC_ASSETS.map((asset) => `
          <figure class="rubric-preview ${asset.id === rubricId ? 'active' : ''}">
            ${asset.type === 'pdf'
              ? `<object data="${asset.file}" type="application/pdf" aria-label="${text(asset.title)} preview"></object>`
              : `<img src="${asset.file}" alt="${text(asset.title)}" loading="lazy" />`}
            <figcaption>${text(asset.title)}</figcaption>
          </figure>`).join('')}
      </div>
      <div class="rubric-list">${rubric.criteria.map((criterion) => `<article><div><b>${text(criterion.label)}</b><span>${criterion.points} pt${criterion.points > 1 ? 's' : ''}</span></div><p>${text(criterion.description)}</p></article>`).join('')}</div>
      <footer class="rubric-footer">Rubric wording is summarized for interface use. The package documentation links directly to the official APUSH Course and Exam Description, effective Fall 2026.</footer>
    </article>`;
}

function bindQuestEvents() {
  const hippForm = $('#hipp-form');
  if (hippForm) {
    hippForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const response = Object.fromEntries(new FormData(hippForm).entries());
      state.attempts[activeQuest.id] = { response, savedAt: new Date().toISOString() };
      const assignmentId = getAssignmentIdForQuest(activeQuest.id);
      if (assignmentId) {
        try {
          await dataService.saveStudentDraft({ assignmentId, answers: response });
        } catch (error) {
          console.warn('Unable to save HIPP draft via data service', error);
        }
      }
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
    bossForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const response = Object.fromEntries(new FormData(bossForm).entries());
      if (activeBossMode === 'leq') {
        $$('.planning-grid textarea').forEach((field) => { response[field.name] = field.value; });
      }
      state.attempts[`${activeQuest.id}-${activeBossMode}`] = { ...(state.attempts[`${activeQuest.id}-${activeBossMode}`] || {}), response, savedAt: new Date().toISOString() };
      const assignmentId = getAssignmentIdForQuest(activeQuest.id);
      if (assignmentId) {
        try {
          await dataService.saveStudentDraft({ assignmentId, answers: response });
        } catch (error) {
          console.warn('Unable to save boss draft via data service', error);
        }
      }
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
  const attemptKey = activeQuest.id;
  const attemptState = state.attempts[attemptKey] || { choiceLog: [] };

  attemptState.choiceLog = Array.isArray(attemptState.choiceLog) ? attemptState.choiceLog : [];
  attemptState.choiceLog.push({
    mode: activeQuest.mode,
    round: isRoyale ? royaleIndex + 1 : vocabIndex + 1,
    selectedIndex: answerIndex,
    correctIndex: item.answer,
    correct,
    prompt: item.prompt || item.application || '',
    savedAt: new Date().toISOString()
  });

  if (!isRoyale) {
    attemptState.vocabMastery = attemptState.vocabMastery || {};
    attemptState.vocabMastery[item.term] = {
      mastered: correct,
      selectedIndex: answerIndex,
      correctIndex: item.answer,
      savedAt: new Date().toISOString()
    };
  }

  state.attempts[attemptKey] = attemptState;
  saveState(state);

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

async function refreshStudentFeed() {
  try {
    studentQuestFeed = await dataService.getStudentQuestFeed({
      classId: studentClassId,
      studentId: QUEST_BACKEND_CONFIG.demoStudentId || 'student-aria'
    });
  } catch (error) {
    console.warn('Unable to load student quest feed from data service', error);
    studentQuestFeed = [];
  }
}

async function renderStudentBulletin() {
  const list = $('#student-bulletin-list');
  if (!list) return;
  try {
    const announcements = await dataService.listAnnouncements({ classId: studentClassId });
    list.innerHTML = announcements.slice(0, 3).map((item) => `
      <article class="bulletin-item">
        <h3>${text(item.title)}</h3>
        <p>${text(item.body)}</p>
        <small>${text(formatWhen(item.publishAt))}</small>
      </article>
    `).join('');
    if (!announcements.length) list.innerHTML = '<p class="empty-note">No current announcements.</p>';
  } catch {
    list.innerHTML = '<p class="empty-note">Announcements unavailable in this mode.</p>';
  }
}

async function hydrateTeacherSnapshots() {
  teacherClasses = await dataService.getTeacherClasses();
  if (!teacherClasses.length) return;
  if (!teacherActiveClassId || !teacherClasses.some((row) => row.id === teacherActiveClassId)) {
    teacherActiveClassId = teacherClasses[0].id;
  }
  [teacherDashboardSnapshot, teacherStudioSnapshot] = await Promise.all([
    dataService.getTeacherDashboard({ classId: teacherActiveClassId }),
    dataService.getTeacherQuestStudio({ classId: teacherActiveClassId })
  ]);
}

function teacherClassSelect() {
  if (!teacherClasses.length) return '<span>No classes</span>';
  return `<label class="teacher-inline-label">Class
    <select id="teacher-class-select">${teacherClasses.map((klass) => `<option value="${klass.id}" ${klass.id === teacherActiveClassId ? 'selected' : ''}>${text(klass.periodLabel)} · ${text(klass.name)}</option>`).join('')}</select>
  </label>`;
}

function renderTeacherCommandCenterSection() {
  const snapshot = teacherDashboardSnapshot || {};
  return `
    <section class="teacher-panel" data-teacher-section="command-center">
      <header><h3>Command Center</h3><p>Live snapshot for class operations and grading queue.</p></header>
      <div class="teacher-kpi-grid">
        <article><span>Students</span><strong>${snapshot.studentCount || 0}</strong></article>
        <article><span>Ungraded</span><strong>${snapshot.ungradedCount || 0}</strong></article>
        <article><span>Completion</span><strong>${snapshot.completionPct || 0}%</strong></article>
        <article><span>Needs attention</span><strong>${snapshot.needsAttention || 0}</strong></article>
      </div>
      <div class="teacher-activity-list">${(snapshot.recentActivity || []).map((event) => `<div>${teacherBadge(event.type)}<p>${text(event.message)}</p><small>${text(formatWhen(event.at))}</small></div>`).join('') || '<p class="empty-note">No activity yet.</p>'}</div>
    </section>`;
}

function renderTeacherQuestStudioSection() {
  return `
    <section class="teacher-panel" data-teacher-section="quest-studio">
      <header><h3>Quest Studio</h3><p>Edit release states, publish drafts, and manage versions.</p></header>
      <div class="teacher-table-wrap">
        <table class="teacher-table">
          <thead><tr><th>Quest</th><th>Type</th><th>Access</th><th>Versions</th><th>Actions</th></tr></thead>
          <tbody>${teacherStudioSnapshot.map((quest) => `<tr>
            <td><b>${text(quest.title)}</b><small>${text(quest.slug)}</small></td>
            <td>${text(quest.questType)}</td>
            <td>${teacherBadge(quest.accessMode)}</td>
            <td>v${quest.latestVersion} (${quest.versionCount})</td>
            <td class="teacher-actions-inline">
              <button data-teacher-action="set-access" data-quest-id="${quest.id}" data-access="available">Unlock</button>
              <button data-teacher-action="set-access" data-quest-id="${quest.id}" data-access="locked">Lock</button>
              <button data-teacher-action="duplicate-quest" data-quest-id="${quest.id}">Duplicate</button>
              <button data-teacher-action="archive-quest" data-quest-id="${quest.id}">Archive</button>
            </td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </section>`;
}

function renderTeacherSubmissionArchiveSection(submissions) {
  return `
    <section class="teacher-panel" data-teacher-section="submission-archive">
      <header><h3>Submission Archive</h3><p>Open any entry in the grading interface that mirrors boss battle rubric workflows.</p></header>
      <div class="teacher-table-wrap">
        <table class="teacher-table">
          <thead><tr><th>Student</th><th>Quest</th><th>Status</th><th>Score</th><th>Action</th></tr></thead>
          <tbody>${submissions.map((submission) => `<tr>
            <td>${text(submission.student?.displayName || 'Student')}<small>${text(submission.classPeriod || '')}</small></td>
            <td>${text(submission.quest?.title || submission.questId)}</td>
            <td>${teacherBadge(submission.status)}</td>
            <td>${submission.score ?? '-'} / ${submission.maxScore ?? '-'}</td>
            <td><button data-teacher-action="grade-submission" data-submission-id="${submission.id}">Open Grader</button></td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </section>`;
}

function renderTeacherUnitControlSection(units) {
  return `
    <section class="teacher-panel" data-teacher-section="unit-control">
      <header><h3>Unit Control</h3><p>Set active unit and move prior content into review state.</p></header>
      <div class="teacher-unit-grid">${units.map((unit) => `<article>
        <h4>${text(unit.title)}</h4>
        <p>${text(unit.subtitle || '')}</p>
        ${teacherBadge(unit.state)}
        <div class="teacher-actions-inline">
          <button data-teacher-action="set-unit-state" data-unit-id="${unit.id}" data-unit-state="active">Set Active</button>
          <button data-teacher-action="set-unit-state" data-unit-id="${unit.id}" data-unit-state="review_only">Review</button>
          <button data-teacher-action="set-unit-state" data-unit-id="${unit.id}" data-unit-state="archived">Archive</button>
        </div>
      </article>`).join('')}</div>
    </section>`;
}

function renderTeacherRosterSection(roster) {
  return `
    <section class="teacher-panel" data-teacher-section="roster">
      <header><h3>Roster & Classes</h3><p>Track student progress and class memberships.</p></header>
      <div class="teacher-roster-grid">${roster.map((student) => `<article>
        <h4>${text(student.displayName)}</h4>
        <p>${text(student.studentIdentifier || 'ID pending')}</p>
        <span>${text(student.profession || 'Founder')}</span>
      </article>`).join('')}</div>
    </section>`;
}

function renderTeacherAnalyticsSection(analytics) {
  return `
    <section class="teacher-panel" data-teacher-section="analytics">
      <header><h3>Historian Analytics</h3><p>Identify unfinished work and commonly missed criteria.</p></header>
      <div class="teacher-split-grid">
        <article>
          <h4>Completion Heatmap</h4>
          ${(analytics.completionByStudent || []).map((row) => `<div class="teacher-heat-row"><span>${text(row.studentName)}</span><b>${row.completionPct}%</b></div>`).join('') || '<p class="empty-note">No completion data.</p>'}
        </article>
        <article>
          <h4>Common Misses</h4>
          ${(analytics.commonMissedCriteria || []).map((row) => `<div class="teacher-heat-row"><span>${text(row.criterionKey)}</span><b>${row.count}</b></div>`).join('') || '<p class="empty-note">No rubric misses recorded.</p>'}
        </article>
      </div>
    </section>`;
}

function renderTeacherSettingsSection(announcements) {
  return `
    <section class="teacher-panel" data-teacher-section="settings">
      <header><h3>Teacher Settings</h3><p>Demo mode controls, announcement composer, and export tools.</p></header>
      <form class="teacher-announcement-form" id="teacher-announcement-form">
        <label>Announcement title<input name="title" required placeholder="Friday DBQ launch" /></label>
        <label>Announcement body<textarea name="body" rows="3" required placeholder="Reminder and expectations..."></textarea></label>
        <div class="teacher-actions-inline">
          <button type="submit">Publish Announcement</button>
          <button type="button" data-teacher-action="export-csv">Export Grades CSV</button>
          <button type="button" data-teacher-action="reset-demo">Reset Demo Data</button>
          <button type="button" data-teacher-action="exit-teacher">Exit Teacher Mode</button>
        </div>
      </form>
      <div class="teacher-announcement-list">${announcements.map((item) => `<article><h4>${text(item.title)}</h4><p>${text(item.body)}</p><small>${text(formatWhen(item.publishAt))}</small></article>`).join('') || '<p class="empty-note">No announcements yet.</p>'}</div>
    </section>`;
}

async function openTeacherSubmissionGrader(submissionId) {
  activeTeacherSubmissionId = submissionId;
  const details = await dataService.getSubmissionForGrading({ submissionId });

  const supportsWritingRubrics = details.submission.questId === 'q-empires-reckoning';
  const existing = Object.fromEntries((details.rubricScores || []).map((row) => [row.criterionKey, row]));

  if (supportsWritingRubrics) {
    const savedModes = ['saq', 'leq', 'dbq'].filter((mode) => Object.keys(existing).some((key) => key.startsWith(`${mode}-`) || (mode === 'saq' && key.startsWith('saq-part-'))));
    activeTeacherRubricMode = savedModes[0] || activeTeacherRubricMode || 'saq';
  } else {
    activeTeacherRubricMode = 'saq';
  }

  const rubric = RUBRICS[activeTeacherRubricMode] || RUBRICS.saq;
  const scoreHtml = rubric.criteria.map((criterion) => {
    const key = `${activeTeacherRubricMode}-${criterion.id}`;
    const legacyKey = activeTeacherRubricMode === 'saq' ? `saq-part-${criterion.id}` : key;
    const row = existing[key] || existing[legacyKey] || {};
    const points = Number(row.pointsEarned ?? 0);
    return `
      <label class="teacher-grade-row">
        <span>${text(criterion.label)} (${criterion.points} pt)</span>
        <input type="number" min="0" max="${criterion.points}" step="1" name="${key}" value="${points}" />
        <textarea name="fb-${key}" rows="2" placeholder="Feedback for ${text(criterion.label)}">${text(row.feedback || '')}</textarea>
      </label>`;
  }).join('');

  $('#modal-layer').innerHTML = `
    <article class="small-modal teacher-grade-modal">
      <header class="quest-modal-header">
        <div>
          <p class="eyebrow">Submission Grader</p>
          <h2>${text(details.student?.displayName || 'Student')} · ${text(details.content?.identity?.title || 'Quest')}</h2>
          <p>Use AP-style rubric scoring. Changes stay in local demo mode.</p>
        </div>
        <button class="close-button" data-close-modal>×</button>
      </header>
      <div class="teacher-grade-layout">
        <article class="teacher-grade-response">
          <h3>Student Response</h3>
          <pre>${text(JSON.stringify(details.submission.answers || {}, null, 2))}</pre>
        </article>
        <form id="teacher-grade-form" class="quest-teacher-grading-panel">
          <p class="quest-teacher-panel-kicker">Rubric Scoring</p>
          <input type="hidden" name="rubric-mode" value="${activeTeacherRubricMode}" />
          ${supportsWritingRubrics ? `<label class="teacher-inline-label">Rubric Mode
            <select id="teacher-rubric-mode-select">
              <option value="saq" ${activeTeacherRubricMode === 'saq' ? 'selected' : ''}>SAQ (3-Point)</option>
              <option value="leq" ${activeTeacherRubricMode === 'leq' ? 'selected' : ''}>LEQ (6-Point)</option>
              <option value="dbq" ${activeTeacherRubricMode === 'dbq' ? 'selected' : ''}>DBQ (7-Point)</option>
            </select>
          </label>` : ''}
          <p class="quest-teacher-score-summary">Scoring with ${text(rubric.title)} (${rubric.total} points)</p>
          ${scoreHtml}
          <label class="quest-teacher-feedback-label">Overall Feedback
            <textarea class="quest-teacher-overall-feedback" name="overall" rows="4">${text(details.submission.overallFeedback || '')}</textarea>
          </label>
          <div class="quest-teacher-panel-actions">
            <button type="submit">Save Scores</button>
            <button type="button" data-teacher-action="request-revision" data-submission-id="${submissionId}">Request Revision</button>
            <button type="button" data-teacher-action="return-graded" data-submission-id="${submissionId}">Return Graded</button>
          </div>
        </form>
      </div>
    </article>`;
  openOverlay();
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
}

async function renderTeacherDashboard() {
  await hydrateTeacherSnapshots();
  const [submissions, units, roster, analytics, announcements] = await Promise.all([
    dataService.getSubmissions({ classId: teacherActiveClassId }),
    dataService.getTeacherUnits(),
    dataService.getRoster({ classId: teacherActiveClassId }),
    dataService.getHistorianAnalytics({ classId: teacherActiveClassId, unitId: 'unit-1' }),
    dataService.listAnnouncements({ classId: teacherActiveClassId })
  ]);

  $('#modal-layer').innerHTML = `
    <article class="teacher-dashboard-modal">
      <header class="quest-modal-header">
        <div>
          <p class="eyebrow">Teacher Mode · ${text(getDataModeLabel())}</p>
          <h2>Atlantic Command Dashboard</h2>
          <p>Mock-only infrastructure active. Supabase adapter is scaffolded but not connected.</p>
        </div>
        <div class="teacher-header-controls">${teacherClassSelect()}<button class="close-button" data-close-modal>×</button></div>
      </header>
      <div class="teacher-dashboard-body">
        ${renderTeacherTabBar()}
        ${renderTeacherCommandCenterSection()}
        ${renderTeacherQuestStudioSection()}
        ${renderTeacherSubmissionArchiveSection(submissions)}
        ${renderTeacherUnitControlSection(units)}
        ${renderTeacherRosterSection(roster)}
        ${renderTeacherAnalyticsSection(analytics)}
        ${renderTeacherSettingsSection(announcements)}
      </div>
    </article>`;
  openOverlay();
  $('#modal-layer').classList.add('open');
  $('#modal-layer').setAttribute('aria-hidden', 'false');
  applyTeacherTabVisibility();
}

async function openTeacherAccessModal() {
  const session = await dataService.getCurrentSession();
  teacherSession = session;
  if (session?.user?.role === 'teacher') {
    setTeacherMode(true);
    updateHud();
    await renderTeacherDashboard();
    return;
  }

  $('#modal-layer').innerHTML = `
    <article class="small-modal teacher-auth-modal">
      <header class="quest-modal-header">
        <div>
          <p class="eyebrow">Teacher Mode Access</p>
          <h2>Authenticate Teacher Dashboard</h2>
          <p>Current mode: ${text(getDataModeLabel())}. Supabase is intentionally disabled for this phase.</p>
        </div>
        <button class="close-button" data-close-modal>×</button>
      </header>
      <div class="teacher-auth-body">
        <p>This local demo sign-in unlocks teacher infrastructure: class controls, quest studio, grading queue, analytics, and announcements.</p>
        <div class="quest-actions">
          <button class="primary-button" id="teacher-demo-signin" type="button">Demo Teacher Sign In</button>
          <button class="text-button" data-close-modal type="button">Cancel</button>
        </div>
        <small>Note: no remote auth, no Supabase writes, no student data sync.</small>
      </div>
    </article>`;
  openOverlay();
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

    if (event.target.id === 'teacher-demo-signin') {
      dataService.signInDemoTeacher()
        .then((session) => {
          teacherSession = session;
          setTeacherMode(true);
          updateHud();
          return renderTeacherDashboard();
        })
        .catch((error) => console.error('Teacher sign-in failed', error));
    }

    const teacherActionButton = event.target.closest('[data-teacher-action]');
    if (teacherActionButton) {
      const actionName = teacherActionButton.dataset.teacherAction;
      const questId = teacherActionButton.dataset.questId;
      const access = teacherActionButton.dataset.access;
      const submissionId = teacherActionButton.dataset.submissionId;
      const unitId = teacherActionButton.dataset.unitId;
      const unitState = teacherActionButton.dataset.unitState;

      if (actionName === 'grade-submission' && submissionId) {
        openTeacherSubmissionGrader(submissionId).catch((error) => console.error(error));
      }
      if (actionName === 'set-access' && questId && access) {
        dataService.saveQuestAccessRule({
          questId,
          classId: teacherActiveClassId,
          rule: { accessMode: access, noteToStudent: access === 'locked' ? 'Locked by teacher command center.' : '' }
        }).then(() => renderTeacherDashboard()).then(() => refreshStudentFeed()).then(() => renderMap());
      }
      if (actionName === 'duplicate-quest' && questId) {
        dataService.duplicateQuest({ questId, unitId: 'unit-1' }).then(() => renderTeacherDashboard());
      }
      if (actionName === 'archive-quest' && questId) {
        dataService.archiveQuest({ questId }).then(() => renderTeacherDashboard());
      }
      if (actionName === 'set-unit-state' && unitId && unitState) {
        dataService.setUnitState({ unitId, state: unitState }).then(() => renderTeacherDashboard());
      }
      if (actionName === 'request-revision' && submissionId) {
        dataService.requestRevision({ submissionId, feedback: 'Revise and resubmit. See rubric comments.', reopenQuestionIds: ['part-b'] })
          .then(() => renderTeacherDashboard());
      }
      if (actionName === 'return-graded' && submissionId) {
        dataService.returnSubmissionToStudent({ submissionId, overallFeedback: 'Graded and returned.' })
          .then(() => renderTeacherDashboard());
      }
      if (actionName === 'reset-demo') {
        dataService.resetDemoData().then(async () => {
          await refreshStudentFeed();
          await renderStudentBulletin();
          renderMap();
          await renderTeacherDashboard();
        });
      }
      if (actionName === 'export-csv') {
        dataService.exportGradesCsv({ classId: teacherActiveClassId, unitId: 'unit-1' })
          .then((csv) => showFeedback('#boss-feedback', `CSV generated in memory (${csv.split('\n').length - 1} rows).`, 'notice'));
      }
      if (actionName === 'exit-teacher') {
        dataService.signOut().then(async () => {
          teacherSession = null;
          setTeacherMode(false);
          updateHud();
          closeModal();
          await refreshStudentFeed();
          renderMap();
        });
      }
    }

    const teacherTabButton = event.target.closest('[data-teacher-tab]');
    if (teacherTabButton) {
      teacherActiveTab = teacherTabButton.dataset.teacherTab;
      applyTeacherTabVisibility();
    }

    const rubricButton = event.target.closest('[data-open-rubric]');
    if (rubricButton) openRubric(rubricButton.dataset.openRubric);
  });
  $('#teacher-mode-toggle').addEventListener('click', () => {
    if (state.teacherMode) {
      dataService.signOut().then(async () => {
        teacherSession = null;
        setTeacherMode(false);
        updateHud();
        if (activeQuest?.mode === 'boss') renderActiveQuest();
        await refreshStudentFeed();
        renderMap();
      });
      return;
    }
    openTeacherAccessModal().catch((error) => console.error(error));
  });

  document.addEventListener('change', (event) => {
    if (event.target.id === 'teacher-class-select') {
      teacherActiveClassId = event.target.value;
      renderTeacherDashboard().catch((error) => console.error(error));
    }

    if (event.target.id === 'teacher-rubric-mode-select' && activeTeacherSubmissionId) {
      activeTeacherRubricMode = event.target.value;
      openTeacherSubmissionGrader(activeTeacherSubmissionId).catch((error) => console.error(error));
    }
  });

  document.addEventListener('submit', (event) => {
    if (event.target.id === 'teacher-announcement-form') {
      event.preventDefault();
      const formData = new FormData(event.target);
      dataService.createAnnouncement({
        classId: teacherActiveClassId,
        title: String(formData.get('title') || ''),
        body: String(formData.get('body') || '')
      }).then(async () => {
        await renderStudentBulletin();
        await renderTeacherDashboard();
      });
    }

    if (event.target.id === 'teacher-grade-form') {
      event.preventDefault();
      if (!activeTeacherSubmissionId) return;
      const formData = new FormData(event.target);
      const rubricMode = String(formData.get('rubric-mode') || 'saq');
      const rubric = RUBRICS[rubricMode] || RUBRICS.saq;
      const scores = rubric.criteria.map((criterion) => {
        const key = `${rubricMode}-${criterion.id}`;
        return {
          criterionKey: key,
          pointsEarned: Number(formData.get(key) || 0),
          maxPoints: criterion.points,
          feedback: String(formData.get(`fb-${key}`) || '')
        };
      });

      dataService.saveRubricScores({
        submissionId: activeTeacherSubmissionId,
        scores,
        overallFeedback: String(formData.get('overall') || ''),
        status: 'grading'
      }).then(() => renderTeacherDashboard());
    }
  });

  $$('.rail-link[data-scroll-target]').forEach((button) => button.addEventListener('click', () => $(`#${button.dataset.scrollTarget}`).scrollIntoView({ behavior: 'smooth', block: 'start' })));
}

async function init() {
  await refreshStudentFeed();
  await renderStudentBulletin();
  teacherSession = await dataService.getCurrentSession();
  if (teacherSession?.user?.role === 'teacher') {
    setTeacherMode(true);
  }
  renderTopicChips();
  renderMap();
  updateHud();
  initializeEvents();
}

init();
