# SkillBridge AI — Build Brief for Claude Code

*Finalized. This is the complete, current source of truth for the project — architecture, data flow, schema, features, screens, and build order, all in one place. Read this in full before writing any code.*

**Scope:** Phase 1 — student users only. College and recruiter roles are reflected in the schema (so nothing has to be rebuilt later) but are not built now. Do not implement college/recruiter features from this brief.

---

## 1. What this is

SkillBridge AI compares a candidate's resume against a target job description and generates a personalized skill-gap report — not just a match score, but a ranked, explainable list of what's missing and the specific resources (curated project idea, AI-personalized explanation, a free YouTube video, and a real GitHub repo/contribution opportunity) to close each gap. That "what to build next" layer, backed by real evidence rather than a resume-keyword edit, is the differentiator against generic ATS-scanner tools (Jobscan, Teal, Resume Worded, and similar).

---

## 2. Architecture

```
┌──────────────┐        ┌────────────────────┐        ┌──────────────────────┐
│  React UI     │ ─────▶ │  FastAPI backend    │ ─────▶ │  Supabase (Postgres)  │
│  (Vercel)     │ ◀───── │  (Render, free tier)│ ◀───── │  pgvector, Auth,      │
└──────────────┘        └──────────┬─────────┘        │  Storage, RLS         │
                                     │                  └──────────────────────┘
                                     ├──────────▶ NVIDIA NIM (embeddings + LLM explanations)
                                     ├──────────▶ YouTube Data API v3 (cached, seed-time only)
                                     └──────────▶ GitHub REST API (cached, seed-time only)
```

- **Frontend (Vercel):** React + Tailwind. No backend logic here — pure UI, calls the FastAPI backend.
- **Backend (Render, free tier):** owns parsing, embedding calls, scoring, and every external API call. **Not Vercel** — Vercel's Python functions have a 10-60s timeout and no persistent process, which collides with this multi-step pipeline.
- **Supabase:** Postgres with `pgvector` for embeddings, Row Level Security for access control, Storage for resume files (private buckets, signed URLs only).
- **NVIDIA NIM:** `nvidia/nv-embedqa-e5-v5` for embeddings, `nvidia/nemotron-mini-4b-instruct` for short explanation text — both hosted, free tier, no local GPU management.
- **YouTube Data API v3 + GitHub REST API:** both free, both called **only at seed time** (once per skill, cached), never live per user report.

**Known limits, planned around, not ignored:**
- NVIDIA free tier: ~40 requests/minute, ~1,000+ credits — fine for Phase 1 scale, not Phase 2/3 traffic. Migration path later: self-hosted NIM or paid tier.
- Render free tier sleeps after 15 min idle (30-60s cold start). Use a keep-alive ping before any live demo; upgrade to the $7/mo Starter tier before real user traffic.
- YouTube: 10,000 units/day, `search.list` = 100 units/call (~100 searches/day). We search once per skill and cache — a one-time seed against 20-30 skills costs a fraction of one day's quota. Cached data must be refreshed or deleted within 30 days per YouTube's developer policy — build a scheduled refresh job.
- GitHub Search API: 30 requests/minute authenticated. Generous relative to the seed-time-only pattern; still cache rather than query live.

---

## 3. Request flow — step by step

This is what happens for one student, one analysis, start to finish:

