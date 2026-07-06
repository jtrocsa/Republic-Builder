import {
  clearProfile,
  createCharacterProfile,
  createDefaultOutfit,
  DEFAULT_STORAGE_KEY,
  HISTORIAN_SKILLS,
  FOUNDER_PATHS,
  getProfileFocusSummary,
  loadProfile,
  renderCharacterCreation,
  saveProfile
} from "./src/index.js";

/*
  REPUBLIC BUILDER — FRONT-END PROTOTYPE
  ------------------------------------------------------------------
  Content lives in data.js. Saving lives in storage.js. This file only
  renders the interface and applies game rules. That separation makes a
  future account/database upgrade much easier.
*/

(() => {
  const data = window.REPUBLIC_BUILDER_DATA;
  const storage = window.RepublicBuilderStorage;
  const STORAGE_KEY = 'republic-builder-state-v2';
  const DEFAULT_OUTFIT = {
    hat: 'hat-none',
    shirt: 'basic-tunic',
    pants: 'plain-trousers',
    socks: 'wool-socks',
    shoes: 'simple-shoes',
    special: 'locked-relic'
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
  }

  function getBaseTraits() {
    return clone(data.character.baseTraits);
  }

  function calculateTraits(professionId, changes = {}) {
    const profession = getProfession(professionId) || data.character.professions[0];
    const traits = getBaseTraits();
    Object.entries(profession.bonuses || {}).forEach(([trait, amount]) => {
      traits[trait] = clamp((traits[trait] || 0) + amount, 0, data.character.traitCap);
    });
    Object.entries(changes || {}).forEach(([trait, amount]) => {
      traits[trait] = clamp((traits[trait] || 0) + amount, 0, data.character.traitCap);
    });
    return traits;
  }

  function initialCharacter() {
    return {
      name: '',
      gender: 'woman',
      town: 'boston',
      profession: 'blacksmith',
      outfit: clone(DEFAULT_OUTFIT),
      traitGrowth: Object.fromEntries(data.character.traits.map((trait) => [trait.id, 0])),
      traits: calculateTraits('blacksmith')
    };
  }

  const initialState = {
    schemaVersion: 2,
    characterCreated: false,
    studentName: '',
    republicName: '',
    republicMotto: '“E Pluribus Unum”',
    character: initialCharacter(),
    profile: null,
    level: 1,
    xp: 0,
    rp: 0,
    streak: 0,
    pillars: Object.fromEntries(data.pillars.map((pillar) => [pillar.id, 50])),
    completedQuests: [],
    dailyQuestIds: [],
    unlockedUnit: 1,
    inventory: []
  };

  function normalizeState(saved) {
    const base = clone(initialState);
    if (!saved || typeof saved !== 'object') return base;

    const savedCharacter = saved.character || {};
    const character = {
      ...base.character,
      ...savedCharacter,
      outfit: { ...base.character.outfit, ...(savedCharacter.outfit || {}) },
      traitGrowth: { ...base.character.traitGrowth, ...(savedCharacter.traitGrowth || {}) },
      traits: { ...base.character.traits, ...(savedCharacter.traits || {}) }
    };

    if (!savedCharacter.traitGrowth && savedCharacter.traits) {
      const professionTraits = calculateTraits(character.profession);
      character.traitGrowth = Object.fromEntries(data.character.traits.map((trait) => [
        trait.id,
        Math.max(0, (character.traits[trait.id] || 0) - (professionTraits[trait.id] || 0))
      ]));
    }
    character.traits = calculateTraits(character.profession, character.traitGrowth);

    return {
      ...base,
      ...saved,
      schemaVersion: 2,
      character,
      profile: saved.profile || null,
      pillars: { ...base.pillars, ...(saved.pillars || {}) },
      completedQuests: Array.isArray(saved.completedQuests) ? saved.completedQuests : [],
      dailyQuestIds: Array.isArray(saved.dailyQuestIds) ? saved.dailyQuestIds : [],
      inventory: Array.isArray(saved.inventory) ? saved.inventory : [],
      unlockedUnit: clamp(Number(saved.unlockedUnit || 1), 1, data.units.length),
      level: Math.max(1, Number(saved.level || 1)),
      xp: Math.max(0, Number(saved.xp || 0)),
      rp: Math.max(0, Number(saved.rp || 0)),
      streak: Math.max(0, Number(saved.streak || 0))
    };
  }

  function loadState() {
    return normalizeState(storage.load(STORAGE_KEY));
  }

  function saveState() {
    storage.save(STORAGE_KEY, state);
    if (state.profile) {
      saveProfile(state.profile, DEFAULT_STORAGE_KEY);
    }
  }

  function getGender(id) {
    return data.character.genders.find((gender) => gender.id === id);
  }

  function getTown(id) {
    return data.character.towns.find((town) => town.id === id);
  }

  function getProfession(id) {
    return data.character.professions.find((profession) => profession.id === id);
  }

  function getWardrobeItem(slot, id) {
    return (data.character.wardrobe[slot] || []).find((item) => item.id === id);
  }

  function xpTargetForLevel(level) {
    return 400 + ((level - 1) * 150);
  }

  function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
  }

  function sanitizeMotto(motto) {
    const clean = String(motto || '').replaceAll('“', '').replaceAll('”', '').trim();
    return `“${clean || 'E Pluribus Unum'}”`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"]/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[character]));
  }

  function avatarMarkup(character, label = 'Character avatar') {
    const gender = getGender(character.gender) || data.character.genders[0];
    const outfit = character.outfit || DEFAULT_OUTFIT;
    const layers = [
      { slot: 'base', asset: gender.asset, label: gender.label },
      { slot: 'socks', asset: getWardrobeItem('socks', outfit.socks)?.asset, label: getWardrobeItem('socks', outfit.socks)?.name },
      { slot: 'pants', asset: getWardrobeItem('pants', outfit.pants)?.asset, label: getWardrobeItem('pants', outfit.pants)?.name },
      { slot: 'shoes', asset: getWardrobeItem('shoes', outfit.shoes)?.asset, label: getWardrobeItem('shoes', outfit.shoes)?.name },
      { slot: 'shirt', asset: getWardrobeItem('shirt', outfit.shirt)?.asset, label: getWardrobeItem('shirt', outfit.shirt)?.name },
      { slot: 'hat', asset: getWardrobeItem('hat', outfit.hat)?.asset, label: getWardrobeItem('hat', outfit.hat)?.name }
    ];

    const special = getWardrobeItem('special', outfit.special);
    if (special && !special.locked) layers.push({ slot: 'special', asset: special.asset, label: special.name });

    return layers
      .filter((layer) => layer.asset)
      .map((layer) => `<img class="avatar-layer avatar-layer-${layer.slot}" src="${layer.asset}" alt="" aria-hidden="true" />`)
      .join('') || `<span aria-label="${label}"></span>`;
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => { toast.hidden = true; }, 3000);
  }

  let state = loadState();
  const savedProfile = loadProfile(DEFAULT_STORAGE_KEY);
  if (savedProfile && !state.profile) {
    const town = getTown(savedProfile.identity?.town) || data.character.towns[0];
    state.profile = savedProfile;
    state.character = {
      name: savedProfile.identity?.name || '',
      gender: savedProfile.identity?.gender || 'prefer-not-to-say',
      town: savedProfile.identity?.town || 'philadelphia',
      profession: savedProfile.identity?.professionId || 'blacksmith',
      outfit: clone(savedProfile.identity?.outfit || createDefaultOutfit()),
      traitGrowth: Object.fromEntries(data.character.traits.map((trait) => [trait.id, 0])),
      traits: calculateTraits(savedProfile.identity?.professionId || 'blacksmith')
    };
    state.studentName = state.character.name;
    state.republicName = `The ${town.name} Republic`;
    state.republicMotto = '“E Pluribus Unum”';
    state.characterCreated = true;
  }
  let activeQuest = null;
  let selectedAnswer = null;
  let questResolved = false;
  let creationDraft = createCreationDraft();
  let creationStep = 0;
  let activeWardrobeSlot = 'hat';
  let editingCharacter = false;

  function createCreationDraft() {
    const source = state.character || initialCharacter();
    return {
      ...clone(source),
      outfit: { ...clone(DEFAULT_OUTFIT), ...(source.outfit || {}) },
      republicName: state.republicName || '',
      motto: (state.republicMotto || 'E Pluribus Unum').replaceAll('“', '').replaceAll('”', '')
    };
  }

  function setAppVisibility(showDashboard) {
    $('#appShell').hidden = !showDashboard;
    $('#characterCreation').hidden = showDashboard;
  }

  function goToUnit1() {
    window.location.href = 'unit1.html';
  }

  function updatePillars(changes = {}) {
    Object.entries(changes).forEach(([pillarId, amount]) => {
      if (Object.prototype.hasOwnProperty.call(state.pillars, pillarId)) {
        state.pillars[pillarId] = clamp(state.pillars[pillarId] + amount, 0, 100);
      }
    });
  }

  // Future quest data can include rewards.traits, such as { intellect: 1 }.
  function updateCharacterTraits(changes = {}) {
    state.character.traitGrowth = state.character.traitGrowth || Object.fromEntries(data.character.traits.map((trait) => [trait.id, 0]));
    Object.entries(changes).forEach(([traitId, amount]) => {
      if (Object.prototype.hasOwnProperty.call(state.character.traitGrowth, traitId)) {
        state.character.traitGrowth[traitId] = Math.max(0, state.character.traitGrowth[traitId] + amount);
      }
    });
    state.character.traits = calculateTraits(state.character.profession, state.character.traitGrowth);
  }

  function addXp(amount) {
    state.xp += amount;
    let didLevelUp = false;
    while (state.xp >= xpTargetForLevel(state.level)) {
      state.xp -= xpTargetForLevel(state.level);
      state.level += 1;
      didLevelUp = true;
    }
    return didLevelUp;
  }

  function addArtifact(name, icon = '✦', tone = 'gold') {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = state.inventory.find((item) => item.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.inventory.unshift({ id, name, icon, quantity: 1, tone });
    }
  }

  function renderHeader() {
    const town = getTown(state.character.town) || data.character.towns[0];
    const profession = getProfession(state.character.profession) || data.character.professions[0];
    const currentUnit = data.units.find((unit) => unit.id === state.unlockedUnit) || data.units[0];
    const target = xpTargetForLevel(state.level);

    const profile = state.profile;
    const profileFocusSummary = getProfileFocusSummary(profile);
    const pathLabel = profileFocusSummary.founderPath;
    const focusSummary = profileFocusSummary.focusSummary;
    $('#studentName').textContent = state.character.name || state.studentName || 'Founder';
    $('#characterOrigin').textContent = `${town.name}, ${town.region}`;
    $('#characterProfession').textContent = [profileFocusSummary.profession || profession.name, pathLabel].filter(Boolean).join(' · ');
    $('#characterProfession').setAttribute('title', focusSummary ? `Founder Path: ${pathLabel || '—'} · Historian Focus: ${focusSummary}` : `Founder Path: ${pathLabel || '—'}`);
    $('#dashboardAvatar').innerHTML = avatarMarkup(state.character, 'Character avatar');
    $('#republicName').textContent = state.republicName || 'The New Republic';
    $('.republic-motto').textContent = state.republicMotto;
    $('#levelValue').textContent = state.level;
    $('#xpValue').textContent = `${formatNumber(state.xp)} / ${formatNumber(target)}`;
    $('#xpMeter').style.width = `${(state.xp / target) * 100}%`;
    $('#rpValue').textContent = formatNumber(state.rp);
    $('#streakValue').textContent = state.streak;
    $('#currentEraNumber').textContent = `Era ${currentUnit.id}`;
    $('#current-era-heading').textContent = currentUnit.title;
    $('#currentEraDates').textContent = currentUnit.dates;
    $('#currentEraImage').src = state.unlockedUnit >= 3 ? 'assets/era-revolution.svg' : 'assets/hero-scholar.svg';
    $('#currentEraImage').alt = `Illustrated scene for ${currentUnit.title}`;

    const completed = state.completedQuests.length;
    $('#populationValue').textContent = `${(1.2 + completed * 0.1).toFixed(1)}M`;
    $('#treasuryValue').textContent = formatNumber(500 + state.rp);
    const averagePillar = Object.values(state.pillars).reduce((sum, value) => sum + value, 0) / data.pillars.length;
    $('#stabilityValue').textContent = `${Math.round(averagePillar)}%`;
  }

  function renderPillars() {
    $('#pillarsGrid').innerHTML = data.pillars.map((pillar) => {
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

  function renderCharacterTraits() {
    const skills = state.profile?.historianSkills ? HISTORIAN_SKILLS.map((skill) => ({
      ...skill,
      score: Number(state.profile.historianSkills[skill.id] ?? 5)
    })) : [];

    if (!skills.length) {
      $('#traitsDashboardGrid').innerHTML = '<p class="trait-placeholder">Choose your founder path and historian focus to unlock the new APUSH skill bar.</p>';
      return;
    }

    $('#traitsDashboardGrid').innerHTML = skills.map((skill) => `
      <button class="dashboard-trait dashboard-skill" type="button" data-skill="${skill.id}" aria-label="${skill.label}: ${skill.score} out of 20. ${skill.description}">
        <span class="dashboard-trait-icon" aria-hidden="true">${skill.icon}</span>
        <span class="dashboard-trait-name">${skill.label}</span>
        <strong>${skill.score} <small>/ 20</small></strong>
      </button>
    `).join('');

    $$('.dashboard-skill').forEach((button) => button.addEventListener('click', () => {
      const skill = skills.find((item) => item.id === button.dataset.skill);
      if (!skill) return;
      openInfoModal(skill.label, `${skill.description} ${skill.practiceUnlock}`, 'Historian Skill');
    }));
  }

  function questTypeClass(category) {
    return {
      'Unit Quest': 'unit',
      'Primary Source Analysis': 'source',
      'HIPP Challenge': 'hipp',
      'Debate Challenge': 'debate',
      'Timeline Challenge': 'timeline',
      'DBQ Boss Battle': 'boss',
      'Vocabulary Challenge': 'vocab',
      'MCQ Challenge': 'source'
    }[category] || 'unit';
  }

  function renderQuests(filter = 'all') {
    const sortedQuests = data.quests.filter((quest) => filter === 'all' || quest.group === filter);
    $('#questGrid').innerHTML = sortedQuests.map((quest) => {
      const completed = state.completedQuests.includes(quest.id);
      return `
        <article class="quest-card ${quest.boss ? 'quest-boss' : ''} ${completed ? 'completed' : ''}">
          <div class="quest-type ${questTypeClass(quest.category)}">${quest.category}</div>
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
    $('#inventoryGrid').innerHTML = items.length ? items.map((item) => `
      <button class="inventory-item ${item.tone}" data-item-id="${item.id}" type="button" aria-label="${item.name}, quantity ${item.quantity}">
        <span class="inventory-icon" aria-hidden="true">${item.icon}</span>
        <span class="inventory-name">${item.name}</span>
        <span class="inventory-quantity">${item.quantity}</span>
      </button>
    `).join('') : `<p class="inventory-empty">Finish character creation and complete quests to collect historical tools.</p>`;

    $$('.inventory-item').forEach((itemButton) => {
      itemButton.addEventListener('click', () => {
        const item = state.inventory.find((entry) => entry.id === itemButton.dataset.itemId);
        openInfoModal(item.name, 'An earned historical tool in your republic inventory. In the complete game, artifacts can unlock lore, cosmetic upgrades, companion abilities, or quest advantages.', 'Inventory Item');
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

    $$('.unit-node:not([disabled])').forEach((button) => button.addEventListener('click', () => {
      const unit = data.units.find((item) => item.id === Number(button.dataset.unitId));
      openInfoModal(`${unit.short}: ${unit.title}`, `This era covers ${unit.dates}. The completed game will use this map as the gateway to unit quests, source encounters, timeline missions, boss fights, historical figures, and era-specific wardrobe unlocks.`, 'APUSH Era');
    }));
  }

  function renderDailyBonus() {
    const count = Math.min(state.dailyQuestIds.length, 3);
    $('#dailyProgress').textContent = count;
    $('#bonusDots').innerHTML = [0, 1, 2].map((index) => `<span class="bonus-dot ${index < count ? 'done' : ''}"></span>`).join('');
    const remainingForBoss = Math.max(0, 2 - Math.min(count, 2));
    $('#bossUnlockText').textContent = remainingForBoss === 0 ? 'Unlocked!' : `${remainingForBoss} ${remainingForBoss === 1 ? 'quest' : 'quests'}`;
  }

  function render() {
    if (!state.characterCreated) return;
    goToUnit1();
  }

  function openModal(modal) {
    $('#modalBackdrop').hidden = false;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.querySelector('button, input, select, textarea')?.focus();
  }

  function closeModals() {
    $$('.modal').forEach((modal) => { modal.hidden = true; });
    $('#modalBackdrop').hidden = true;
    document.body.classList.remove('modal-open');
    activeQuest = null;
    selectedAnswer = null;
    questResolved = false;
  }

  function openQuest(questId) {
    const quest = data.quests.find((item) => item.id === questId);
    if (!quest || state.completedQuests.includes(questId)) return;

    activeQuest = quest;
    selectedAnswer = null;
    questResolved = false;
    $('#modalImage').src = quest.image;
    $('#modalImage').alt = `Artwork for ${quest.title}`;
    $('#modalCategory').textContent = quest.category;
    $('#modalTitle').textContent = quest.title;
    $('#modalDescription').textContent = quest.description;
    $('#modalPrompt').textContent = quest.prompt;
    $('#questFeedback').textContent = '';
    $('#questFeedback').className = 'feedback';
    $('#modalRewards').innerHTML = `<span>Reward</span><strong>+${quest.rewards.xp} XP</strong><strong>+${quest.rewards.rp} RP</strong>`;
    $('#submitAnswerButton').textContent = 'Submit answer';
    $('#submitAnswerButton').disabled = true;
    $('#answerList').innerHTML = quest.answers.map((answer, index) => `
      <button class="answer-option" data-answer-index="${index}" type="button"><span>${String.fromCharCode(65 + index)}</span>${answer}</button>
    `).join('');

    $$('.answer-option').forEach((button) => button.addEventListener('click', () => {
      selectedAnswer = Number(button.dataset.answerIndex);
      $$('.answer-option').forEach((option) => option.classList.remove('selected'));
      button.classList.add('selected');
      $('#submitAnswerButton').disabled = false;
    }));

    openModal($('#questModal'));
  }

  function resolveQuest() {
    if (!activeQuest) return;
    if (questResolved) {
      completeQuest(activeQuest);
      return;
    }
    if (selectedAnswer === null) return;

    const correct = selectedAnswer === activeQuest.correctAnswer;
    const feedback = $('#questFeedback');
    const options = $$('.answer-option');
    if (!correct) {
      options.forEach((option) => option.classList.remove('selected'));
      const chosen = options.find((option) => Number(option.dataset.answerIndex) === selectedAnswer);
      chosen?.classList.add('incorrect');
      feedback.textContent = `Not quite. ${activeQuest.explanation}`;
      feedback.className = 'feedback error';
      selectedAnswer = null;
      $('#submitAnswerButton').disabled = true;
      return;
    }

    options.forEach((option, index) => {
      option.disabled = true;
      if (index === activeQuest.correctAnswer) option.classList.add('correct');
    });
    feedback.textContent = `Quest complete! ${activeQuest.explanation}`;
    feedback.className = 'feedback success';
    questResolved = true;
    $('#submitAnswerButton').textContent = 'Claim rewards';
    $('#submitAnswerButton').disabled = false;
  }

  function completeQuest(quest) {
    if (state.completedQuests.includes(quest.id)) return;
    const levelUp = addXp(quest.rewards.xp);
    state.rp += quest.rewards.rp;
    updatePillars(quest.rewards.pillars);
    updateCharacterTraits(quest.rewards.traits);
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

  function jumpToCreationStep(targetStep) {
    if (targetStep === creationStep) return;
    if (targetStep > creationStep) {
      if (!validateCreationStep()) return;
    }
    creationStep = targetStep;
    renderCharacterForge();
  }

  function renderCreationSteps() {
    const labels = ['Identity', 'Profession', 'Founder Path', 'Historian Focus'];
    $('#creationStepList').innerHTML = labels.map((label, index) => `
      <li class="${index === creationStep ? 'active' : index < creationStep ? 'complete' : ''}" role="button" tabindex="0" data-step-index="${index}" aria-current="${index === creationStep ? 'step' : 'false'}">
        <b>${index < creationStep ? '✓' : index + 1}</b><span>${label}</span>
      </li>
    `).join('');
    
    $$('#creationStepList li').forEach((item) => {
      const stepIndex = Number(item.dataset.stepIndex);
      item.addEventListener('click', () => jumpToCreationStep(stepIndex));
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          jumpToCreationStep(stepIndex);
        }
      });
    });
  }

  function formatBonuses(bonuses) {
    return Object.entries(bonuses).map(([trait, amount]) => {
      const label = data.character.traits.find((entry) => entry.id === trait)?.name || trait;
      return `+${amount} ${label}`;
    }).join(' · ');
  }

  function renderCreationTraits() {
    let skills = state.profile?.historianSkills ? HISTORIAN_SKILLS.map((skill) => ({
      ...skill,
      score: Number(state.profile.historianSkills[skill.id] ?? 5)
    })) : HISTORIAN_SKILLS.map((skill) => ({ ...skill, score: 5 }));

    // If there's no saved profile, preview any primary/secondary focus from the current draft
    if (!state.profile && creationDraft) {
      const primary = creationDraft.primarySkillId;
      const secondary = creationDraft.secondarySkillId;
      if (primary && secondary && primary !== secondary) {
        skills = HISTORIAN_SKILLS.map((skill) => ({
          ...skill,
          score: Number((skill.id === primary || skill.id === secondary) ? 7 : 5)
        }));
      }
    }

    $('#creationTraitsGrid').innerHTML = skills.map((skill) => `
      <div class="trait-preview-item" title="${skill.description}">
        <span class="trait-preview-icon" aria-hidden="true">${skill.icon}</span>
        <span>${skill.label}</span>
        <strong>${skill.score}</strong>
      </div>
    `).join('');
  }

  function renderIdentityStep() {
    return `
      <div class="creation-copy"><h2>Who is your founder?</h2><p>Name a character, choose a presentation, and place them in a town that will shape their story—not their academic score.</p></div>
      <label class="creation-field">Founder name
        <input id="creationNameInput" maxlength="28" placeholder="e.g., Maya Carter" value="${escapeHtml(creationDraft.name)}" autocomplete="off" />
      </label>
      <span class="choice-label">Gender / presentation</span>
      <div class="gender-choices">
        ${data.character.genders.map((gender) => `<button class="gender-choice ${creationDraft.gender === gender.id ? 'selected' : ''}" type="button" data-gender="${gender.id}">${gender.label}</button>`).join('')}
      </div>
      <span class="choice-label">Home town</span>
      <div class="town-grid">
        ${data.character.towns.map((town) => `<button class="town-choice ${creationDraft.town === town.id ? 'selected' : ''}" type="button" data-town="${town.id}"><span aria-hidden="true">${town.icon}</span><span><strong>${town.name}</strong><small>${town.region}</small></span></button>`).join('')}
      </div>
      <div class="mini-wardrobe">
        <p class="choice-label">Starter clothing</p>
        <div class="mini-wardrobe-grid">
          ${['hat','shirt','pants','socks','shoes'].map((slot) => `
            <label class="creation-field">${slot[0].toUpperCase() + slot.slice(1)}
              <select id="creation-outfit-${slot}">
                ${(data.character.wardrobe[slot] || []).map((item) => `
                  <option value="${item.id}" ${creationDraft.outfit[slot] === item.id ? 'selected' : ''}>${item.name}</option>
                `).join('')}
              </select>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderFounderPathStep() {
    return `
      <div class="creation-copy"><h2>Who are you in the Republic?</h2><p>Role-playing identity, dialogue flavor, and story routes tied to your Founder Path.</p></div>
      <div class="profession-grid">
        ${FOUNDER_PATHS.map((path) => `
          <button class="founder-choice ${creationDraft.founderPathId === path.id ? 'selected' : ''}" type="button" data-founder="${path.id}">
            <span class="profession-icon" aria-hidden="true">${path.icon}</span>
            <span><strong>${path.label}</strong><p>${path.tagline}</p></span>
          </button>
        `).join('')}
      </div>
    `;
  }

  function renderSkillStep() {
    return `
      <div class="creation-copy"><h2>Historian Focus</h2><p>Choose one Primary Focus and one different Secondary Focus. Each focused skill begins at +2 (7/20).</p></div>
      <div class="rb-focus-grid">
        <fieldset class="rb-focus-set">
          <legend>Primary Focus <span>+2</span></legend>
          ${HISTORIAN_SKILLS.map((skill) => `
            <label class="rb-focus-option">
              <input type="radio" name="primarySkill" value="${skill.id}" ${creationDraft.primarySkillId === skill.id ? 'checked' : ''} />
              <span><strong>${skill.icon} ${skill.label}</strong><small>${skill.description}</small></span>
            </label>
          `).join('')}
        </fieldset>

        <fieldset class="rb-focus-set">
          <legend>Secondary Focus <span>+2</span></legend>
          ${HISTORIAN_SKILLS.map((skill) => `
            <label class="rb-focus-option">
              <input type="radio" name="secondarySkill" value="${skill.id}" ${creationDraft.secondarySkillId === skill.id ? 'checked' : ''} />
              <span><strong>${skill.icon} ${skill.label}</strong><small>${skill.officialName}</small></span>
            </label>
          `).join('')}
        </fieldset>
      </div>
    `;
  }

  function renderProfessionStep() {
    return `
      <div class="creation-copy"><h2>Choose a calling</h2><p>Your profession gives a small opening advantage. Every founder starts with the same trait base; no choice is objectively better.</p></div>
      <div class="profession-grid">
        ${data.character.professions.map((profession) => `
          <button class="profession-choice ${creationDraft.profession === profession.id ? 'selected' : ''}" type="button" data-profession="${profession.id}">
            <span class="profession-icon" aria-hidden="true">${profession.icon}</span>
            <span><strong>${profession.name}</strong><p>${profession.description}</p><span class="bonus-line">${formatBonuses(profession.bonuses)}</span></span>
          </button>
        `).join('')}
      </div>
    `;
  }

  function renderWardrobeStep() {
    const slotNames = { hat: 'Hat', shirt: 'Shirt', pants: 'Pants', socks: 'Socks', shoes: 'Shoes', special: 'Quest Items' };
    const selected = getWardrobeItem(activeWardrobeSlot, creationDraft.outfit[activeWardrobeSlot]);
    return `
      <div class="creation-copy"><h2>Dress for the journey</h2><p>Every founder begins with a basic tunic and practical clothing. These starter choices are cosmetic; later eras and quests add earned gear.</p></div>
      <div class="wardrobe-label"><span>Choose ${slotNames[activeWardrobeSlot]}</span><span>${activeWardrobeSlot === 'special' ? 'Earned through quests' : 'Starter wardrobe'}</span></div>
      <div class="wardrobe-tabs">
        ${Object.entries(slotNames).map(([slot, label]) => `<button class="wardrobe-tab ${activeWardrobeSlot === slot ? 'active' : ''}" data-wardrobe-slot="${slot}" type="button">${label}</button>`).join('')}
      </div>
      <div class="wardrobe-options">
        ${(data.character.wardrobe[activeWardrobeSlot] || []).map((item) => `
          <button class="wardrobe-choice ${creationDraft.outfit[activeWardrobeSlot] === item.id ? 'selected' : ''} ${item.locked ? 'locked' : ''}" data-wardrobe-item="${item.id}" type="button" ${item.locked ? 'disabled' : ''}>
            <span class="wardrobe-thumb"><img src="${item.asset}" alt="" /></span><strong>${item.name}</strong>
          </button>
        `).join('')}
      </div>
      <p class="wardrobe-note">${selected?.note || 'Select a wardrobe item to preview it.'}</p>
    `;
  }

  function renderOathStep() {
    const town = getTown(creationDraft.town) || data.character.towns[0];
    const profession = getProfession(creationDraft.profession) || data.character.professions[0];
    const traits = calculateTraits(creationDraft.profession);
    const outfitEntries = ['hat', 'shirt', 'pants', 'socks', 'shoes'].map((slot) => getWardrobeItem(slot, creationDraft.outfit[slot])?.name).filter(Boolean);
    return `
      <div class="creation-copy"><h2>Found your republic</h2><p>Review your founder’s opening story. This profile is saved on this device now; a future account system will sync it between devices.</p></div>
      <label class="creation-field">Republic name
        <input id="creationRepublicInput" maxlength="34" placeholder="e.g., The Boston Commonwealth" value="${escapeHtml(creationDraft.republicName)}" autocomplete="off" />
      </label>
      <label class="creation-field">Republic motto
        <input id="creationMottoInput" maxlength="42" placeholder="e.g., Learn. Argue. Build." value="${escapeHtml(creationDraft.motto)}" autocomplete="off" />
      </label>
      <div class="forge-summary">
        <div class="summary-scroll">
          <div class="summary-row"><span>Founder</span><strong>${escapeHtml(creationDraft.name || 'Unnamed founder')}</strong></div>
          <div class="summary-row"><span>Home</span><strong>${town.name} · ${town.region}</strong></div>
          <div class="summary-row"><span>Calling</span><strong>${profession.name}</strong></div>
          <div><span class="choice-label">Starting wardrobe</span><div class="summary-outfit">${outfitEntries.map((item) => `<span>${item}</span>`).join('')}</div></div>
          <div><span class="choice-label">Starting attributes</span><div class="summary-traits">${data.character.traits.map((trait) => `<span>${trait.name}<b>${traits[trait.id]}</b></span>`).join('')}</div></div>
        </div>
      </div>
    `;
  }

  function bindCreationControls() {
    const nameInput = $('#creationNameInput');
    if (nameInput) nameInput.addEventListener('input', () => {
      creationDraft.name = nameInput.value;
      $('#creationNamePlate').textContent = creationDraft.name.trim() || 'Your Founder';
    });

    $$('.gender-choice').forEach((button) => button.addEventListener('click', () => {
      creationDraft.gender = button.dataset.gender;
      renderCharacterForge();
    }));
    $$('.town-choice').forEach((button) => button.addEventListener('click', () => {
      creationDraft.town = button.dataset.town;
      renderCharacterForge();
    }));
    $$('.profession-choice').forEach((button) => button.addEventListener('click', () => {
      creationDraft.profession = button.dataset.profession;
      renderCharacterForge();
    }));
    $$('.founder-choice').forEach((button) => button.addEventListener('click', () => {
      creationDraft.founderPathId = button.dataset.founder;
      renderCharacterForge();
    }));
    $$('.wardrobe-tab').forEach((button) => button.addEventListener('click', () => {
      activeWardrobeSlot = button.dataset.wardrobeSlot;
      renderCharacterForge();
    }));
    $$('.wardrobe-choice:not([disabled])').forEach((button) => button.addEventListener('click', () => {
      creationDraft.outfit[activeWardrobeSlot] = button.dataset.wardrobeItem;
      renderCharacterForge();
    }));

    // Mini wardrobe selects in the identity step
    ['hat','shirt','pants','socks','shoes'].forEach((slot) => {
      const sel = document.getElementById(`creation-outfit-${slot}`);
      if (sel) {
        sel.addEventListener('change', () => {
          creationDraft.outfit[slot] = sel.value;
          renderCharacterForge();
        });
      }
    });

    // Historian focus radio inputs
    $$("input[name='primarySkill']").forEach((input) => input.addEventListener('change', (ev) => {
      creationDraft.primarySkillId = ev.target.value;
      renderCreationTraits();
    }));
    $$("input[name='secondarySkill']").forEach((input) => input.addEventListener('change', (ev) => {
      creationDraft.secondarySkillId = ev.target.value;
      renderCreationTraits();
    }));

    const republicInput = $('#creationRepublicInput');
    if (republicInput) republicInput.addEventListener('input', () => { creationDraft.republicName = republicInput.value; });
    const mottoInput = $('#creationMottoInput');
    if (mottoInput) mottoInput.addEventListener('input', () => { creationDraft.motto = mottoInput.value; });
  }

  function buildCharacterCreationDraft() {
    const currentProfile = state.profile;
    const currentCharacter = state.character || initialCharacter();
    const outfit = currentProfile?.identity?.outfit || currentCharacter.outfit || createDefaultOutfit();
    return {
      name: currentProfile?.identity?.name || currentCharacter.name || '',
      gender: currentProfile?.identity?.gender || currentCharacter.gender || 'prefer-not-to-say',
      pronouns: currentProfile?.identity?.pronouns || '',
      town: currentProfile?.identity?.town || currentCharacter.town || 'philadelphia',
      founderPathId: currentProfile?.identity?.founderPathId || '',
      professionId: currentProfile?.identity?.professionId || currentCharacter.profession || '',
      primarySkillId: currentProfile?.historianFocus?.primarySkillId || '',
      secondarySkillId: currentProfile?.historianFocus?.secondarySkillId || '',
      outfit: { ...createDefaultOutfit(), ...(outfit || {}) }
    };
  }

  function syncCharacterCreationPreview(creatorController) {
    const draft = creatorController?.getDraft ? creatorController.getDraft() : buildCharacterCreationDraft();
    creationDraft = {
      ...creationDraft,
      ...draft,
      outfit: { ...clone(creationDraft.outfit), ...(draft.outfit || {}) }
    };

    $('#creationAvatar').innerHTML = avatarMarkup(creationDraft, 'Founder appearance preview');
    $('#dashboardAvatar').innerHTML = avatarMarkup(creationDraft, 'Character avatar');
    $('#creationNamePlate').textContent = (draft.name || '').trim() || 'Your Founder';

    const profileFocusSummary = getProfileFocusSummary({
      identity: {
        founderPathId: draft.founderPathId,
        professionId: draft.professionId
      },
      historianFocus: {
        primarySkillId: draft.primarySkillId,
        secondarySkillId: draft.secondarySkillId
      }
    });
    $('#creationRolePlate').textContent = [profileFocusSummary.profession, profileFocusSummary.founderPath].filter(Boolean).join(' · ') || 'Choose a profession';
    $('#creationRolePlate').setAttribute('title', profileFocusSummary.focusSummary ? `Founder Path: ${profileFocusSummary.founderPath || '—'} · Historian Focus: ${profileFocusSummary.focusSummary}` : `Founder Path: ${profileFocusSummary.founderPath || '—'}`);
    renderCreationTraits();
  }

  function renderCharacterForge() {
    const mount = $('#creationControls');
    const initialDraft = buildCharacterCreationDraft();

    // Render the compact, paginated creation steps instead of a single long form.
    renderCreationSteps();
    $('#creationStepEyebrow').textContent = `Step ${creationStep + 1} of 4`;
    const titles = ['Identity', 'Profession', 'Founder Path', 'Historian Focus'];
    $('#creationStepTitle').textContent = titles[creationStep] || 'Identity & Historian Focus';

    mount.innerHTML = (function () {
      switch (creationStep) {
        case 0:
          return renderIdentityStep();
        case 1:
          return renderProfessionStep();
        case 2:
          return renderFounderPathStep();
        case 3:
          return renderSkillStep();
        default:
          return renderIdentityStep();
      }
    })();

    bindCreationControls();
    syncCharacterCreationPreview();

    // Back/Next visibility and labels
    $('#creationBackButton').hidden = false;
    $('#creationBackButton').textContent = creationStep > 0 ? 'Back' : (editingCharacter ? 'Cancel' : 'Back');
    $('#creationNextButton').hidden = false;
    $('#creationNextButton').textContent = creationStep < 3 ? 'Continue' : 'Begin Your Republic';
    $('#demoFounderButton').hidden = false;
    $('#exitForgeButton').hidden = !editingCharacter;
  }

  function openCharacterForge(editing = false) {
    window.location.href = `features/character-forge/character-forge.html${editing ? '?edit=1' : ''}`;
  }

  function exitCharacterForge() {
    if (!editingCharacter || !state.characterCreated) return;
    editingCharacter = false;
    setAppVisibility(true);
    render();
  }

  function validateCreationStep() {
    return true;
  }

  function finishCharacterCreation(profile) {
    const isNewCharacter = !state.characterCreated;
    const profession = getProfession(profile.identity.professionId) || data.character.professions[0];
    const town = getTown(profile.identity.town) || data.character.towns[0];
    const retainedGrowth = isNewCharacter
      ? Object.fromEntries(data.character.traits.map((trait) => [trait.id, 0]))
      : clone(state.character.traitGrowth || Object.fromEntries(data.character.traits.map((trait) => [trait.id, 0])));

    state.profile = profile;
    state.character = {
      name: profile.identity.name,
      gender: profile.identity.gender,
      town: profile.identity.town,
      profession: profile.identity.professionId,
      outfit: clone(profile.identity.outfit),
      traitGrowth: retainedGrowth,
      traits: calculateTraits(profile.identity.professionId, retainedGrowth)
    };
    state.studentName = state.character.name;
    state.republicName = `The ${town.name} Republic`;
    state.republicMotto = '“E Pluribus Unum”';
    state.characterCreated = true;

    if (isNewCharacter) {
      state.level = 1;
      state.xp = 0;
      state.rp = 50;
      state.streak = 1;
      state.pillars = Object.fromEntries(data.pillars.map((pillar) => [pillar.id, 50]));
      state.completedQuests = [];
      state.dailyQuestIds = [];
      state.unlockedUnit = 1;
      state.inventory = [];
      addArtifact(profession.starterItem, profession.icon, 'gold');
    }

    editingCharacter = false;
    saveState();
    goToUnit1();
    showToast(isNewCharacter ? `${state.character.name} founded ${state.republicName}.` : 'Founder profile updated.');
  }

  function openTeacherMode() {
    openModal($('#teacherModal'));
  }

  function bindEvents() {
    $$('.nav-item').forEach((item) => item.addEventListener('click', () => {
      $$('.nav-item').forEach((nav) => { nav.classList.remove('active'); nav.removeAttribute('aria-current'); });
      item.classList.add('active');
      item.setAttribute('aria-current', 'page');
      const target = document.getElementById(item.dataset.section);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else showToast(`${item.textContent.trim()} is planned for the next build.`);
    }));

    $$('.filter-chip').forEach((chip) => chip.addEventListener('click', () => {
      $$('.filter-chip').forEach((filter) => filter.classList.remove('selected'));
      chip.classList.add('selected');
      renderQuests(chip.dataset.filter);
    }));

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

    $('#openUnit1MapButton')?.addEventListener('click', () => {
      window.location.href = 'unit1.html';
    });

    $('#submitAnswerButton').addEventListener('click', resolveQuest);
    $('#teacherModeButton').addEventListener('click', openTeacherMode);
    $('#editProfileButton').addEventListener('click', () => openCharacterForge(true));
    $('#exitForgeButton').addEventListener('click', exitCharacterForge);
    $('#creationBackButton').addEventListener('click', () => {
      if (creationStep > 0) {
        creationStep = Math.max(0, creationStep - 1);
        renderCharacterForge();
        return;
      }
      if (editingCharacter) {
        exitCharacterForge();
      }
    });

    $('#creationNextButton').addEventListener('click', () => {
      // Advance steps, or finalize on the last step
      if (creationStep < 3) {
        creationStep = Math.min(3, creationStep + 1);
        renderCharacterForge();
        return;
      }

      // Finalize: attempt to create a profile from the current draft
      try {
        const profile = createCharacterProfile({
          name: creationDraft.name,
          gender: creationDraft.gender,
          pronouns: creationDraft.pronouns,
          town: creationDraft.town,
          founderPathId: creationDraft.founderPathId,
          professionId: creationDraft.professionId,
          primarySkillId: creationDraft.primarySkillId,
          secondarySkillId: creationDraft.secondarySkillId,
          outfit: creationDraft.outfit
        });
        finishCharacterCreation(profile);
      } catch (err) {
        const message = err?.message || 'Please complete required fields.';
        showToast(message);
      }
    });
    $('#demoFounderButton').addEventListener('click', () => {
      const demoProfile = createCharacterProfile({
        name: 'Alex Morgan',
        gender: 'nonbinary',
        pronouns: 'they/them',
        town: 'philadelphia',
        founderPathId: 'orator',
        professionId: 'printer',
        primarySkillId: 'argument',
        secondarySkillId: 'evidence',
        outfit: {
          hat: 'tricorn',
          shirt: 'blue-vest',
          pants: 'navy-breeches',
          socks: 'blue-socks',
          shoes: 'buckled-shoes'
        }
      });
      finishCharacterCreation(demoProfile);
      showToast('Demo founder loaded. You can still customize every choice.');
    });

    $$('.teacher-controls [data-teacher-action]').forEach((button) => button.addEventListener('click', () => {
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
        state.unlockedUnit = Math.min(data.units.length, state.unlockedUnit + 1);
        render();
        showToast(`Unit ${state.unlockedUnit} is now unlocked.`);
      }
      if (action === 'reset') {
        storage.clear(STORAGE_KEY);
        clearProfile(DEFAULT_STORAGE_KEY);
        state = clone(initialState);
        closeModals();
        openCharacterForge(false);
        showToast('Demo progress reset. Create a new founder.');
      }
    }));

    $('#settingsButton').addEventListener('click', () => openInfoModal('Settings', 'This starter saves a founder profile and demo progress only to the current browser. The storage adapter is intentionally isolated in storage.js so that a future school-approved account system can sync progress between devices without rebuilding quests or character data.', 'Prototype Setting'));
    $('#helpButton').addEventListener('click', () => openInfoModal('How the Demo Works', 'Create a founder, choose a profession and starting wardrobe, then complete APUSH-style quests. Character traits are separate from Republic Pillars: traits represent individual skills; pillars represent the health of the student’s evolving republic.', 'Quick Start'));
    $('#eraDetailsButton').addEventListener('click', () => {
      const unit = data.units.find((entry) => entry.id === state.unlockedUnit) || data.units[0];
      openInfoModal(`Era ${unit.id}: ${unit.title}`, `This chapter covers ${unit.dates}. The full game can add unit goals, maps, source libraries, historical figures, writing practice, clothing unlocks, and a culminating boss battle to this campaign space.`, 'Current Era');
    });
    $('#viewRepublicButton').addEventListener('click', () => openInfoModal(state.republicName, 'A future Republic page can visualize civic choices: laws, alliances, population, stability, treasury, achievements, and a story journal. Historical outcomes should never become “win conditions”; the system should reward reasoning, evidence, collaboration, and reflection.', 'Republic Overview'));
    $('#viewAllInventoryButton').addEventListener('click', () => openInfoModal('Full Inventory', 'The starter displays earned historical artifacts. In later versions, artifacts can be grouped by era, source type, historical figure, profession, or skill—and can unlock lore entries, earned wardrobe, and optional class rewards.', 'Inventory'));

    $$('.modal-close').forEach((button) => button.addEventListener('click', closeModals));
    $('#modalBackdrop').addEventListener('click', closeModals);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (!$('#characterCreation').hidden && editingCharacter) exitCharacterForge();
        else closeModals();
      }
    });
  }

  bindEvents();
  if (state.characterCreated) {
    goToUnit1();
  } else {
    openCharacterForge(false);
  }
})();
