-- ENUMS
create type public.learning_lane as enum ('starting', 'comfortable');

create type public.learning_step_status as enum (
  'locked', 'available', 'in_progress', 'done', 'skipped'
);

create type public.learning_event_type as enum (
  'plan_created',
  'step_opened',
  'step_completed',
  'step_skipped',
  'chunk_saved',
  'note_added',
  'resume_position_saved',
  'plan_repaired'
);

-- TABLES
create table public.learning_plans (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  lane public.learning_lane not null,
  title text not null,
  current_step_id uuid,
  active_tool_slugs text[] not null default '{}',
  plan_version int not null default 1,
  rationale jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(session_id)
);

create table public.learning_plan_steps (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.learning_plans(id) on delete cascade,
  position int not null,
  status public.learning_step_status not null default 'locked',
  title text not null,
  purpose text not null,
  instruction text not null,
  primary_chunk_id uuid references public.chunks(id) on delete set null,
  tool_slug text,
  foundation_slug text,
  step_kind text not null check (step_kind in (
    'rules', 'briefing', 'first_prompt', 'compare', 'audit', 'relay', 'build', 'capture', 'review'
  )),
  estimated_minutes int,
  unlock_rule jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(plan_id, position)
);

create table public.learning_events (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.learning_plans(id) on delete cascade,
  step_id uuid references public.learning_plan_steps(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade,
  event_type public.learning_event_type not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.chunk_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete cascade,
  chunk_id uuid not null references public.chunks(id) on delete cascade,
  status text not null check (status in ('started', 'done')),
  read_percent int not null default 0 check (read_percent between 0 and 100),
  last_position jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(user_id, session_id, chunk_id)
);

-- INDEXES
create index learning_plans_user_id_idx on public.learning_plans (user_id) where user_id is not null;
create index learning_plans_current_step_id_idx on public.learning_plans (current_step_id) where current_step_id is not null;
create index learning_plan_steps_plan_id_position_idx on public.learning_plan_steps (plan_id, position);
create index learning_plan_steps_status_idx on public.learning_plan_steps (status);
create index learning_events_plan_id_created_at_idx on public.learning_events (plan_id, created_at desc);
create index learning_events_user_id_created_at_idx on public.learning_events (user_id, created_at desc) where user_id is not null;
create index chunk_progress_user_id_idx on public.chunk_progress (user_id);
create index chunk_progress_session_id_idx on public.chunk_progress (session_id) where session_id is not null;

-- TOUCH TRIGGERS
create or replace function public.touch_learning_plan_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_touch_learning_plan_updated_at
  before update on public.learning_plans
  for each row execute function public.touch_learning_plan_updated_at();

create or replace function public.touch_chunk_progress_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_touch_chunk_progress_updated_at
  before update on public.chunk_progress
  for each row execute function public.touch_chunk_progress_updated_at();

-- RLS
alter table public.learning_plans enable row level security;
alter table public.learning_plan_steps enable row level security;
alter table public.learning_events enable row level security;
alter table public.chunk_progress enable row level security;

create policy "Users can view own learning plans" on public.learning_plans
  for select using (auth.uid() = user_id);
create policy "Users can update own learning plans" on public.learning_plans
  for update using (auth.uid() = user_id);
create policy "Users can insert own learning plans" on public.learning_plans
  for insert with check (auth.uid() = user_id);

create policy "Users can view own learning plan steps" on public.learning_plan_steps
  for select using (
    exists (select 1 from public.learning_plans p
            where p.id = learning_plan_steps.plan_id and p.user_id = auth.uid())
  );
create policy "Users can update own learning plan steps" on public.learning_plan_steps
  for update using (
    exists (select 1 from public.learning_plans p
            where p.id = learning_plan_steps.plan_id and p.user_id = auth.uid())
  );
create policy "Users can insert own learning plan steps" on public.learning_plan_steps
  for insert with check (
    exists (select 1 from public.learning_plans p
            where p.id = learning_plan_steps.plan_id and p.user_id = auth.uid())
  );

create policy "Users can view own learning events" on public.learning_events
  for select using (
    auth.uid() = user_id
    or exists (select 1 from public.learning_plans p
               where p.id = learning_events.plan_id and p.user_id = auth.uid())
  );
create policy "Users can insert own learning events" on public.learning_events
  for insert with check (
    auth.uid() = user_id
    or exists (select 1 from public.learning_plans p
               where p.id = learning_events.plan_id and p.user_id = auth.uid())
  );

create policy "Users can view own chunk progress" on public.chunk_progress
  for select using (auth.uid() = user_id);
create policy "Users can insert own chunk progress" on public.chunk_progress
  for insert with check (auth.uid() = user_id);
create policy "Users can update own chunk progress" on public.chunk_progress
  for update using (auth.uid() = user_id);