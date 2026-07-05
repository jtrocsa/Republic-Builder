import { FOUNDER_PATHS } from "../data/founderPaths.js";
import { PROFESSIONS } from "../data/professions.js";
import { HISTORIAN_SKILLS, SKILL_MAX, createStartingSkillScores } from "../data/historianSkills.js";
import { STARTER_OUTFIT_SLOTS, createDefaultOutfit } from "../data/starterOutfits.js";
import { createCharacterProfile, validateCharacterInput } from "../services/characterProfile.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderChoiceCards(items, fieldName, selectedId, content) {
  return items
    .map((item) => {
      const selected = item.id === selectedId;
      return `
        <label class="rb-choice-card ${selected ? "is-selected" : ""}">
          <input type="radio" name="${fieldName}" value="${item.id}" ${selected ? "checked" : ""} />
          ${content(item)}
        </label>
      `;
    })
    .join("");
}

function renderSkillBar(scores = {}) {
  return HISTORIAN_SKILLS.map((skill) => {
    const score = Number(scores[skill.id] ?? 5);
    const progress = Math.min(100, Math.max(0, (score / SKILL_MAX) * 100));

    return `
      <article class="rb-skill-stat" title="${escapeHtml(skill.officialName)} — ${escapeHtml(skill.description)}">
        <span class="rb-skill-icon" aria-hidden="true">${skill.icon}</span>
        <span class="rb-skill-label">${skill.label}</span>
        <strong class="rb-skill-value">${score} / ${SKILL_MAX}</strong>
        <span class="rb-skill-meter" aria-hidden="true"><span style="width: ${progress}%"></span></span>
      </article>
    `;
  }).join("");
}

function readFormState(form) {
  const data = new FormData(form);
  const outfit = Object.fromEntries(
    STARTER_OUTFIT_SLOTS.map((slot) => [slot.id, data.get(slot.id)])
  );

  return {
    name: data.get("name"),
    gender: data.get("gender"),
    pronouns: data.get("pronouns"),
    town: data.get("town"),
    founderPathId: data.get("founderPathId"),
    professionId: data.get("professionId"),
    primarySkillId: data.get("primarySkillId"),
    secondarySkillId: data.get("secondarySkillId"),
    outfit
  };
}

function getPreviewScores(form) {
  const state = readFormState(form);
  if (!state.primarySkillId || !state.secondarySkillId || state.primarySkillId === state.secondarySkillId) {
    return Object.fromEntries(HISTORIAN_SKILLS.map((skill) => [skill.id, 5]));
  }

  try {
    return createStartingSkillScores(state.primarySkillId, state.secondarySkillId);
  } catch {
    return Object.fromEntries(HISTORIAN_SKILLS.map((skill) => [skill.id, 5]));
  }
}

function updateSelectionState(form) {
  for (const card of form.querySelectorAll(".rb-choice-card")) {
    const input = card.querySelector("input");
    card.classList.toggle("is-selected", input.checked);
  }
}

function updateSkillPreview(form) {
  const preview = form.querySelector("[data-role='skill-preview']");
  preview.innerHTML = renderSkillBar(getPreviewScores(form));
}

