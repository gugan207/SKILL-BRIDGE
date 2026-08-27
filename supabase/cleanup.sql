-- SkillBridge AI — DROP EVERYTHING (run before fresh schema)
-- Order matters: drop dependents first

-- Drop triggers
drop trigger if exists on_auth_user_created on auth.users;

-- Drop functions
drop function if exists match_resume_to_jd;
drop function if exists handle_new_user;

-- Drop all RLS policies
do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- Drop tables (order: dependents first)
drop table if exists matched_lines cascade;
drop table if exists roadmap_items cascade;
drop table if exists match_reports cascade;
drop table if exists resumes cascade;
drop table if exists job_descriptions cascade;
drop table if exists skill_taxonomy cascade;
drop table if exists profiles cascade;
drop table if exists colleges cascade;

-- Drop storage buckets content (do via dashboard)
-- delete from storage.objects where bucket_id in ('resumes', 'reports');
-- delete from storage.buckets where id in ('resumes', 'reports');