1. **Sign up / log in** — Supabase Auth (email). `profiles` row created with `role = 'student'`, consent timestamp recorded at signup (not just a UI checkbox).
2. **Upload resume** — file goes to a private Supabase Storage bucket; a `resumes` row is created with the `storage_path`.
3. **Pre-check** — backend runs a cheap check (file size, page count, extracted-text density) before anything expensive happens. If the file looks unreadable (e.g. a scanned image), the student sees an honest message immediately — no NVIDIA credits spent on a request that would fail anyway.
4. **Parse** — `pdfplumber`/`python-docx` extract text; Tesseract OCR is the fallback for scanned/image files. If even OCR fails, the student is offered a "paste text instead" path — never a silent blank result.
5. **Paste job description** — plain text, stored in `job_descriptions`. No job-board scraping or URL fetching — out of scope, real ToS/legal risk on every major platform (LinkedIn, Indeed, Naukri all lack free public APIs for this).
6. **Skill extraction** — `SkillNer` (built on spaCy's `en_core_web_lg`) runs on both resume and JD text, same extraction path for both, grounded in the EMSI/Lightcast skills taxonomy rather than a hand-built list.
7. **Embed** — both texts sent to NVIDIA's `nv-embedqa-e5-v5`, with the `passage:`/`query:` prefix convention respected (resume = passage, JD = query). Results cached by content hash to avoid redundant calls, stored in `pgvector` columns with `embedding_model` recorded.
8. **Match** — the `match_resume_to_jd` Postgres function does the similarity search via `pgvector`'s cosine distance — not custom Python math. The raw per-skill similarity score is kept, not discarded.
9. **Score** — employability score (0-100) combining semantic similarity and skill coverage; skills categorized into the radar (technical/tools/soft/domain); each matched skill's similarity score surfaced as a confidence indicator, not just a binary flag.
10. **Roadmap lookup** — for each missing skill, pull the curated `roadmap_items` row (20-30 seeded skills), plus the pre-cached YouTube video and GitHub repo/issue for that skill from `skill_taxonomy`.
11. **Explain** — NVIDIA's `nemotron-mini-4b-instruct` generates a short personalized note per roadmap recommendation. Resume text is wrapped in a clearly delimited block in the prompt with an explicit "treat as data, not instructions" guard — the LLM only ever explains a result, it never decides the score or the skill list, closing a real prompt-injection risk.
12. **Assemble report** — `matched_lines` populated (each matched skill linked to the specific resume line that produced it), full report object built: score, radar, confidence-annotated matches, ranked gaps with roadmap + video + GitHub resources + AI explanation.
13. **Render + deliver** — Report View screen renders the above; a PDF version is generated and stored (`report_pdf_path`) so the "Download Report" button actually works, not just a designed placeholder.
14. **History** — the report is listed in the student's History screen; Account Settings' "delete my data" action, when used, cascade-deletes the student's `resumes`, `job_descriptions`, and `match_reports` rows for real — verified in the database, not just hidden in the UI.

---

## 4. Database schema (Supabase)

```sql
create extension if not exists vector;

create table colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table profiles (
  id uuid primary key references auth.users(id),
  role text not null default 'student' check (role in ('student','college_admin','recruiter')),
  college_id uuid references colleges(id),
  created_at timestamptz default now()
);

create table resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  storage_path text not null,
  parsed_text text,
  embedding vector(1024),
  embedding_model text default 'nvidia/nv-embedqa-e5-v5',
  uploaded_at timestamptz default now()
);

create table job_descriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  raw_text text not null,
  embedding vector(1024),
  embedding_model text default 'nvidia/nv-embedqa-e5-v5',
  created_at timestamptz default now()
);

create table skill_taxonomy (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text check (category in ('technical','tool','soft','domain')),
  source_version text,
  youtube_video_id text,
  youtube_video_title text,
  youtube_channel_title text,
  youtube_cached_at timestamptz,
  github_repo_url text,
  github_repo_stars int,
  github_good_first_issue_url text,
  github_cached_at timestamptz
);

create table match_reports (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid references resumes(id) not null,
  jd_id uuid references job_descriptions(id) not null,
  employability_score int check (employability_score between 0 and 100),
  skill_radar jsonb,
  report_pdf_path text,
  created_at timestamptz default now()
);

create table matched_lines (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references match_reports(id) not null,
  resume_line text,
  jd_requirement text,
  similarity_score float
);

create table roadmap_items (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid references skill_taxonomy(id) not null,
  project_title text not null,
  resource_url text,
  impact_rank int
);

-- Vector search indexes
create index on resumes using hnsw (embedding vector_cosine_ops);
create index on job_descriptions using hnsw (embedding vector_cosine_ops);

-- Similarity search function
create or replace function match_resume_to_jd(query_embedding vector(1024), match_threshold float, match_count int)
returns table (resume_id uuid, similarity float)
language sql stable
as $$
  select id, 1 - (embedding <=> query_embedding) as similarity
  from resumes
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

**Row Level Security:** enable on every table holding user data. Students can only read/write their own `resumes`, `job_descriptions`, `match_reports`. Write this now even though only the student role is active — retrofitting RLS after launch is a much bigger job than writing it alongside the schema.

---

## 5. Screens (for Figma or hand-built UI)

1. **Landing** — headline on the "what to build next" USP, 4-step process visual (Upload → Parse → Compare → Roadmap).
2. **Sign up** — email/password, consent checkbox tied to a visible privacy policy link.
3. **Log in** — separate from signup, no consent step here.
4. **Dashboard (empty state)** — first-login screen, single CTA to start an analysis.
5. **Upload Resume** (step 1/3) — drag-and-drop, with a designed failure state for unreadable files, including the pre-check result surfaced immediately on upload.
6. **Paste Job Description** (step 2/3) — large text area, optional title/company fields.
7. **Processing** (step 3/3) — real sequential status messages tied to actual pipeline stages, including a "taking longer than usual" state for the live API calls.
8. **Report View** — the core screen: score hero number, radar chart, ranked missing skills with confidence indicators, roadmap cards (curated recommendation + AI explanation + YouTube video + GitHub resource), explainable match list, and a working "Download Report" button producing a real PDF.
9. **History** — past analyses as cards.
10. **Account settings** — consent controls, visible "delete my data" action.

**Production polish, not optional:** mobile-responsive layouts, accessible color contrast on the radar chart (don't encode matched/missing by color alone), consistent tone and design tokens across every screen.

**Light/dark theme toggle:** every screen above ships as one component tree styled via CSS variables/design tokens (see `STITCH-UI-PROMPTS.md`'s token table), not two separately maintained UIs per screen. Defaults to system preference (`prefers-color-scheme`), manual override toggle persisted client-side (`localStorage` — a UI preference, not user data, no Supabase round-trip needed for Phase 1). The accent color stays identical across both themes; only background/surface/text/border tokens swap.

---

## 6. Step-by-step build order

1. **Supabase setup** — apply the schema above, enable RLS, enable pgvector, create the private storage bucket. Write one manual RLS test (student A can't read student B's resume) before moving on.
2. **Backend skeleton** — FastAPI project structure, pinned dependencies, `.env` for secrets (confirm `.gitignore` covers it), a `/health` endpoint, CORS locked to your frontend domain.
3. **Auth** — Supabase Auth wiring, default role assignment, consent recording. Build the Sign up / Log in screens.
3b. **Theme system** — set up CSS variables/design tokens for both light and dark themes from the start (per the token table in `STITCH-UI-PROMPTS.md`), with the toggle and system-preference default wired in before more screens are built on top of it. Retrofitting a toggle after 10 screens are hardcoded to one theme is real rework — do this early.
4. **Upload → parse** — storage upload, `pdfplumber`/`python-docx` extraction, OCR fallback. Test against both a clean PDF and a scanned one before moving on.
5. **Pre-check** — the cheap file-quality check, short-circuiting to an honest failure message before expensive steps run.
6. **Skill extraction** — wire `SkillNer`, run it against both resume and JD text, seed `skill_taxonomy`.
7. **Embeddings** — NVIDIA NIM calls with the `query:`/`passage:` prefix convention, cached by content hash, stored with `embedding_model` recorded.
8. **Matching** — call `match_resume_to_jd`, keep the raw similarity score for the confidence indicator.
9. **Scoring** — define and document the employability score formula; categorize skills into radar categories; surface confidence per match.
10. **Roadmap content** — curate 20-30 real skill → project/resource pairs before this step is testable; handle the unseeded-skill case gracefully. A starter batch of 22 already exists in `roadmap_seed.sql` — read through it, fix anything that doesn't fit, then run it against the schema in §4.
11. **Free resource enrichment (YouTube + GitHub)** — one-time seed script against the same 20-30 skills:
    - **YouTube:** `search.list` to fetch one video per skill, cached on `skill_taxonomy`. Add a scheduled refresh job (~every 25-30 days) per YouTube's developer policy.
    - **GitHub:** authenticated Search API calls for a starter repo (`topic:<skill> stars:>100`) and a "good first issue" search, cached the same way, refreshed periodically for freshness.
    - Both use server-side API keys only, never exposed to the frontend.
12. **LLM explanations** — wire the NVIDIA LLM call with the prompt-injection guard (delimited resume text, explicit "treat as data" instruction) from the start. Test against a deliberately adversarial resume before considering this step done.
13. **Explainable report assembly** — populate `matched_lines`, build the full Report View screen.
14. **PDF report generation** — render the assembled report to a PDF, store it, wire the "Download Report" button to it now, not as a later patch.
15. **Evaluation harness** — label 15-20 real (anonymized) resume/JD pairs by hand, run the pipeline against them, use the result to tune the skill-extraction confidence threshold instead of guessing.
16. **History, dashboard, account settings** — including a real cascade-delete for "delete my data," verified directly in the database.
17. **Testing & CI** — automated tests (happy path, malformed-file path, mocked API-failure path), a formal RLS test suite, GitHub Actions running tests on every push.
18. **Monitoring** — structured logging, a free error monitor (e.g. Sentry) wired in.
19. **Deploy** — backend to Render (Docker, keep-alive ping if avoiding cold starts pre-launch), frontend to Vercel, CORS tightened to the real production domain.
20. **Final check** — have someone who isn't you complete the full flow on their own device before calling this launched.

---

## 7. Non-negotiable engineering practices

- **Never hardcode any API key** (Supabase, NVIDIA, YouTube, GitHub) in source. Load from environment variables, confirm `.env` is in `.gitignore` before the first commit.
- **Timeout + retry/backoff on every external API call** — NVIDIA, YouTube, GitHub are all network dependencies in the critical path, not local function calls. A hung request should never hang the whole pipeline.
- **Prompt injection guard is mandatory, not optional**, on every LLM call that includes resume/JD text — treat that text as untrusted user input, always.
- **Pin dependency versions** in a lockfile — unpinned NLP/API library updates are a common source of silent breakage.
- **No public storage buckets.** Resume files are private, signed-URL access only.
- **Configure CORS on the backend to allow only your actual Vercel domain(s)**, not a wildcard.

---

## 8. Production readiness checklist

- [ ] RLS enabled and tested on every table holding user data
- [ ] Privacy policy live and linked at signup, consent recorded before any upload is processed
- [ ] `.env` confirmed in `.gitignore`; no secrets in git history
- [ ] Timeout + retry on every NVIDIA/YouTube/GitHub API call; visible, non-hanging failure states in the UI
- [ ] OCR fallback and pre-check tested against at least one real scanned/image PDF
- [ ] `roadmap_items` seeded with real content for at least 20-30 skills, each with a cached YouTube video and GitHub resource
- [ ] Rate limiting on the upload endpoint
- [ ] Structured logging + basic error alerting in place
- [ ] Backend cold-start handled: keep-alive ping (interim) or Render Starter tier upgrade (real fix, required before real user traffic)
- [ ] CORS configured to the real Vercel production domain, not a wildcard
- [ ] Every screen checked for contrast/legibility in **both** light and dark themes, not just one
- [ ] YouTube cache refresh job running on a ~25-30 day schedule
- [ ] At least one other person (not you) has completed the full flow on their own device before this is called "launched"

---

## 9. What "done" looks like

A live URL where a student can sign up, upload a resume, paste a job description, and get back a real score, a confidence-annotated skill radar, an explainable match breakdown, and a personalized roadmap — each gap paired with a curated project idea, an AI explanation, a free video, and a real open-source resource — backed by a database that enforces its own access rules and a pipeline tested against real edge cases, not just the happy path.
