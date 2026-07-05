import { STEPS, HOMETOWNS, PRONOUNS, GENDERS, APPEARANCE, CLOTHING, PROFESSIONS, PATHS, SKILLS, DEFAULT_STATE } from './data.js';
import { icon } from './icons.js';
import { createStorageAdapter } from './storage.js';
import { DEFAULT_STORAGE_KEY, createCharacterProfile, saveProfile } from '../src/services/characterProfile.js';

const STORAGE_KEY = 'republic-builder-character-forge-v1';
const storage = createStorageAdapter(STORAGE_KEY);
const stage = document.querySelector('#forge-stage');
const stepNav = document.querySelector('#step-nav');
const avatarMatteCache = new Map();
let state = hydrateState();

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function cloneDefault() { return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
function hydrateState() {
  const stored = storage.load(null);
  const savedProfile = window.localStorage.getItem(DEFAULT_STORAGE_KEY);
  const profile = savedProfile ? JSON.parse(savedProfile) : null;
  const base = cloneDefault();
  const savedStep = Number.isFinite(Number(stored?.currentStep)) ? Number(stored.currentStep) : 0;
  const normalizedStored = stored ? { ...stored, currentStep: Math.min(STEPS.length - 1, Math.max(0, savedStep)) } : null;
  const profileState = profile ? {
    currentStep: Math.min(STEPS.length - 1, Math.max(0, savedStep)),
    identity: {
      name: profile.identity?.name || base.identity.name,
      gender: profile.identity?.gender || base.identity.gender,
      pronouns: profile.identity?.pronouns || base.identity.pronouns,
      hometown: titleCase(profile.identity?.town || base.identity.hometown)
    },
    appearance: clone(profile.appearance || base.appearance),
    clothing: clone(profile.clothing || base.clothing),
    profession: profile.identity?.professionId || base.profession,
    path: profile.identity?.founderPathId || base.path,
    primarySkill: profile.historianFocus?.primarySkillId || base.primarySkill,
    secondarySkill: profile.historianFocus?.secondarySkillId || base.secondarySkill
  } : {};

  if (!stored && !profileState.identity) return base;
  return {
    ...base,
    ...normalizedStored,
    ...profileState,
    identity: { ...base.identity, ...(normalizedStored?.identity || {}), ...(profileState.identity || {}) },
    appearance: { ...base.appearance, ...(normalizedStored?.appearance || {}), ...(profileState.appearance || {}) },
    clothing: { ...base.clothing, ...(normalizedStored?.clothing || {}), ...(profileState.clothing || {}) }
  };
}
function save() { storage.save(state); }
function titleCase(value = '') { return String(value).replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[char])); }
function selection(collection, id) { return collection.find(item => item.id === id); }
function stepById(id) { return STEPS.findIndex(step => step.id === id); }
function showToast(message) {
  const toast = document.querySelector('#toast-template').content.firstElementChild.cloneNode(true);
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  setTimeout(() => { toast.classList.remove('is-visible'); setTimeout(() => toast.remove(), 250); }, 2800);
}

