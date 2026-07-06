# Teacher Mode (Local Mock Infrastructure)

Teacher Mode is now implemented with a service boundary and mock persistence.

## Current State

- Runtime data service selector in [js/services/dataService.js](../js/services/dataService.js)
- Active mode defaults to `mock` in [js/config/quest-backend.config.js](../js/config/quest-backend.config.js)
- Full mock adapter in [js/services/mockDataService.js](../js/services/mockDataService.js)
- Supabase placeholder adapter in [js/services/supabaseDataService.js](../js/services/supabaseDataService.js)
- Teacher UI integrated in [js/quest app.js](../js/quest%20app.js)
- Teacher and grading styles in [css/quest-world.css](../css/quest-world.css)

## Teacher Features Implemented

- Teacher access modal with `Demo Teacher Sign In`
- Teacher session status shown in rail footer
- Exit Teacher Mode and return to student flow
- Command Center metrics and recent activity
- Quest Studio access controls (lock/unlock), duplicate, archive
- Submission Archive with grader launcher
- Unit Control state changes
- Roster and class view
- Historian analytics summary
- Teacher Settings panel with:
  - Announcements composer
  - CSV export generation
  - Demo data reset

## Student-Side Infrastructure Implemented

- Data-service driven quest feed for lock/open state
- Lock panel when a quest is visible but unavailable
- Draft saving routed through the data service
- Student bulletin section powered by announcements

## Notes

- This phase intentionally does not connect to Supabase.
- All teacher/student data is persisted in localStorage under a mock key.
- Existing Unit 1 visuals and quest flow remain intact.
