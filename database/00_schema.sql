-- Republic Builder Teacher Backend Infrastructure
-- Run this file first in the Supabase SQL editor.
-- Requires a fresh or compatible Postgres/Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('teacher', 'student')),
  display_name text not null,
  student_identifier text,
  avatar_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  slug text not null unique,
  description text,
  active_unit_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  period_label text,
  join_code text not null unique,
  active_unit_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_members (
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  order_index integer not null,
  title text not null,
  subtitle text,
  description text,
  state text not null default 'draft' check (state in ('draft', 'upcoming', 'active', 'review_only', 'archived')),
  default_access_mode text not null default 'hidden' check (default_access_mode in ('hidden', 'visible_locked', 'scheduled', 'available', 'review_only', 'archived')),
  unlock_at timestamptz,
  lock_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, order_index)
);

alter table public.courses
  add constraint courses_active_unit_fk
  foreign key (active_unit_id) references public.units(id) on delete set null;

alter table public.classes
  add constraint classes_active_unit_fk
  foreign key (active_unit_id) references public.units(id) on delete set null;

create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  slug text not null,
  quest_type text not null check (quest_type in ('vocabulary', 'evidence', 'hipp', 'saq', 'leq', 'dbq', 'boss_battle', 'timeline', 'debate', 'other')),
  title text not null,
  location_key text,
  xp_reward integer not null default 0 check (xp_reward >= 0),
  default_access_mode text not null default 'hidden' check (default_access_mode in ('hidden', 'visible_locked', 'scheduled', 'available', 'review_only', 'archived')),
  unlock_at timestamptz,
  lock_at timestamptz,
  current_draft_version_id uuid,
  published_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_id, slug)
);

create table if not exists public.quest_versions (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests(id) on delete cascade,
  version_number integer not null,
  state text not null default 'draft' check (state in ('draft', 'published', 'archived')),
  content_json jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  change_note text,
  unique (quest_id, version_number)
);

alter table public.quests
  add constraint quests_current_draft_version_fk
  foreign key (current_draft_version_id) references public.quest_versions(id) on delete set null;

alter table public.quests
  add constraint quests_published_version_fk
  foreign key (published_version_id) references public.quest_versions(id) on delete set null;

create table if not exists public.quest_access_rules (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  access_mode text not null check (access_mode in ('hidden', 'visible_locked', 'scheduled', 'available', 'review_only', 'archived')),
  visible_before_unlock boolean not null default true,
  unlock_at timestamptz,
  lock_at timestamptz,
  allow_submission boolean,
  note_to_student text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (quest_id, class_id)
);

create table if not exists public.quest_prerequisites (
  quest_id uuid not null references public.quests(id) on delete cascade,
  required_quest_id uuid not null references public.quests(id) on delete cascade,
  primary key (quest_id, required_quest_id),
  check (quest_id <> required_quest_id)
);

create table if not exists public.student_quest_assignments (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  quest_version_id uuid references public.quest_versions(id) on delete restrict,
  access_override text check (access_override in ('hidden', 'visible_locked', 'scheduled', 'available', 'review_only', 'archived')),
  override_unlock_at timestamptz,
  override_lock_at timestamptz,
  allow_submission_override boolean,
  override_note text,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'submitted', 'grading', 'returned', 'revision_requested', 'graded', 'completed')),
  first_opened_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (quest_id, class_id, student_id)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.student_quest_assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  quest_id uuid not null references public.quests(id) on delete restrict,
  quest_version_id uuid not null references public.quest_versions(id) on delete restrict,
  attempt_number integer not null default 1,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'grading', 'returned', 'revision_requested', 'graded')),
  answers_json jsonb not null default '{}'::jsonb,
  score numeric(6,2),
  max_score numeric(6,2),
  submitted_at timestamptz,
  graded_at timestamptz,
  returned_at timestamptz,
  overall_feedback text,
  reopen_question_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, attempt_number)
);

create table if not exists public.rubric_scores (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  criterion_key text not null,
  points_earned numeric(6,2) not null default 0,
  max_points numeric(6,2) not null,
  feedback text,
  is_visible_to_student boolean not null default false,
  scored_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (submission_id, criterion_key)
);

create table if not exists public.teacher_feedback_bank (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  label text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_progress (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,
  quest_id uuid references public.quests(id) on delete set null,
  xp_earned integer not null default 0,
  completion_state text not null default 'not_started' check (completion_state in ('not_started', 'in_progress', 'submitted', 'completed')),
  updated_at timestamptz not null default now(),
  unique (class_id, student_id, quest_id)
);

create table if not exists public.historian_skills (
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  skill_key text not null check (skill_key in ('context', 'evidence', 'argument', 'sourcing', 'complexity', 'continuity_change')),
  current_value integer not null default 5 check (current_value between 0 and 20),
  updated_at timestamptz not null default now(),
  primary key (class_id, student_id, skill_key)
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  body text not null,
  publish_at timestamptz,
  expires_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  class_id uuid references public.classes(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_units_course on public.units(course_id, order_index);
create index if not exists idx_quests_unit on public.quests(unit_id);
create index if not exists idx_quest_versions_quest on public.quest_versions(quest_id, version_number desc);
create index if not exists idx_access_rules_quest_class on public.quest_access_rules(quest_id, class_id);
create index if not exists idx_assignments_student_class on public.student_quest_assignments(student_id, class_id);
create index if not exists idx_submissions_student on public.submissions(student_id, created_at desc);
create index if not exists idx_submissions_class_quest on public.submissions(class_id, quest_id, status);
create index if not exists idx_rubric_scores_submission on public.rubric_scores(submission_id);
