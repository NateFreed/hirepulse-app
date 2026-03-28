-- HirePulse Database Schema

create table if not exists hp_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  department text default '',
  location text default '',
  employment_type text check (employment_type in ('full_time', 'part_time', 'contract', 'internship')) default 'full_time',
  salary_min integer,
  salary_max integer,
  description text default '',
  requirements text default '',
  benefits text default '',
  status text check (status in ('draft', 'open', 'closed')) default 'draft',
  share_id text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists hp_candidates (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references hp_jobs(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text not null,
  phone text default '',
  resume_text text default '',
  resume_url text default '',
  cover_letter text default '',
  source text default 'direct',
  stage text check (stage in ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected')) default 'applied',
  ai_score integer,
  ai_summary text,
  notes text default '',
  applied_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists hp_interviews (
  id uuid default gen_random_uuid() primary key,
  candidate_id uuid references hp_candidates(id) on delete cascade not null,
  job_id uuid references hp_jobs(id) on delete cascade not null,
  scheduled_at timestamptz not null,
  duration_minutes integer default 60,
  location text default 'Zoom',
  notes text default '',
  status text check (status in ('scheduled', 'completed', 'cancelled')) default 'scheduled'
);

create table if not exists hp_team_notes (
  id uuid default gen_random_uuid() primary key,
  candidate_id uuid references hp_candidates(id) on delete cascade not null,
  author_name text not null,
  content text not null,
  rating integer check (rating >= 1 and rating <= 5),
  created_at timestamptz default now()
);

-- RLS
alter table hp_jobs enable row level security;
alter table hp_candidates enable row level security;
alter table hp_interviews enable row level security;
alter table hp_team_notes enable row level security;

create policy "Users manage their jobs" on hp_jobs
  for all using (auth.uid() = user_id);

create policy "Public can view open jobs" on hp_jobs
  for select using (status = 'open');

create policy "Users manage their candidates" on hp_candidates
  for all using (user_id = auth.uid());

create policy "Public can apply" on hp_candidates
  for insert with check (true);

create policy "Users manage interviews" on hp_interviews
  for all using (job_id in (select id from hp_jobs where user_id = auth.uid()));

create policy "Users manage team notes" on hp_team_notes
  for all using (candidate_id in (
    select c.id from hp_candidates c
    join hp_jobs j on c.job_id = j.id
    where j.user_id = auth.uid()
  ));

-- Indexes
create index if not exists idx_hp_jobs_user_id on hp_jobs(user_id);
create index if not exists idx_hp_jobs_share_id on hp_jobs(share_id);
create index if not exists idx_hp_jobs_status on hp_jobs(status);
create index if not exists idx_hp_candidates_job_id on hp_candidates(job_id);
create index if not exists idx_hp_candidates_stage on hp_candidates(stage);
create index if not exists idx_hp_interviews_candidate_id on hp_interviews(candidate_id);
create index if not exists idx_hp_team_notes_candidate_id on hp_team_notes(candidate_id);
