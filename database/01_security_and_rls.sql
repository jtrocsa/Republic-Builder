-- Run after 00_schema.sql.
-- RLS is intentionally strict. Student-facing content must be supplied by RPC functions,
-- not direct selects against quests or quest_versions.

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.units enable row level security;
alter table public.quests enable row level security;
alter table public.quest_versions enable row level security;
alter table public.quest_access_rules enable row level security;
alter table public.quest_prerequisites enable row level security;
alter table public.student_quest_assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.rubric_scores enable row level security;
alter table public.teacher_feedback_bank enable row level security;
alter table public.student_progress enable row level security;
alter table public.historian_skills enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_events enable row level security;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_teacher_of_class(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classes c
    where c.id = p_class_id and c.teacher_id = auth.uid()
  )
$$;

create or replace function public.is_member_of_class(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.class_members cm
    where cm.class_id = p_class_id and cm.student_id = auth.uid()
  )
$$;

create or replace function public.is_teacher_of_course(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.courses c
    where c.id = p_course_id and c.owner_id = auth.uid()
  )
$$;

-- Profile access
create policy "profiles: read self" on public.profiles
for select using (id = auth.uid());

create policy "profiles: teacher reads students in own classes" on public.profiles
for select using (
  public.current_profile_role() = 'teacher'
  and exists (
    select 1
    from public.class_members cm
    join public.classes c on c.id = cm.class_id
    where c.teacher_id = auth.uid() and cm.student_id = profiles.id
  )
);

create policy "profiles: update self non-role fields" on public.profiles
for update using (id = auth.uid())
with check (id = auth.uid() and role = (select role from public.profiles p where p.id = auth.uid()));

-- Teachers own courses/classes and their class memberships.
create policy "courses: teacher owns course" on public.courses
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "classes: teacher owns class" on public.classes
for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

create policy "classes: student reads membership class" on public.classes
for select using (public.is_member_of_class(id));

create policy "class_members: teacher manages roster" on public.class_members
for all using (public.is_teacher_of_class(class_id)) with check (public.is_teacher_of_class(class_id));

create policy "class_members: student reads own memberships" on public.class_members
for select using (student_id = auth.uid());

-- Curriculum tables are teacher-only for direct access.
create policy "units: course teacher manages" on public.units
for all using (public.is_teacher_of_course(course_id)) with check (public.is_teacher_of_course(course_id));

create policy "quests: course teacher manages" on public.quests
for all using (
  exists (
    select 1 from public.units u where u.id = quests.unit_id and public.is_teacher_of_course(u.course_id)
  )
) with check (
  exists (
    select 1 from public.units u where u.id = quests.unit_id and public.is_teacher_of_course(u.course_id)
  )
);

create policy "quest_versions: course teacher manages" on public.quest_versions
for all using (
  exists (
    select 1 from public.quests q
    join public.units u on u.id = q.unit_id
    where q.id = quest_versions.quest_id and public.is_teacher_of_course(u.course_id)
  )
) with check (
  exists (
    select 1 from public.quests q
    join public.units u on u.id = q.unit_id
    where q.id = quest_versions.quest_id and public.is_teacher_of_course(u.course_id)
  )
);

create policy "quest_access_rules: class teacher manages" on public.quest_access_rules
for all using (public.is_teacher_of_class(class_id)) with check (public.is_teacher_of_class(class_id));

create policy "quest_prerequisites: course teacher manages" on public.quest_prerequisites
for all using (
  exists (
    select 1 from public.quests q
    join public.units u on u.id = q.unit_id
    where q.id = quest_prerequisites.quest_id and public.is_teacher_of_course(u.course_id)
  )
) with check (
  exists (
    select 1 from public.quests q
    join public.units u on u.id = q.unit_id
    where q.id = quest_prerequisites.quest_id and public.is_teacher_of_course(u.course_id)
  )
);

-- Assignments: teachers manage students in their classes; students read/update only their own.
create policy "assignments: teacher manages class assignments" on public.student_quest_assignments
for all using (public.is_teacher_of_class(class_id)) with check (public.is_teacher_of_class(class_id));

create policy "assignments: student reads own" on public.student_quest_assignments
for select using (student_id = auth.uid() and public.is_member_of_class(class_id));

create policy "assignments: student updates own status" on public.student_quest_assignments
for update using (student_id = auth.uid() and public.is_member_of_class(class_id))
with check (student_id = auth.uid() and public.is_member_of_class(class_id));

-- Submissions: student can access only their own. Teacher can access taught class.
create policy "submissions: teacher manages class" on public.submissions
for all using (public.is_teacher_of_class(class_id)) with check (public.is_teacher_of_class(class_id));

create policy "submissions: student reads own" on public.submissions
for select using (student_id = auth.uid() and public.is_member_of_class(class_id));

create policy "submissions: student creates own" on public.submissions
for insert with check (student_id = auth.uid() and public.is_member_of_class(class_id));

create policy "submissions: student edits own draft/revision" on public.submissions
for update using (student_id = auth.uid() and public.is_member_of_class(class_id) and status in ('draft', 'revision_requested', 'returned'))
with check (student_id = auth.uid() and public.is_member_of_class(class_id));

create policy "rubric_scores: teacher manages" on public.rubric_scores
for all using (
  exists (select 1 from public.submissions s where s.id = rubric_scores.submission_id and public.is_teacher_of_class(s.class_id))
) with check (
  exists (select 1 from public.submissions s where s.id = rubric_scores.submission_id and public.is_teacher_of_class(s.class_id))
);

create policy "rubric_scores: student reads visible own" on public.rubric_scores
for select using (
  is_visible_to_student
  and exists (select 1 from public.submissions s where s.id = rubric_scores.submission_id and s.student_id = auth.uid())
);

create policy "feedback_bank: own teacher only" on public.teacher_feedback_bank
for all using (teacher_id = auth.uid() and public.current_profile_role() = 'teacher')
with check (teacher_id = auth.uid() and public.current_profile_role() = 'teacher');

create policy "progress: teacher manages class" on public.student_progress
for all using (public.is_teacher_of_class(class_id)) with check (public.is_teacher_of_class(class_id));

create policy "progress: student reads own" on public.student_progress
for select using (student_id = auth.uid() and public.is_member_of_class(class_id));

create policy "skills: teacher manages class" on public.historian_skills
for all using (public.is_teacher_of_class(class_id)) with check (public.is_teacher_of_class(class_id));

create policy "skills: student reads own" on public.historian_skills
for select using (student_id = auth.uid() and public.is_member_of_class(class_id));

create policy "announcements: teacher manages class" on public.announcements
for all using (public.is_teacher_of_class(class_id)) with check (public.is_teacher_of_class(class_id));

create policy "announcements: student reads own class" on public.announcements
for select using (public.is_member_of_class(class_id) and (publish_at is null or publish_at <= now()) and (expires_at is null or expires_at > now()));

create policy "audit: teacher reads own class" on public.audit_events
for select using (class_id is not null and public.is_teacher_of_class(class_id));
