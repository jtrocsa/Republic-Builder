-- Optional demo seed.
-- Run only after creating at least one authenticated teacher user and replacing the placeholder UUID.
-- This file intentionally does not create auth.users.

-- 1) Replace this UUID with the Auth user ID for your first teacher.
--    Then insert their profile manually:
-- insert into public.profiles (id, role, display_name) values ('PUT-TEACHER-UUID-HERE', 'teacher', 'Teacher Name');

-- 2) After a teacher profile exists, use the following pattern in the SQL editor.
-- Replace all placeholders before running.

/*
with teacher as (
  select id from public.profiles where id = 'PUT-TEACHER-UUID-HERE'::uuid
), course as (
  insert into public.courses (owner_id, title, slug, description)
  select id, 'Atlantic Crossroads APUSH', 'atlantic-crossroads-apush', 'Republic Builder course shell' from teacher
  returning id, owner_id
), unit as (
  insert into public.units (course_id, order_index, title, subtitle, state, default_access_mode)
  select id, 1, 'Unit 1 Expedition', 'A New World', 'active', 'visible_locked' from course
  returning id, course_id
), quest as (
  insert into public.quests (unit_id, slug, quest_type, title, location_key, xp_reward, default_access_mode)
  select id, 'empires-reckoning', 'boss_battle', 'Empire''s Reckoning', 'atlantic-ocean', 100, 'visible_locked' from unit
  returning id
), version as (
  insert into public.quest_versions (quest_id, version_number, state, content_json, created_by, change_note)
  select q.id, 1, 'draft',
  jsonb_build_object(
    'schemaVersion', 1,
    'identity', jsonb_build_object(
      'title', 'Empire''s Reckoning',
      'questType', 'boss_battle',
      'xpReward', 100,
      'location', 'Atlantic Ocean',
      'mapMarker', jsonb_build_object('x', 51, 'y', 34, 'icon', 'boss', 'label', 'Empire''s Reckoning')
    ),
    'presentation', jsonb_build_object('heroKicker', 'SAQ SKIRMISH · OFFICIAL AP RUBRIC'),
    'sources', jsonb_build_array(jsonb_build_object(
      'id', 'source-columbus-1493',
      'title', 'Christopher Columbus, letter describing his first voyage, 1493',
      'citation', 'Christopher Columbus, 1493',
      'body', 'Their Highnesses may see that I shall give them as much gold as they need ... and spices and cotton.'
    )),
    'assessments', jsonb_build_array(jsonb_build_object(
      'id', 'saq',
      'label', 'SAQ Skirmish',
      'maxPoints', 3,
      'instructions', 'Use the excerpt below and your knowledge of United States history to answer all parts of the question.',
      'questions', jsonb_build_array(
        jsonb_build_object('id', 'part-a', 'label', 'A', 'maxPoints', 1, 'prompt', 'Briefly describe ONE motive for European exploration in the Americas that is reflected in the excerpt.', 'placeholder', 'Respond directly, with specific historical evidence.'),
        jsonb_build_object('id', 'part-b', 'label', 'B', 'maxPoints', 1, 'prompt', 'Briefly explain ONE way the Columbian Exchange changed Indigenous societies in the Americas between 1492 and 1607.', 'placeholder', 'Respond directly, with specific historical evidence.'),
        jsonb_build_object('id', 'part-c', 'label', 'C', 'maxPoints', 1, 'prompt', 'Briefly explain ONE additional development related to Atlantic exploration and colonization.', 'placeholder', 'Respond directly, with specific historical evidence.')
      )
    ))
  ),
  (select id from teacher), 'Initial Unit 1 boss battle'
  from quest q
  returning id, quest_id
)
update public.quests q
set published_version_id = v.id, current_draft_version_id = v.id, default_access_mode = 'available'
from version v
where q.id = v.quest_id;
*/
