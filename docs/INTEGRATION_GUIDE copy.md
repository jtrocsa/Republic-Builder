# Integration Guide — Add Atlantic Crossroads Without Replacing Your Project

## Do not replace these existing project files

Keep your current:

- `index.html`
- character creation files and character SVG assets
- existing `assets/` folder
- current global styles
- existing localStorage keys
- current README and `.gitignore`

This package is a quest-system add-on.

## Recommended copy plan

Copy the files into your existing repository like this:

```text
assets/maps/atlantic-crossroads-map.svg
css/quest-world.css
js/quests/data/unit1.js
js/quests/quest-store.js
js/quests/quest-app.js
pages/unit-1.html
```

For a first integration, you may instead preserve the working demo exactly and put the whole package in:

```text
features/unit-1-atlantic-crossroads/
```

Then link to `features/unit-1-atlantic-crossroads/index.html` from the game dashboard. This is the safest way to test it before folding its code into your main routing system.

## Character integration hook

The demo uses a decorative fallback portrait. Replace the `.portrait-fallback` element with the character image or SVG already selected in your character creator.

Recommended adapter shape:

```js
const playerProfile = {
  name: character.name,
  profession: character.profession,
  settlement: character.town,
  portraitSvg: character.previewSvg
};
```

Then render the player profile into `#player-name`, `#player-profession`, and `.portrait-frame`.

## Persistence integration

`js/store.js` uses one localStorage key:

```text
republicBuilder.unit1QuestState.v1
```

Keep it separate from your character-profile key. Later, you can replace only `loadState()` and `saveState()` with Firebase, Supabase, a school LMS API, or a teacher-export JSON file without rewriting the quest UI.

Recommended future save shape:

```js
{
  playerId: 'local-or-authenticated-user-id',
  questProgress: {
    unit1: {
      completed: {},
      attempts: {},
      xp: 0,
      skillGains: {}
    }
  }
}
```

## Teacher mode

The demo’s “Teacher scoring view” is intentionally a local toggle. In the production project, connect it to your existing teacher/admin authentication check before showing score checkboxes or any teacher-only data.

Student-facing behavior:

- Can draft and save answers.
- Can receive question rationales and model HIPP feedback.
- Can see rubric criteria.
- Cannot assign themselves official points.

Teacher-facing behavior:

- Can check criterion-level rubric points.
- Can review saved responses.
- Can use local scorecard data as a starting point for export or LMS grading.

## Next technical step

After integrating Unit 1, extract the common engine from `app.js` into separate reusable files:

```text
js/quests/engines/hipp-engine.js
js/quests/engines/royale-engine.js
js/quests/engines/vocab-engine.js
js/quests/engines/boss-engine.js
js/quests/ui/archive-drawer.js
js/quests/ui/map-hub.js
```

The `QUESTS`, `SOURCES`, and `RUBRICS` data structures already support that separation.