export function renderCharacterCreation(root, { initialDraft = {}, onComplete } = {}) {
  if (!(root instanceof Element)) {
    throw new Error("renderCharacterCreation requires a valid DOM element mount point.");
  }

  const outfit = { ...createDefaultOutfit(), ...(initialDraft.outfit ?? {}) };

  root.innerHTML = `
    <section class="rb-character-creation" aria-labelledby="rb-creator-title">
      <header class="rb-creator-header">
        <p class="rb-eyebrow">REPUBLIC BUILDER · CHARACTER CREATION</p>
        <h1 id="rb-creator-title">Found a Life. Build a Republic.</h1>
        <p class="rb-creator-intro">Your Founder Path tells the world who you are. Your Historian Skills track how you grow through AP U.S. History.</p>
      </header>

      <form class="rb-creator-form" novalidate>
        <div class="rb-identity-grid">
          <section class="rb-panel rb-panel--identity" aria-labelledby="rb-identity-title">
            <div class="rb-panel-heading">
              <p class="rb-section-kicker">I. IDENTITY</p>
              <h2 id="rb-identity-title">Who enters the Republic?</h2>
            </div>

            <div class="rb-field-grid rb-field-grid--two">
              <label class="rb-field">
                <span>Character name</span>
                <input name="name" maxlength="32" required value="${escapeHtml(initialDraft.name ?? "")}" placeholder="Enter a name" />
              </label>
              <label class="rb-field">
                <span>Town</span>
                <input name="town" maxlength="48" required value="${escapeHtml(initialDraft.town ?? "")}" placeholder="e.g., Philadelphia" />
              </label>
              <label class="rb-field">
                <span>Character presentation</span>
                <select name="gender">
                  <option value="woman" ${(initialDraft.gender ?? "") === "woman" ? "selected" : ""}>Woman</option>
                  <option value="man" ${(initialDraft.gender ?? "") === "man" ? "selected" : ""}>Man</option>
                  <option value="nonbinary" ${(initialDraft.gender ?? "") === "nonbinary" ? "selected" : ""}>Nonbinary</option>
                  <option value="prefer-not-to-say" ${(initialDraft.gender ?? "prefer-not-to-say") === "prefer-not-to-say" ? "selected" : ""}>Prefer not to say</option>
                </select>
              </label>
              <label class="rb-field">
                <span>Pronouns <em>(optional)</em></span>
                <input name="pronouns" maxlength="32" value="${escapeHtml(initialDraft.pronouns ?? "")}" placeholder="e.g., she/her" />
              </label>
            </div>

            <div class="rb-outfit-block">
              <p class="rb-mini-label">Starter clothing</p>
              <p class="rb-muted">All Founders begin with a basic tunic. These early choices are expressive; future eras can add more items.</p>
              <div class="rb-outfit-grid">
                ${STARTER_OUTFIT_SLOTS.map((slot) => `
                  <label class="rb-field">
                    <span>${slot.label}</span>
                    <select name="${slot.id}">
                      ${slot.options.map((option) => `
                        <option value="${option.id}" ${outfit[slot.id] === option.id ? "selected" : ""}>${option.label}</option>
                      `).join("")}
                    </select>
                  </label>
                `).join("")}
              </div>
            </div>
          </section>

          <aside class="rb-panel rb-panel--principle">
            <p class="rb-section-kicker">THE CORE IDEA</p>
            <h2>Story identity is not academic ability.</h2>
            <p><strong>Founder Path</strong> changes story routes, town flavor, and cosmetics. <strong>Historian Skills</strong> grow only through demonstrated historical thinking.</p>
            <div class="rb-callout">
              <span aria-hidden="true">⚖</span>
              <p>Every student can develop every Historian Skill. No path grants answers or advantages on graded work.</p>
            </div>
          </aside>
        </div>

        <section class="rb-section" aria-labelledby="rb-profession-title">
          <div class="rb-section-heading">
            <div>
              <p class="rb-section-kicker">II. PROFESSION</p>
              <h2 id="rb-profession-title">What work anchors your community?</h2>
            </div>
            <p>Profession affects town economy, crafted items, and non-assessment quest flavor.</p>
          </div>
          <div class="rb-card-grid rb-card-grid--three" data-choice-group="professionId">
            ${renderChoiceCards(PROFESSIONS, "professionId", initialDraft.professionId, (profession) => `
              <span class="rb-card-icon">${profession.icon}</span>
              <span class="rb-card-title">${profession.label}</span>
              <span class="rb-card-body">${profession.description}</span>
              <span class="rb-card-foot">${profession.worldBonus}</span>
            `)}
          </div>
        </section>

        <section class="rb-section" aria-labelledby="rb-path-title">
          <div class="rb-section-heading">
            <div>
              <p class="rb-section-kicker">III. FOUNDER PATH</p>
              <h2 id="rb-path-title">Who are you in the Republic?</h2>
            </div>
            <p>Role-playing identity, dialogue flavor, optional story routes, and home-town style.</p>
          </div>
          <div class="rb-card-grid rb-card-grid--three" data-choice-group="founderPathId">
            ${renderChoiceCards(FOUNDER_PATHS, "founderPathId", initialDraft.founderPathId, (path) => `
              <span class="rb-card-icon">${path.icon}</span>
              <span class="rb-card-title">${path.label}</span>
              <span class="rb-card-body">${path.tagline}</span>
              <span class="rb-card-foot">Starter reward: ${path.starterReward}</span>
            `)}
          </div>
        </section>

        <section class="rb-section" aria-labelledby="rb-skill-title">
          <div class="rb-section-heading">
            <div>
              <p class="rb-section-kicker">IV. HISTORIAN FOCUS</p>
              <h2 id="rb-skill-title">How will you grow as a historian?</h2>
            </div>
            <p>Choose one Primary Focus and one different Secondary Focus. Each begins at +2; all skills can grow through the year.</p>
          </div>

          <div class="rb-focus-grid">
            <fieldset class="rb-focus-set">
              <legend>Primary Focus <span>+2</span></legend>
              ${HISTORIAN_SKILLS.map((skill) => `
                <label class="rb-focus-option">
                  <input type="radio" name="primarySkillId" value="${skill.id}" ${initialDraft.primarySkillId === skill.id ? "checked" : ""} />
                  <span><strong>${skill.icon} ${skill.label}</strong><small>${skill.description}</small></span>
                </label>
              `).join("")}
            </fieldset>

            <fieldset class="rb-focus-set">
              <legend>Secondary Focus <span>+2</span></legend>
              ${HISTORIAN_SKILLS.map((skill) => `
                <label class="rb-focus-option">
                  <input type="radio" name="secondarySkillId" value="${skill.id}" ${initialDraft.secondarySkillId === skill.id ? "checked" : ""} />
                  <span><strong>${skill.icon} ${skill.label}</strong><small>${skill.officialName}</small></span>
                </label>
              `).join("")}
            </fieldset>
          </div>
        </section>

        <section class="rb-skills-preview" aria-labelledby="rb-skills-preview-title">
          <div class="rb-preview-heading">
            <div>
              <p class="rb-section-kicker">STARTING PROFILE</p>
              <h2 id="rb-skills-preview-title">Historian Skills</h2>
            </div>
            <p>Scores represent growth in APUSH historical thinking—not a character's worth or a source of automatic answers.</p>
          </div>
          <div class="rb-skill-bar" data-role="skill-preview">
            ${renderSkillBar({})}
          </div>
        </section>

        <div class="rb-form-footer">
          <div class="rb-error" role="alert" aria-live="polite" data-role="errors"></div>
          <button type="submit" class="rb-submit-button">Begin Your Republic <span aria-hidden="true">→</span></button>
        </div>
      </form>
    </section>
  `;

  const form = root.querySelector("form");
  updateSelectionState(form);
  updateSkillPreview(form);

  form.addEventListener("input", () => {
    updateSelectionState(form);
    updateSkillPreview(form);
  });

  form.addEventListener("change", () => {
    updateSelectionState(form);
    updateSkillPreview(form);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const draft = readFormState(form);
    const validation = validateCharacterInput(draft);
    const errorElement = form.querySelector("[data-role='errors']");

    if (!validation.valid) {
      errorElement.innerHTML = validation.errors.map((message) => `<p>${escapeHtml(message)}</p>`).join("");
      errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    errorElement.innerHTML = "";
    const profile = createCharacterProfile(draft);

    if (typeof onComplete === "function") {
      onComplete(profile);
    }
  });

  return {
    getDraft: () => readFormState(form),
    getPreviewScores: () => getPreviewScores(form)
  };
}
