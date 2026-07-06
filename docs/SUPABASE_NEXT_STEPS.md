# Supabase Next Steps

This project now includes a mock-first data-service boundary. Use this checklist to connect Supabase safely.

## 1. Prepare Supabase Project

1. Create a Supabase project.
2. Enable email auth (or your preferred auth provider).
3. Run SQL files in order:
   - [database/00_schema.sql](../database/00_schema.sql)
   - [database/01_security_and_rls.sql](../database/01_security_and_rls.sql)
   - [database/02_functions_and_triggers.sql](../database/02_functions_and_triggers.sql)
4. Optionally run [database/03_seed_demo.sql](../database/03_seed_demo.sql) after creating a real teacher profile.

## 2. Configure Frontend

1. Copy [js/config/quest-backend.config.js](../js/config/quest-backend.config.js) values for production deployment.
2. Set:
   - `mode: 'supabase'`
   - `supabaseUrl`
   - `supabaseAnonKey`
3. Never place service-role keys in client code.

## 3. Implement Supabase Adapter

File: [js/services/supabaseDataService.js](../js/services/supabaseDataService.js)

Required method groups:

- Session/auth:
  - `getCurrentSession`
  - `signOut`
- Teacher workflows:
  - class dashboard, quest studio, access rules, unit control
- Submission and grading:
  - list submissions
  - load frozen version content
  - rubric scoring + return/revision flow
- Student workflows:
  - quest feed
  - lock resolution
  - draft/save/submit
  - announcements

Prefer RPC calls for student-facing content visibility (per RLS design).

## 4. Validate Access Security

1. Confirm students cannot query hidden quest content directly.
2. Confirm teachers only see their own classes.
3. Confirm score visibility honors `is_visible_to_student`.
4. Confirm assignment version freezing remains intact after publishing new drafts.

## 5. Migration Strategy

1. Keep mock mode as fallback during implementation.
2. Implement one service method group at a time.
3. Feature-test each section in Teacher Mode after wiring:
   - Command Center
   - Quest Studio
   - Submission Archive
   - Unit Control
   - Roster
   - Historian Analytics
   - Settings/Announcements
4. Switch default mode to `supabase` only after full parity.
