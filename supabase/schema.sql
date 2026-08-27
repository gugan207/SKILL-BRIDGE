-- SkillBridge AI — Supabase Schema
-- Phase 1: Student users only. College/recruiter roles in schema but not built.

-- Enable pgvector extension
create extension if not exists vector;

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student','college_admin','recruiter')),
  full_name text,
  college_id uuid references colleges(id),
  consent_given_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  file_name text,
  storage_path text not null,
  parsed_text text,
  embedding vector(1024),
  embedding_model text default 'nvidia/nv-embedqa-e5-v5',
  uploaded_at timestamptz default now()
);

create table if not exists job_descriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text,
  company text,
  raw_text text not null,
  embedding vector(1024),
  embedding_model text default 'nvidia/nv-embedqa-e5-v5',
  created_at timestamptz default now()
);

create table if not exists skill_taxonomy (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text check (category in ('technical','tool','soft','domain')),
  source_version text,
  youtube_video_id text,
  youtube_video_title text,
  youtube_channel_title text,
  youtube_thumbnail_url text,
  youtube_cached_at timestamptz,
  github_repo_url text,
  github_repo_name text,
  github_repo_stars int,
  github_good_first_issue_url text,
  github_cached_at timestamptz
);

create table if not exists match_reports (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid references resumes(id) on delete cascade not null,
  jd_id uuid references job_descriptions(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  employability_score int check (employability_score between 0 and 100),
  skill_radar jsonb,
  matched_skills jsonb,
  missing_skills jsonb,
  roadmap jsonb,
  ai_explanations jsonb,
  report_pdf_path text,
  created_at timestamptz default now()
);

create table if not exists matched_lines (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references match_reports(id) on delete cascade not null,
  skill_name text,
  resume_line text,
  jd_requirement text,
  similarity_score float
);

create table if not exists roadmap_items (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid references skill_taxonomy(id) on delete cascade not null,
  project_title text not null,
  project_description text,
  resource_url text,
  difficulty text check (difficulty in ('beginner','intermediate','advanced')),
  estimated_hours int,
  impact_rank int
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_resumes_embedding on resumes using hnsw (embedding vector_cosine_ops);
create index if not exists idx_jd_embedding on job_descriptions using hnsw (embedding vector_cosine_ops);
create index if not exists idx_resumes_user on resumes(user_id);
create index if not exists idx_jd_user on job_descriptions(user_id);
create index if not exists idx_reports_user on match_reports(user_id);
create index if not exists idx_skill_taxonomy_name on skill_taxonomy(name);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Vector similarity search: find resumes similar to a JD embedding
create or replace function match_resume_to_jd(
  query_embedding vector(1024),
  match_threshold float default 0.5,
  match_count int default 10
)
returns table (resume_id uuid, similarity float)
language sql stable
as $$
  select id, 1 - (embedding <=> query_embedding) as similarity
  from resumes
  where embedding is not null
    and 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'student');
  return new;
end;
$$;

-- Trigger: create profile when user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Resumes
alter table resumes enable row level security;

create policy "Users can view own resumes"
  on resumes for select
  using (auth.uid() = user_id);

create policy "Users can insert own resumes"
  on resumes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own resumes"
  on resumes for delete
  using (auth.uid() = user_id);

-- Job Descriptions
alter table job_descriptions enable row level security;

create policy "Users can view own JDs"
  on job_descriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own JDs"
  on job_descriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own JDs"
  on job_descriptions for delete
  using (auth.uid() = user_id);

-- Match Reports
alter table match_reports enable row level security;

create policy "Users can view own reports"
  on match_reports for select
  using (auth.uid() = user_id);

create policy "Users can insert own reports"
  on match_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own reports"
  on match_reports for delete
  using (auth.uid() = user_id);

-- Matched Lines (via report ownership)
alter table matched_lines enable row level security;

create policy "Users can view own matched lines"
  on matched_lines for select
  using (
    exists (
      select 1 from match_reports
      where match_reports.id = matched_lines.report_id
        and match_reports.user_id = auth.uid()
    )
  );

create policy "Users can insert own matched lines"
  on matched_lines for insert
  with check (
    exists (
      select 1 from match_reports
      where match_reports.id = matched_lines.report_id
        and match_reports.user_id = auth.uid()
    )
  );

-- Skill Taxonomy — readable by all authenticated users
alter table skill_taxonomy enable row level security;

create policy "Authenticated users can view skills"
  on skill_taxonomy for select
  using (auth.role() = 'authenticated');

-- Roadmap Items — readable by all authenticated users
alter table roadmap_items enable row level security;

create policy "Authenticated users can view roadmap"
  on roadmap_items for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE (run in Supabase dashboard or via API)
-- ============================================================
-- Create private bucket: 'resumes' (not public)
-- Create private bucket: 'reports' (not public)
-- Policies: users can upload/read only their own files
