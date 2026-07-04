/*
  REPUBLIC BUILDER — INTERACTION PROTOTYPE
  ---------------------------------------------------------------
  This is intentionally a front-end-only demo. Progress is stored in
  localStorage on one browser. It is NOT a secure student record system.
*/

(() => {
  const data = window.REPUBLIC_BUILDER_DATA;
  const STORAGE_KEY = 'republic-builder-layout-v1';
  const xpTarget = 3200;

  const initialState = {
    studentName: 'Alex Morgan',
    republicName: 'The Hamilton Republic',
    republicMotto: '“E Pluribus Unum”',
    level: 12,
    xp: 2450,
    rp: 1285,
    streak: 7,
    pillars: Object.fromEntries(data.pillars.map((pillar) => [pillar.id, pillar.value])),
    completedQuests: [],
    dailyQuestIds: [],
    unlockedUnit: 3,
    inventory: data.inventory.map((item) => ({ ...item }))
  };

  let state = loadState();
  let activeQuest = null;
  let selectedAnswer = null;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved ? { ...clone(initialState), ...saved } : clone(initialState);
    } catch {
      return clone(initialState);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Some preview environments block browser storage. The interface still works for that session.
    }
  }

  function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => { toast.hidden = true; }, 2800);
  }

  function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
  }

  function updatePillars(changes = {}) {
    Object.entries(changes).forEach(([pillarId, amount]) => {
      if (Object.prototype.hasOwnProperty.call(state.pillars, pillarId)) {
        state.pillars[pillarId] = clamp(state.pillars[pillarId] + amount, 0, 100);
      }
    });
  }

  function addXp(amount) {
    state.xp += amount;
    let didLevelUp = false;
    while (state.xp >= xpTarget) {
      state.xp -= xpTarget;
      state.level += 1;
      didLevelUp = true;
    }
    return didLevelUp;
  }

  function renderHeader() {
    $('#studentName').textContent = state.studentName;
    $('#republicName').textContent = state.republicName;
    $('.republic-motto').textContent = state.republicMotto;
    $('#levelValue').textContent = state.level;
    $('#xpValue').textContent = `${formatNumber(state.xp)} / ${formatNumber(xpTarget)}`;
    $('#xpMeter').style.width = `${(state.xp / xpTarget) * 100}%`;
    $('#rpValue').textContent = formatNumber(state.rp);
    $('#streakValue').textContent = state.streak;

    const completed = state.completedQuests.length;
    $('#populationValue').textContent = `${(12.4 + completed * 0.1).toFixed(1)}M`;
    $('#treasuryValue').textContent = formatNumber(8750 + state.rp);
    const averagePillar = Object.values(state.pillars).reduce((sum, value) => sum + value, 0) / 6;
    $('#stabilityValue').textContent = `${Math.round(averagePillar)}%`;
  }

  function renderPillars() {
    const pillarsGrid = $('#pillarsGrid');
    pillarsGrid.innerHTML = data.pillars.map((pillar) => {
      const value = state.pillars[pillar.id];
      return `
        <button class="pillar-card" type="button" data-pillar="${pillar.id}" aria-label="${pillar.name}: ${value} out of 100. Learn more.">
          <span class="pillar-name">${pillar.name}</span>
          <span class="pillar-icon" aria-hidden="true">${pillar.icon}</span>
          <span class="meter pillar-meter"><span style="width: ${value}%; background: ${pillar.color}"></span></span>
          <strong>${value} <small>/ 100</small></strong>
        </button>
      `;
    }).join('');

    $$('.pillar-card').forEach((card) => card.addEventListener('click', () => {
      const pillar = data.pillars.find((item) => item.id === card.dataset.pillar);
      openInfoModal(pillar.name, pillar.description, 'Republic Pillar');
    }));
  }

  function questTypeClass(category) {
    const typeMap = {
      'Unit Quest': 'unit',
      'Primary Source Battle': 'source',
      'HIPP Challenge': 'hipp',
      'Debate Duel': 'debate',
      'Timeline Mission': 'timeline',
      'DBQ Boss Fight': 'boss',
      'Vocabulary Bounty': 'vocab'
    };
    return typeMap[category] || 'unit';
  }

  function renderQuests(filter = 'all') {
    const questGrid = $('#questGrid');
    const sortedQuests = [...data.quests].filter((quest) => filter === 'all' || quest.group === filter);

    questGrid.innerHTML = sortedQuests.map((quest) => {
      const completed = state.completedQuests.includes(quest.id);
      const typeClass = questTypeClass(quest.category);
      return `
        <article class="quest-card ${quest.boss ? 'quest-boss' : ''} ${completed ? 'completed' : ''}">
          <div class="quest-type ${typeClass}">${quest.category}</div>
          ${quest.boss ? '<div class="boss-corner">Boss</div>' : ''}
          <div class="quest-image"><img src="${quest.image}" alt="" /></div>
          <div class="quest-card-content">
            <h3>${quest.title}</h3>
            <p>${quest.description}</p>
            <div class="quest-rewards"><span><b>XP</b> ${quest.rewards.xp}</span><span><b>RP</b> ${quest.rewards.rp}</span></div>
            <button class="button ${quest.boss ? 'button-red' : 'button-green'} full-width" data-quest-id="${quest.id}" ${completed ? 'disabled' : ''}>
              ${completed ? 'Completed ✓' : quest.boss ? 'Fight boss' : 'Start quest'}
            </button>
          </div>
        </article>
      `;
    }).join('');

    $$('.quest-card [data-quest-id]').forEach((button) => {
      button.addEventListener('click', () => openQuest(button.dataset.questId));
    });
  }

  function renderInventory() {
    const items = state.inventory.slice(0, 8);
    $('#inventoryGrid').innerHTML = items.map((item) => `
      <button class="inventory-item ${item.tone}" data-item-id="${item.id}" type="button" aria-label="${item.name}, quantity ${item.quantity}">
        <span class="inventory-icon" aria-hidden="true">${item.icon}</span>
        <span class="inventory-name">${item.name}</span>
        <span class="inventory-quantity">${item.quantity}</span>
      </button>
    `).join('');

    $$('.inventory-item').forEach((itemButton) => {
      itemButton.addEventListener('click', () => {
        const item = state.inventory.find((item) => item.id === itemButton.dataset.itemId);
        openInfoModal(item.name, `An earned historical tool in your republic inventory. In the complete game, artifacts can unlock lore, cosmetic upgrades, companion abilities, or quest advantages.`, 'Inventory Item');
      });
    });
  }

  function renderProgressionRail() {
    $('#unitTrack').innerHTML = data.units.map((unit) => {
      const unlocked = unit.id <= state.unlockedUnit;
      const stateClass = unit.id === state.unlockedUnit ? 'current' : unlocked ? 'complete' : 'locked';
      return `
        <button class="unit-node ${stateClass}" data-unit-id="${unit.id}" type="button" ${unlocked ? '' : 'disabled'}>
          <span class="unit-number">${unit.id}</span>
          <span class="unit-copy"><strong>${unit.title}</strong><small>${unit.dates}</small></span>
          <span class="unit-lock" aria-hidden="true">${stateClass === 'complete' ? '✓' : stateClass === 'current' ? '✦' : '▣'}</span>
        </button>
      `;
    }).join('');

    $$('.unit-node:not([disabled])').forEach((unitButton) => {
      unitButton.addEventListener('click', () => {
        const unit = data.units.find((item) => item.id === Number(unitButton.dataset.unitId));
        openInfoModal(`${unit.short}: ${unit.title}`, `This era covers ${unit.dates}. The finished game will use this map as the gate to unit quests, primary-source encounters, timeline missions, boss fights, and historical characters.`, 'APUSH Era');
      });
    });
  }

  function renderDailyBonus() {
    const count = Math.min(state.dailyQuestIds.length, 3);
    $('#dailyProgress').textContent = count;
    $('#bonusDots').innerHTML = [0, 1, 2].map((index) => `<span class="bonus-dot ${index < count ? 'done' : ''}"></span>`).join('');
    const remainingForBoss = Math.max(0, 2 - Math.min(count, 2));
    $('#bossUnlockText').textContent = remainingForBoss === 0
      ? 'Unlocked!'
      : `${remainingForBoss} ${remainingForBoss === 1 ? 'quest' : 'quests'}`;
  }

  function render() {
    renderHeader();
    renderPillars();
    renderQuests($('.filter-chip.selected')?.dataset.filter || 'all');
    renderInventory();
    renderProgressionRail();
    renderDailyBonus();
    saveState();
  }

  function openModal(modal) {
    $('#modalBackdrop').hidden = false;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    const focusable = modal.querySelector('button, input, select, textarea');
    focusable?.focus();
  }

  function closeModals() {
    $$('.modal').forEach((modal) => { modal.hidden = true; });
    $('#modalBackdrop').hidden = true;
    document.body.classList.remove('modal-open');
    activeQuest = null;
    selectedAnswer = null;
  }

  function openQuest(questId) {
    const quest = data.quests.find((item) => item.id === questId);
    if (!quest || state.completedQuests.includes(questId)) return;

    activeQuest = quest;
    selectedAnswer = null;
    $('#modalImage').src = quest.image;
    $('#modalImage').alt = `Artwork for ${quest.title}`;
    $('#modalCategory').textContent = quest.category;
    $('#modalTitle').textContent = quest.title;
    $('#modalDescription').textContent = quest.description;
    $('#modalPrompt').textContent = quest.prompt;
    $('#questFeedback').textContent = '';
    $('#modalRewards').innerHTML = `<span>Reward</span><strong>+${quest.rewards.xp} XP</strong><strong>+${quest.rewards.rp} RP</strong>`;
    $('#submitAnswerButton').textContent = 'Submit answer';
    $('#submitAnswerButton').disabled = true;
    $('#answerList').innerHTML = quest.answers.map((answer, index) => `
      <button class="answer-option" data-answer-index="${index}" type="button"><span>${String.fromCharCode(65 + index)}</span>${answer}</button>
    `).join('');

    $$('.answer-option').forEach((button) => {
      button.addEventListener('click', () => {
        selectedAnswer = Number(button.dataset.answerIndex);
        $$('.answer-option').forEach((option) => option.classList.remove('selected'));
        button.classList.add('selected');
        $('#submitAnswerButton').disabled = false;
      });
    });

    openModal($('#questModal'));
  }

  function addArtifact(name) {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = state.inventory.find((item) => item.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.inventory.unshift({ id, name, icon: '✦', quantity: 1, tone: 'gold' });
    }
  }

  function resolveQuest() {
    if (!activeQuest || selectedAnswer === null) return;

    const feedback = $('#questFeedback');
    const options = $$('.answer-option');
    const correct = selectedAnswer === activeQuest.correctAnswer;
    options.forEach((option, index) => {
      option.disabled = true;
      if (index === activeQuest.correctAnswer) option.classList.add('correct');
      if (index === selectedAnswer && !correct) option.classList.add('incorrect');
    });

    if (!correct) {
      feedback.textContent = `Not quite. ${activeQuest.explanation} Choose another answer to try again.`;
      feedback.className = 'feedback error';
      $('#submitAnswerButton').textContent = 'Choose another answer';
      $('#submitAnswerButton').disabled = true;
      selectedAnswer = null;
      options.forEach((option) => { option.disabled = false; });
      return;
    }

    feedback.textContent = `Quest complete! ${activeQuest.explanation}`;
    feedback.className = 'feedback success';
    $('#submitAnswerButton').textContent = 'Claim rewards';
    $('#submitAnswerButton').disabled = false;
    $('#submitAnswerButton').onclick = () => completeQuest(activeQuest);
  }

  function completeQuest(quest) {
    if (state.completedQuests.includes(quest.id)) return;
    const levelUp = addXp(quest.rewards.xp);
    state.rp += quest.rewards.rp;
    updatePillars(quest.rewards.pillars);
    state.completedQuests.push(quest.id);

    if (state.dailyQuestIds.length < 3) {
      state.dailyQuestIds.push(quest.id);
      if (state.dailyQuestIds.length === 3) {
        state.rp += 100;
        showToast('Daily bonus unlocked: +100 Republic Points!');
      }
    }

    if (quest.rewards.artifact) addArtifact(quest.rewards.artifact);
    state.streak += 1;
    closeModals();
    render();
    showToast(levelUp ? `Victory! Level ${state.level} reached.` : `Victory! +${quest.rewards.xp} XP and +${quest.rewards.rp} RP.`);
  }

  function openInfoModal(title, content, eyebrow = 'Republic Builder') {
    $('#infoModalEyebrow').textContent = eyebrow;
    $('#infoModalTitle').textContent = title;
    $('#infoModalContent').innerHTML = `<p>${content}</p>`;
    openModal($('#infoModal'));
  }

  function openTeacherMode() {
    openModal($('#teacherModal'));
  }

  function openProfileEditor() {
    $('#profileNameInput').value = state.studentName;
    $('#profileRepublicInput').value = state.republicName;
    $('#profileMottoInput').value = state.republicMotto.replaceAll('“', '').replaceAll('”', '');
    openModal($('#profileModal'));
  }

  function bindEvents() {
    $$('.nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        $$('.nav-item').forEach((nav) => { nav.classList.remove('active'); nav.removeAttribute('aria-current'); });
        item.classList.add('active');
        item.setAttribute('aria-current', 'page');
        const target = document.getElementById(item.dataset.section);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else showToast(`${item.textContent.trim()} is planned for the next build.`);
      });
    });

    $$('.filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        $$('.filter-chip').forEach((filter) => filter.classList.remove('selected'));
        chip.classList.add('selected');
        renderQuests(chip.dataset.filter);
      });
    });

    $('#refreshQuestsButton').addEventListener('click', () => {
      const grid = $('#questGrid');
      grid.classList.add('refreshing');
      setTimeout(() => {
        data.quests.sort(() => Math.random() - 0.5);
        renderQuests($('.filter-chip.selected')?.dataset.filter || 'all');
        grid.classList.remove('refreshing');
        showToast('A fresh set of quests has appeared.');
      }, 220);
    });

    $('#submitAnswerButton').addEventListener('click', resolveQuest);
    $('#teacherModeButton').addEventListener('click', openTeacherMode);
    $('#editProfileButton').addEventListener('click', openProfileEditor);

    $('#profileForm').addEventListener('submit', (event) => {
      event.preventDefault();
      state.studentName = $('#profileNameInput').value.trim() || initialState.studentName;
      state.republicName = $('#profileRepublicInput').value.trim() || initialState.republicName;
      const motto = $('#profileMottoInput').value.trim() || 'E Pluribus Unum';
      state.republicMotto = `“${motto.replaceAll('“', '').replaceAll('”', '')}”`;
      closeModals();
      render();
      showToast('Republic profile updated.');
    });

    $$('.teacher-controls [data-teacher-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.teacherAction;
        if (action === 'xp') {
          const levelUp = addXp(100);
          render();
          showToast(levelUp ? `Teacher award: Level ${state.level} reached.` : 'Teacher award: +100 XP.');
        }
        if (action === 'rp') {
          state.rp += 100;
          render();
          showToast('Teacher award: +100 Republic Points.');
        }
        if (action === 'unlock') {
          state.unlockedUnit = Math.min(9, state.unlockedUnit + 1);
          render();
          showToast(`Unit ${state.unlockedUnit} is now unlocked.`);
        }
        if (action === 'reset') {
          localStorage.removeItem(STORAGE_KEY);
          state = clone(initialState);
          closeModals();
          render();
          showToast('Demo progress reset.');
        }
      });
    });

    $('#settingsButton').addEventListener('click', () => openInfoModal('Settings', 'This starter includes local saved progress, responsive layout behavior, and a reduced-motion-friendly interface. Account settings, sound controls, accessibility preferences, and parental privacy tools belong in the production build.', 'Prototype Setting'));
    $('#helpButton').addEventListener('click', () => openInfoModal('How the Demo Works', 'Choose a quest card, answer a short APUSH-style prompt, claim rewards, and watch your XP, Republic Points, pillars, inventory, daily bonus, and republic statistics update. The complete game can replace these demo questions with teacher-authored assignments and gradebook-linked tasks.', 'Quick Start'));
    $('#eraDetailsButton').addEventListener('click', () => openInfoModal('Era 3: Road to Revolution', 'This screen models a current campaign chapter. In the real game, this panel can hold unit goals, a visual map, lesson links, unit vocabulary, historical figures, and a culminating boss battle.', 'Current Era'));
    $('#viewRepublicButton').addEventListener('click', () => openInfoModal(state.republicName, 'A future Republic page can visualize the student’s civic choices: laws, alliances, population, stability, treasury, achievements, and a story journal. Avoid making historical outcomes “win conditions”; use the system to reward historical reasoning, evidence, and reflection.', 'Republic Overview'));
    $('#viewAllInventoryButton').addEventListener('click', () => openInfoModal('Full Inventory', 'The starter shows the first eight historical artifacts. In later versions, artifacts can be grouped by era, source type, historical figure, or skill—and each can unlock a short lore entry or class reward.', 'Inventory'));

    $('[data-close-modal]')?.addEventListener('click', closeModals);
    $$('.modal-close').forEach((button) => button.addEventListener('click', closeModals));
    $('#modalBackdrop').addEventListener('click', closeModals);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModals();
    });
  }

  bindEvents();
  render();
})();