function slugifyTown(value = '') {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function mapClothingToOutfit(clothing = {}) {
  const hat = {
    'hat-none': 'hat-none',
    'hat-tricorn': 'tricorn',
    'hat-wide': 'wide-brim',
    'hat-coif': 'round-cap'
  }[clothing.hat] || 'hat-none';

  const shirt = {
    'shirt-linen': 'linen-shirt',
    'shirt-collar': 'blue-vest',
    'shirt-work': 'work-shirt'
  }[clothing.shirt] || 'basic-tunic';

  const pants = {
    'pants-breeches': 'navy-breeches',
    'pants-trousers': 'plain-trousers',
    'pants-skirt': 'striped-trousers'
  }[clothing.pants] || 'plain-trousers';

  const shoes = {
    'boots-work': 'work-boots',
    'boots-riding': 'riding-boots',
    'boots-shoes': 'buckled-shoes'
  }[clothing.boots] || 'simple-shoes';

  return { hat, shirt, pants, socks: 'wool-socks', shoes, special: 'locked-relic' };
}

function buildFounderProfile() {
  const historianSkills = Object.fromEntries(SKILLS.map((skill) => [skill.id, getSkillLevel(skill.id)]));
  return createCharacterProfile({
    name: state.identity.name,
    gender: state.identity.gender?.toLowerCase() === 'man' ? 'man' : 'woman',
    pronouns: state.identity.pronouns,
    town: slugifyTown(state.identity.hometown),
    founderPathId: state.path,
    professionId: state.profession,
    primarySkillId: state.primarySkill,
    secondarySkillId: state.secondarySkill,
    outfit: mapClothingToOutfit(state.clothing),
    appearance: clone(state.appearance),
    clothing: clone(state.clothing),
    historianSkills
  });
}

function saveFounderProfile() {
  const profile = buildFounderProfile();
  saveProfile(profile, DEFAULT_STORAGE_KEY);
  return profile;
}

function getSkillLevel(skillId) {
  if (!skillId) return 0;
  return 5 + (state.primarySkill === skillId ? 2 : 0) + (state.secondarySkill === skillId ? 2 : 0);
}
function isStepComplete(stepId) {
  if (stepId === 'identity') return Boolean(state.identity.name.trim() && state.identity.gender && state.identity.pronouns && state.identity.hometown);
  if (stepId === 'appearance' || stepId === 'clothing') return true;
  if (stepId === 'profession') return Boolean(state.profession);
  if (stepId === 'path') return Boolean(state.path);
  if (stepId === 'skills') return Boolean(state.primarySkill && state.secondarySkill && state.primarySkill !== state.secondarySkill);
  return true;
}
function isStepUnlocked(index) {
  return STEPS.slice(0, index).every(step => isStepComplete(step.id));
}
function nextStep() {
  const current = STEPS[state.currentStep];
  if (!isStepComplete(current.id)) {
    const messages = { identity: 'Add a founder name, pronouns, and hometown before continuing.', profession: 'Choose a profession to continue.', path: 'Choose a Founder Path to continue.', skills: 'Choose two different Historian Skills to continue.' };
    showToast(messages[current.id] || 'Complete this selection before continuing.');
    return;
  }

  if (current.id === 'review') {
    saveFounderProfile();
    window.location.href = '../../index.html';
    return;
  }

  state.currentStep = Math.min(state.currentStep + 1, STEPS.length - 1);
  save(); render();
}
function previousStep() { state.currentStep = Math.max(0, state.currentStep - 1); save(); render(); }
function selectValue(section, key, value) { state[section][key] = value; save(); render(); }
function selectTopLevel(key, value) { state[key] = value; save(); render(); }
function capitalize(value) { return value.charAt(0).toUpperCase() + value.slice(1); }

function renderNav() {
  stepNav.innerHTML = STEPS.map((step, index) => {
    const active = index === state.currentStep;
    const complete = isStepComplete(step.id) && index < state.currentStep;
    const unlocked = isStepUnlocked(index);
    return `<button class="step-button ${active ? 'is-active' : ''} ${complete ? 'is-complete' : ''}" type="button" data-go-step="${index}" ${unlocked ? '' : 'disabled'} aria-current="${active ? 'step' : 'false'}"><span class="step-number">${complete ? '✓' : step.number}</span><span><strong>${step.title}</strong><small>${step.subtitle}</small></span></button>`;
  }).join('');
}

function header(step) {
  return '';
}
function renderControls({ back = true, next = true, nextLabel = 'Continue' } = {}) {
  return '';
}
function avatarSvg() {
  const gender = (state.identity.gender || 'Woman').toLowerCase();
  const baseSrc = gender === 'man'
    ? '../../assets/character/base/Man.png'
    : '../../assets/character/base/woman.png';
  const baseAlt = gender === 'man' ? 'Base man founder model' : 'Base woman founder model';
  return `<img class="founder-avatar founder-avatar-image" src="${baseSrc}" data-base-src="${baseSrc}" alt="${baseAlt}" loading="eager" decoding="async" />`;
}

function removeWhiteMatteFromAvatar(src) {
  if (avatarMatteCache.has(src)) return Promise.resolve(avatarMatteCache.get(src));

  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        avatarMatteCache.set(src, src);
        resolve(src);
        return;
      }

      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let index = 0; index < data.length; index += 4) {
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];
        if (a === 0) continue;

        const minChannel = Math.min(r, g, b);
        const maxChannel = Math.max(r, g, b);
        const spread = maxChannel - minChannel;

        // Remove hard white matte and soften near-white anti-aliased edges.
        if (r > 244 && g > 244 && b > 244) {
          data[index + 3] = 0;
        } else if (r > 224 && g > 224 && b > 224 && spread < 18) {
          const fade = Math.max(0, (244 - maxChannel) / 20);
          data[index + 3] = Math.round(a * fade);
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Auto-crop transparent margins so the figure centers naturally in preview.
      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = -1;
      let maxY = -1;
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const alpha = data[(y * canvas.width + x) * 4 + 3];
          if (alpha > 8) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }

      let cleaned;
      if (maxX >= minX && maxY >= minY) {
        const pad = 6;
        const cropX = Math.max(0, minX - pad);
        const cropY = Math.max(0, minY - pad);
        const cropW = Math.min(canvas.width - cropX, (maxX - minX + 1) + pad * 2);
        const cropH = Math.min(canvas.height - cropY, (maxY - minY + 1) + pad * 2);
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropW;
        croppedCanvas.height = cropH;
        const croppedCtx = croppedCanvas.getContext('2d');
        if (croppedCtx) {
          croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
          cleaned = croppedCanvas.toDataURL('image/png');
        }
      }

      if (!cleaned) cleaned = canvas.toDataURL('image/png');
      avatarMatteCache.set(src, cleaned);
      resolve(cleaned);
    };
    image.onerror = () => {
      avatarMatteCache.set(src, src);
      resolve(src);
    };
    image.src = src;
  });
}

