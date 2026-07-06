-- Run after 01_security_and_rls.sql.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.attach_updated_at_trigger(p_table regclass)
returns void
language plpgsql
as $$
begin
  execute format('drop trigger if exists set_updated_at on %s', p_table);
  execute format('create trigger set_updated_at before update on %s for each row execute function public.set_updated_at()', p_table);
end;
$$;

select public.attach_updated_at_trigger('public.profiles');
select public.attach_updated_at_trigger('public.courses');
select public.attach_updated_at_trigger('public.classes');
select public.attach_updated_at_trigger('public.units');
select public.attach_updated_at_trigger('public.quests');
select public.attach_updated_at_trigger('public.quest_access_rules');
select public.attach_updated_at_trigger('public.student_quest_assignments');
select public.attach_updated_at_trigger('public.submissions');
select public.attach_updated_at_trigger('public.rubric_scores');
select public.attach_updated_at_trigger('public.teacher_feedback_bank');
select public.attach_updated_at_trigger('public.student_progress');
select public.attach_updated_at_trigger('public.historian_skills');

create or replace function public.quest_course_id(p_quest_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select u.course_id from public.quests q join public.units u on u.id = q.unit_id where q.id = p_quest_id
$$;

create or replace function public.is_quest_prerequisite_complete(p_student_id uuid, p_class_id uuid, p_quest_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.quest_prerequisites qp
    left join public.student_quest_assignments a
      on a.quest_id = qp.required_quest_id
      and a.student_id = p_student_id
      and a.class_id = p_class_id
    where qp.quest_id = p_quest_id
      and coalesce(a.status, 'not_started') not in ('graded', 'completed')
  )
$$;

-- Returns the effective student access state. This is the single source of truth for lock/unlock logic.
create or replace function public.resolve_student_quest_access(p_student_id uuid, p_class_id uuid, p_quest_id uuid)
returns table (
  access_mode text,
  can_see boolean,
  can_open boolean,
  can_submit boolean,
  note_to_student text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_quest public.quests%rowtype;
  v_unit public.units%rowtype;
  v_rule public.quest_access_rules%rowtype;
  v_assignment public.student_quest_assignments%rowtype;
  v_mode text;
  v_unlock_at timestamptz;
  v_lock_at timestamptz;
  v_allow_submission boolean;
  v_note text;
begin
  select q.* into v_quest from public.quests q where q.id = p_quest_id;
  if not found then
    raise exception 'Quest not found';
  end if;

  select u.* into v_unit from public.units u where u.id = v_quest.unit_id;
  if not exists (select 1 from public.class_members cm where cm.class_id = p_class_id and cm.student_id = p_student_id) then
    raise exception 'Student is not a member of this class';
  end if;

  if v_unit.state in ('draft', 'archived') or v_quest.default_access_mode = 'archived' then
    return query select 'archived', false, false, false, null::text;
    return;
  end if;

  select * into v_assignment from public.student_quest_assignments
  where quest_id = p_quest_id and class_id = p_class_id and student_id = p_student_id;

  select * into v_rule from public.quest_access_rules
  where quest_id = p_quest_id and class_id = p_class_id;

  v_mode := coalesce(v_assignment.access_override, v_rule.access_mode, v_quest.default_access_mode, v_unit.default_access_mode, 'hidden');
  v_unlock_at := coalesce(v_assignment.override_unlock_at, v_rule.unlock_at, v_quest.unlock_at, v_unit.unlock_at);
  v_lock_at := coalesce(v_assignment.override_lock_at, v_rule.lock_at, v_quest.lock_at, v_unit.lock_at);
  v_allow_submission := coalesce(v_assignment.allow_submission_override, v_rule.allow_submission, true);
  v_note := coalesce(v_assignment.override_note, v_rule.note_to_student);

  if v_lock_at is not null and now() >= v_lock_at then
    v_mode := 'review_only';
  elsif v_mode = 'scheduled' and (v_unlock_at is null or now() < v_unlock_at) then
    return query select 'scheduled', coalesce(v_rule.visible_before_unlock, true), false, false,
      coalesce(v_note, 'This quest is scheduled to unlock later.');
    return;
  elsif v_unlock_at is not null and now() < v_unlock_at then
    return query select 'scheduled', coalesce(v_rule.visible_before_unlock, true), false, false,
      coalesce(v_note, 'This quest is scheduled to unlock later.');
    return;
  end if;

  if v_mode = 'hidden' then
    return query select 'hidden', false, false, false, null::text;
    return;
  end if;

  if v_mode = 'visible_locked' then
    return query select 'visible_locked', true, false, false,
      coalesce(v_note, 'This quest is locked.');
    return;
  end if;

  if not public.is_quest_prerequisite_complete(p_student_id, p_class_id, p_quest_id) then
    return query select 'visible_locked', true, false, false,
      coalesce(v_note, 'Complete the required quest before continuing.');
    return;
  end if;

  if v_mode = 'review_only' then
    return query select 'review_only', true, true, false,
      coalesce(v_note, 'This quest is available for review only.');
    return;
  end if;

  return query select 'available', true, true, v_allow_submission,
    coalesce(v_note, null::text);
end;
$$;

-- Creates the student's frozen assignment and version when an accessible quest is first opened.
create or replace function public.ensure_student_quest_assignment(p_quest_id uuid, p_class_id uuid)
returns public.student_quest_assignments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_access record;
  v_assignment public.student_quest_assignments%rowtype;
  v_published_version uuid;
begin
  if public.current_profile_role() <> 'student' then
    raise exception 'Only students can initialize their own quest assignment';
  end if;

  select * into v_access from public.resolve_student_quest_access(auth.uid(), p_class_id, p_quest_id);
  if not v_access.can_open then
    raise exception 'Quest is not available to this student';
  end if;

  select * into v_assignment from public.student_quest_assignments
  where quest_id = p_quest_id and class_id = p_class_id and student_id = auth.uid();

  if found then
    update public.student_quest_assignments
      set first_opened_at = coalesce(first_opened_at, now()),
          status = case when status = 'not_started' then 'in_progress' else status end
      where id = v_assignment.id
      returning * into v_assignment;
    return v_assignment;
  end if;

  select published_version_id into v_published_version from public.quests where id = p_quest_id;
  if v_published_version is null then
    raise exception 'Quest has no published version';
  end if;

  insert into public.student_quest_assignments (
    quest_id, class_id, student_id, quest_version_id, status, first_opened_at
  ) values (
    p_quest_id, p_class_id, auth.uid(), v_published_version, 'in_progress', now()
  ) returning * into v_assignment;

  return v_assignment;
end;
$$;

-- Student quest feed: returns only safe shell metadata for visible quests.
create or replace function public.get_student_quest_feed(p_class_id uuid)
returns table (
  quest_id uuid,
  unit_id uuid,
  title text,
  quest_type text,
  location_key text,
  xp_reward integer,
  access_mode text,
  can_open boolean,
  can_submit boolean,
  note_to_student text,
  map_marker jsonb,
  assignment_status text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_profile_role() <> 'student' then
    raise exception 'Only students can use this feed';
  end if;
  if not public.is_member_of_class(p_class_id) then
    raise exception 'Not a member of this class';
  end if;

  return query
  select
    q.id,
    q.unit_id,
    q.title,
    q.quest_type,
    q.location_key,
    q.xp_reward,
    a.access_mode,
    a.can_open,
    a.can_submit,
    a.note_to_student,
    coalesce(v.content_json #> '{identity,mapMarker}', '{}'::jsonb) as map_marker,
    coalesce(sqa.status, 'not_started') as assignment_status
  from public.quests q
  join public.units u on u.id = q.unit_id
  left join public.quest_versions v on v.id = q.published_version_id
  cross join lateral public.resolve_student_quest_access(auth.uid(), p_class_id, q.id) a
  left join public.student_quest_assignments sqa
    on sqa.quest_id = q.id and sqa.class_id = p_class_id and sqa.student_id = auth.uid()
  where u.course_id = (select c.course_id from public.classes c where c.id = p_class_id)
    and a.can_see = true
  order by u.order_index, q.created_at;
end;
$$;

-- Student quest content: only returns source/prompt/rubric after availability is verified.
create or replace function public.get_student_quest_content(p_assignment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment public.student_quest_assignments%rowtype;
  v_access record;
  v_content jsonb;
begin
  select * into v_assignment from public.student_quest_assignments where id = p_assignment_id;
  if not found or v_assignment.student_id <> auth.uid() then
    raise exception 'Assignment unavailable';
  end if;

  select * into v_access from public.resolve_student_quest_access(v_assignment.student_id, v_assignment.class_id, v_assignment.quest_id);
  if not v_access.can_open then
    raise exception 'Quest is not currently open';
  end if;

  select content_json into v_content from public.quest_versions where id = v_assignment.quest_version_id;
  return v_content;
end;
$$;

-- Publish a version. Existing assignments remain tied to their older version.
create or replace function public.publish_quest_version(p_quest_id uuid, p_version_id uuid, p_change_note text default null)
returns public.quests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_quest public.quests%rowtype;
begin
  select q.* into v_quest from public.quests q where q.id = p_quest_id for update;
  if not found then raise exception 'Quest not found'; end if;
  if not public.is_teacher_of_course(public.quest_course_id(p_quest_id)) then
    raise exception 'Not authorized to publish this quest';
  end if;

  update public.quest_versions
    set state = 'archived'
    where quest_id = p_quest_id and state = 'published' and id <> p_version_id;

  update public.quest_versions
    set state = 'published', published_at = now(), change_note = coalesce(p_change_note, change_note)
    where id = p_version_id and quest_id = p_quest_id;

  if not found then raise exception 'Version not found for quest'; end if;

  update public.quests
    set published_version_id = p_version_id,
        current_draft_version_id = p_version_id
    where id = p_quest_id
    returning * into v_quest;

  insert into public.audit_events(actor_id, entity_type, entity_id, action, after_json)
  values (auth.uid(), 'quest', p_quest_id, 'publish_version', jsonb_build_object('version_id', p_version_id));

  return v_quest;
end;
$$;

-- The dashboard should calculate total and decide visibility by updating rubric score rows and submission state.
-- This trigger keeps a submission total aligned with its rubric rows.
create or replace function public.recalculate_submission_score()
returns trigger
language plpgsql
as $$
begin
  update public.submissions s
  set score = coalesce((select sum(points_earned) from public.rubric_scores where submission_id = new.submission_id), 0),
      max_score = coalesce((select sum(max_points) from public.rubric_scores where submission_id = new.submission_id), 0)
  where s.id = coalesce(new.submission_id, old.submission_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists recalc_submission_score_after_score_write on public.rubric_scores;
create trigger recalc_submission_score_after_score_write
  after insert or update or delete on public.rubric_scores
  for each row execute function public.recalculate_submission_score();
