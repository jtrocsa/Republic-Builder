# 05 — Quest Version Content Schema

Quest content should be data, not hard-coded HTML. The renderer can still produce the same rich existing UI.

```json
{
  "schemaVersion": 1,
  "identity": {
    "title": "Empire’s Reckoning",
    "subtitle": "Unit 1 Writing Boss",
    "questType": "boss_battle",
    "assessmentTypes": ["saq", "leq", "dbq"],
    "xpReward": 100,
    "location": "Atlantic Ocean",
    "mapMarker": {
      "x": 51,
      "y": 34,
      "icon": "boss",
      "label": "Empire’s Reckoning"
    }
  },
  "presentation": {
    "heroKicker": "SAQ SKIRMISH · OFFICIAL AP RUBRIC",
    "heroDescription": "Face the Unit 1 writing boss...",
    "theme": "boss-battle"
  },
  "sources": [
    {
      "id": "source-columbus-1493",
      "title": "Christopher Columbus, letter describing his first voyage, 1493",
      "citation": "Christopher Columbus, 1493",
      "body": "Their Highnesses may see...",
      "imageUrl": null,
      "altText": ""
    }
  ],
  "assessments": [
    {
      "id": "saq",
      "label": "SAQ Skirmish",
      "maxPoints": 3,
      "instructions": "Use the excerpt below...",
      "responseSettings": {
        "autosave": true,
        "allowResubmit": false
      },
      "questions": [
        {
          "id": "part-a",
          "label": "A",
          "prompt": "Briefly describe ONE motive...",
          "placeholder": "Respond directly, with specific historical evidence.",
          "responseType": "textarea",
          "maxPoints": 1,
          "rubricKey": "saq-part-a"
        },
        {
          "id": "part-b",
          "label": "B",
          "prompt": "Briefly explain ONE way...",
          "placeholder": "Respond directly, with specific historical evidence.",
          "responseType": "textarea",
          "maxPoints": 1,
          "rubricKey": "saq-part-b"
        },
        {
          "id": "part-c",
          "label": "C",
          "prompt": "Briefly explain ONE additional...",
          "placeholder": "Respond directly, with specific historical evidence.",
          "responseType": "textarea",
          "maxPoints": 1,
          "rubricKey": "saq-part-c"
        }
      ]
    }
  ],
  "rubrics": {
    "saq-part-a": {
      "maxPoints": 1,
      "criteria": [
        {
          "points": 1,
          "label": "Accurately responds to Part A",
          "description": "Accurately responds to the specific Part A prompt with the appropriate level of description or explanation."
        },
        {
          "points": 0,
          "label": "Does not earn the point",
          "description": "Does not meet the criteria."
        }
      ]
    }
  },
  "rewards": {
    "xp": 100,
    "items": [],
    "historianSkillAwards": []
  }
}
```

## Editing rules

- Validate `schemaVersion`, required IDs, and unique question IDs before save/publish.
- Store primary-source text, prompts, and rubrics in versioned JSON.
- Store map placement and release state outside a student response.
- Never delete a version referenced by an assignment or submission.