function hydrateAvatarImages() {
  const avatarImages = document.querySelectorAll('.founder-avatar-image[data-base-src]');
  avatarImages.forEach((image) => {
    const source = image.getAttribute('data-base-src');
    if (!source || image.dataset.cleaned === 'true') return;
    removeWhiteMatteFromAvatar(source).then((cleanedSource) => {
      image.src = cleanedSource;
      image.dataset.cleaned = 'true';
    });
  });
}
function makeChoiceButton({ section, key, item, selected, type = 'chip' }) {
  if (type === 'card') return `<button type="button" class="choice-card ${selected ? 'is-selected' : ''}" data-select="${section}" data-key="${key}" data-value="${item.id}" aria-pressed="${selected}">${icon(item.icon, 'choice-icon')}<strong>${item.title}</strong><span>${item.short}</span></button>`;
  if (type === 'compact') return `<button type="button" class="choice-card choice-card--compact ${selected ? 'is-selected' : ''}" data-select="${section}" data-key="${key}" data-value="${item.id}" aria-pressed="${selected}">${icon(item.icon, 'choice-icon')}<strong>${item.title}</strong></button>`;
  return `<button type="button" class="choice-chip ${selected ? 'is-selected' : ''}" data-select="${section}" data-key="${key}" data-value="${item.id}" aria-pressed="${selected}"><span class="swatch ${item.id}"></span><span>${item.label}</span></button>`;
}
function colorChoice(key, item, selected) {
  return `<button type="button" class="color-choice ${selected ? 'is-selected' : ''}" data-select="appearance" data-key="${key}" data-value="${item.id}" aria-label="${item.label}" aria-pressed="${selected}"><span class="color-dot ${item.id}"></span><span>${item.label}</span></button>`;
}
function getFormSelect(label, key, options, value) {
  return `<label class="field-label"><span>${label}</span><select data-input="identity" data-key="${key}">${options.map(option => `<option value="${escapeHtml(option)}" ${option === value ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select></label>`;
}

function identityScreen(step) {
  return `
    <div class="forge-step-copy">
      <p class="forge-step-heading">Who are you?</p>
      <p class="forge-step-text">Every founder begins with a name, a voice, and a hometown. These choices personalize the story and do not change any APUSH answer or rubric score.</p>
    </div>

    <div class="forge-form-stack">
      <label class="forge-field">
        <span>Founder name</span>
        <input data-input="identity" data-key="name" maxlength="28" value="${escapeHtml(state.identity.name)}" autocomplete="name" />
      </label>

      ${getFormSelect('Gender', 'gender', GENDERS, state.identity.gender)}
      ${getFormSelect('Pronouns', 'pronouns', PRONOUNS, state.identity.pronouns)}
      ${getFormSelect('Home town', 'hometown', HOMETOWNS, state.identity.hometown)}
    </div>

    <div class="forge-note-inline">
      <span class="note-icon">✦</span>
      <p>Your identity stays local and can be revised before review.</p>
    </div>
  `;
}
function appearanceScreen(step) {
  return `
    <div class="forge-step-copy">
      <p class="forge-step-heading">Appearance</p>
      <p class="forge-step-text">Build the face and silhouette of your founder. The preview updates immediately as you choose features.</p>
    </div>

    <div class="forge-option-grid forge-option-grid--tight">
      <div class="forge-option-block">
        <h3>Face</h3>
        <div class="forge-chip-grid">
          ${APPEARANCE.face.map(item => makeChoiceButton({ section: 'appearance', key: 'face', item, selected: state.appearance.face === item.id })).join('')}
        </div>
      </div>

      <div class="forge-option-block">
        <h3>Hair</h3>
        <div class="forge-chip-grid">
          ${APPEARANCE.hair.map(item => makeChoiceButton({ section: 'appearance', key: 'hair', item, selected: state.appearance.hair === item.id })).join('')}
        </div>
      </div>

      <div class="forge-option-block">
        <h3>Skin Tone</h3>
        <div class="forge-chip-grid forge-chip-grid--skin">
          ${APPEARANCE.skin.map(item => colorChoice('skin', item, state.appearance.skin === item.id)).join('')}
        </div>
      </div>

      <div class="forge-option-block">
        <h3>Eye Color</h3>
        <div class="forge-chip-grid forge-chip-grid--skin">
          ${APPEARANCE.eyes.map(item => colorChoice('eyes', item, state.appearance.eyes === item.id)).join('')}
        </div>
      </div>
    </div>
  `;
}
function clothingScreen(step) {
  const rows = Object.entries(CLOTHING).map(([key, items]) => `<div class="forge-option-block"><h3>${capitalize(key)}</h3><div class="forge-choice-list">${items.map(item => `<button type="button" class="wardrobe-choice ${state.clothing[key] === item.id ? 'is-selected' : ''}" data-select="clothing" data-key="${key}" data-value="${item.id}" aria-pressed="${state.clothing[key] === item.id}"><span><strong>${item.label}</strong><small>${item.description}</small></span><span class="chevron">›</span></button>`).join('')}</div></div>`).join('');
  return `
    <div class="forge-step-copy">
      <p class="forge-step-heading">Clothing</p>
      <p class="forge-step-text">Choose a wardrobe that fits the world and updates the founder preview immediately.</p>
    </div>

    <div class="forge-option-grid">
      ${rows}
    </div>
  `;
}
function professionScreen(step) {
  const selected = selection(PROFESSIONS, state.profession);
  return `
    <div class="forge-step-copy">
      <p class="forge-step-heading">Choose a profession</p>
      <p class="forge-step-text">Profession affects town flavor, cosmetics, and small world bonuses. It does not change APUSH answer correctness.</p>
    </div>

    <div class="forge-icon-clump">
      ${PROFESSIONS.map(item => makeChoiceButton({ section: 'top', key: 'profession', item, selected: state.profession === item.id, type: 'compact' })).join('')}
    </div>

    <div class="forge-detail-card forge-detail-card--compact ${selected ? '' : 'empty'}">
      ${selected ? `${icon(selected.icon, 'detail-icon')}<p class="eyebrow">Selected profession</p><h3>${selected.title}</h3><p>${selected.bonus}</p>` : '<p class="empty-copy">Select a profession to see its town role, cosmetic, and practice-quest flavor.</p>'}
    </div>
  `;
}
function pathScreen(step) {
  const selected = selection(PATHS, state.path);
  return `
    <div class="forge-step-copy">
      <p class="forge-step-heading">Founder Path</p>
      <p class="forge-step-text">Choose the identity layer that shapes dialogue, story routes, and small resource bonuses.</p>
    </div>

    <div class="forge-icon-clump forge-icon-clump--path">
      ${PATHS.map(item => `<button type="button" class="path-choice path-choice--compact ${state.path === item.id ? 'is-selected' : ''}" data-select="top" data-key="path" data-value="${item.id}" aria-pressed="${state.path === item.id}">${icon(item.icon, 'path-icon')}<strong>${item.title}</strong></button>`).join('')}
    </div>

    <div class="forge-detail-card forge-detail-card--compact">
      ${selected ? `<div class="path-seal">${icon(selected.icon)}</div><p class="eyebrow">Selected path</p><h3>${selected.title}</h3><p>${selected.short}</p><div class="lore-panel">${selected.effect}</div>` : '<div class="path-seal muted">?</div><h3>Choose your leadership style</h3><p>Every path matters to the world, not to a test score.</p>'}
    </div>
  `;
}
function skillRow(skill) {
  const level = getSkillLevel(skill.id);
  const tag = state.primarySkill === skill.id ? 'Primary +2' : state.secondarySkill === skill.id ? 'Secondary +2' : 'Base';
  return `<div class="skill-row"><span class="skill-icon">${icon(skill.icon)}</span><span><strong>${skill.title}</strong><small>${skill.definition}</small></span><span class="skill-level">${level}/20</span><span class="skill-tag ${tag === 'Base' ? '' : 'boosted'}">${tag}</span></div>`;
}
function skillSelect(title, key, current) {
  return `<label class="skill-select"><span>${title}</span><select data-skill-select="${key}"><option value="">Select a skill</option>${SKILLS.map(skill => `<option value="${skill.id}" ${current === skill.id ? 'selected' : ''} ${key === 'secondarySkill' && state.primarySkill === skill.id ? 'disabled' : ''}>${skill.title}</option>`).join('')}</select></label>`;
}
function skillsScreen(step) {
  return `
    <div class="forge-step-copy">
      <p class="forge-step-heading">Historian Skills</p>
      <p class="forge-step-text">All six skills start at 5/20. Pick one Primary and one different Secondary skill for the +2 starting boost.</p>
    </div>

    <section class="forge-skill-note">
      <p>Skills track real APUSH growth. They never grant answer advantages on graded assessments.</p>
    </section>

    <div class="forge-skill-selectors">
      ${skillSelect('Primary Skill', 'primarySkill', state.primarySkill)}
      ${skillSelect('Secondary Skill', 'secondarySkill', state.secondarySkill)}
    </div>

    <div class="forge-note-inline">
      <span class="note-icon">✦</span>
      <p>Primary and secondary skills must be different.</p>
    </div>
  `;
}
function reviewLine(label, value, detail = '') { return `<div class="review-line"><span>${label}</span><strong>${value}</strong>${detail ? `<small>${detail}</small>` : ''}</div>`; }
function reviewScreen(step) {
  const profession = selection(PROFESSIONS, state.profession);
  const path = selection(PATHS, state.path);
  return `
    <div class="forge-step-copy">
      <p class="forge-step-heading">Review</p>
      <p class="forge-step-text">Confirm every choice before the founder is saved and sent into the republic.</p>
    </div>

    <div class="forge-review-grid">
      <div class="forge-review-card">
        ${reviewLine('Name', escapeHtml(state.identity.name))}
        ${reviewLine('Pronouns', escapeHtml(state.identity.pronouns))}
        ${reviewLine('Hometown', escapeHtml(state.identity.hometown))}
        ${reviewLine('Profession', profession?.title || 'Not selected')}
        ${reviewLine('Founder Path', path?.title || 'Not selected')}
        ${reviewLine('Primary Skill', selection(SKILLS, state.primarySkill)?.title || 'Not selected', `${getSkillLevel(state.primarySkill)}/20`)}
        ${reviewLine('Secondary Skill', selection(SKILLS, state.secondarySkill)?.title || 'Not selected', `${getSkillLevel(state.secondarySkill)}/20`)}
      </div>

      <div class="forge-review-art">
        <div class="stage-rim"></div>
        ${avatarSvg()}
      </div>
    </div>
  `;
}
function createdScreen(step) {
  const path = selection(PATHS, state.path);
  return `${header(step)}<div class="created-layout"><div class="created-hero"><div class="hero-crest"><img src="../../assets/art/forge-crest.svg" alt="" /></div><p class="eyebrow">Welcome to the Republic</p><h2>${escapeHtml(state.identity.name || 'Founder')}</h2><p>Your ${path?.title || 'chosen'} path begins now. Your knowledge will grow through practice, feedback, and demonstrated historical thinking.</p><div class="created-skills">${SKILLS.map(skill => `<div>${icon(skill.icon)}<strong>${getSkillLevel(skill.id)}/20</strong><span>${skill.title}</span></div>`).join('')}</div><button class="button button-primary button-large" type="button" data-action="enter">Enter the Republic <span aria-hidden="true">→</span></button><button class="text-button centered" type="button" data-action="download">Download founder profile</button></div><div class="created-art">${avatarSvg()}</div></div>${renderControls({ next: false })}`;
}

function screenFor(step) {
  const screens = { identity: identityScreen, profession: professionScreen, path: pathScreen, skills: skillsScreen, review: reviewScreen };
  return screens[step.id](step);
}

function renderSummaryPanel() {
  const profession = selection(PROFESSIONS, state.profession);
  const path = selection(PATHS, state.path);
  const summaryItems = [
    { label: 'Name', value: state.identity.name || 'Aria', iconName: 'seal' },
    { label: 'Pronouns', value: state.identity.pronouns || 'She / Her', iconName: 'quill' },
    { label: 'Hometown', value: state.identity.hometown || 'Philadelphia', iconName: 'book' },
    { label: 'Profession', value: profession?.title || '—', iconName: 'anvil' },
    { label: 'Founder Path', value: path?.title || '—', iconName: 'compass' },
    { label: 'Primary Skill', value: selection(SKILLS, state.primarySkill)?.title || '—', iconName: 'torch' },
    { label: 'Secondary Skill', value: selection(SKILLS, state.secondarySkill)?.title || '—', iconName: 'seal' }
  ];

  const summaryList = document.querySelector('#forge-summary-list');
  if (summaryList) {
    summaryList.innerHTML = summaryItems.map((item) => `
      <div class="forge-summary-row">
        <span class="forge-summary-icon">${icon(item.iconName)}</span>
        <span class="forge-summary-label">${item.label}</span>
        <strong class="forge-summary-value">${escapeHtml(item.value)}</strong>
      </div>
    `).join('');
  }

  const avatarName = document.querySelector('#forge-avatar-name');
  if (avatarName) avatarName.textContent = state.identity.name || 'Your Founder';
  const avatarSubtitle = document.querySelector('#forge-avatar-subtitle');
  if (avatarSubtitle) avatarSubtitle.textContent = `of ${state.identity.hometown || 'Philadelphia'}`;

  const nextText = {
    identity: 'Choose a profession to define your role in the republic.',
    profession: 'Choose a Founder Path to shape your founder’s story.',
    path: 'Choose a Primary Skill and a different Secondary Skill.',
    skills: 'Review every choice before entering the republic.',
    review: 'Enter the Republic'
  }[STEPS[state.currentStep]?.id] || 'Continue';

  const nextLabel = document.querySelector('#forge-next-label');
  if (nextLabel) nextLabel.textContent = nextText;

  const nextButton = document.querySelector('.forge-continue[data-action="next"]');
  if (nextButton) nextButton.textContent = state.currentStep === STEPS.length - 1 ? 'Enter the Republic' : `Next: ${STEPS[state.currentStep + 1]?.title || 'Continue'}`;

  const stepMeta = document.querySelector('#forge-step-meta');
  if (stepMeta) stepMeta.textContent = `Step ${state.currentStep + 1} of ${STEPS.length}`;
  const stepTitle = document.querySelector('#forge-step-title');
  if (stepTitle) stepTitle.textContent = STEPS[state.currentStep]?.title || 'Identity';

  const nextSteps = document.querySelector('#forge-next-steps');
  if (nextSteps) nextSteps.innerHTML = `<p class="eyebrow">Next steps</p><p>${escapeHtml(nextText)}</p>`;
}

function renderSkillStrip() {
  const strip = document.querySelector('#forge-skill-strip');
  if (!strip) return;

  const scores = state.primarySkill && state.secondarySkill && state.primarySkill !== state.secondarySkill
    ? Object.fromEntries(SKILLS.map((skill) => [skill.id, getSkillLevel(skill.id)]))
    : Object.fromEntries(SKILLS.map((skill) => [skill.id, 5]));

  strip.innerHTML = SKILLS.map((skill) => `
    <article class="forge-skill-card ${state.primarySkill === skill.id || state.secondarySkill === skill.id ? 'is-boosted' : ''}">
      <span class="forge-skill-icon">${icon(skill.icon)}</span>
      <strong>${skill.title}</strong>
      <span>${scores[skill.id]}/20</span>
    </article>
  `).join('');
}

function render() {
  renderNav();
  const step = STEPS[state.currentStep];
  stage.innerHTML = screenFor(step);
  const avatar = document.querySelector('#forge-avatar');
  if (avatar) avatar.innerHTML = avatarSvg();
  hydrateAvatarImages();
  renderSummaryPanel();
  renderSkillStrip();
  document.querySelector('#forge-main')?.focus({ preventScroll: true });
}

function downloadProfile() {
  const profile = buildFounderProfile();
  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const anchor = Object.assign(document.createElement('a'), { href, download: `${(state.identity.name || 'founder').trim().replace(/\s+/g, '-').toLowerCase()}-profile.json` });
  anchor.click();
  URL.revokeObjectURL(href);
}

stepNav.addEventListener('click', event => {
  const target = event.target.closest('[data-go-step]');
  if (!target || target.disabled) return;
  state.currentStep = Number(target.dataset.goStep); save(); render();
});
stage.addEventListener('input', event => {
  const input = event.target.closest('[data-input]');
  if (!input) return;
  const { key } = input.dataset;
  state.identity[key] = input.value; save();
  if (key === 'name') { const caption = document.querySelector('#forge-avatar-name'); if (caption) caption.textContent = input.value || 'Unnamed Founder'; }
  renderSummaryPanel();
});
stage.addEventListener('change', event => {
  const input = event.target.closest('[data-input]');
  if (input) { state.identity[input.dataset.key] = input.value; save(); render(); return; }
  const skill = event.target.closest('[data-skill-select]');
  if (skill) {
    const key = skill.dataset.skillSelect;
    const value = skill.value || null;
    if (key === 'primarySkill' && value && value === state.secondarySkill) state.secondarySkill = null;
    if (key === 'secondarySkill' && value && value === state.primarySkill) { showToast('Primary and Secondary Skills must be different.'); return; }
    state[key] = value; save(); render();
  }
});
document.querySelector('#forge-main')?.addEventListener('click', event => {
  const selectionButton = event.target.closest('[data-select]');
  if (selectionButton) {
    const { select, key, value } = selectionButton.dataset;
    if (select === 'top') selectTopLevel(key, value); else selectValue(select, key, value);
    return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'next') nextStep();
  if (action === 'back') previousStep();
  if (action === 'download') downloadProfile();
  if (action === 'enter') {
    saveFounderProfile();
    window.location.href = '../../index.html';
  }
});
document.querySelector('#reset-character').addEventListener('click', () => {
  if (!window.confirm('Start over? This resets the locally saved founder.')) return;
  storage.clear();
  window.localStorage.removeItem(DEFAULT_STORAGE_KEY);
  state = cloneDefault();
  save();
  render();
  showToast('A new founder is ready to forge.');
});
render();
