import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mltkmkrrmpvgyhwdkpgl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdGtta3JybXB2Z3lod2RrcGdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU4NTg5MSwiZXhwIjoyMTAzMTYxODkxfQ.kkKu1cPPwqHVuGMPz7gKudrQJUhCJs4YCSq_dojbjeE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const SKILLS_DATA = [
  { name: 'python', category: 'technical' },
  { name: 'javascript', category: 'technical' },
  { name: 'typescript', category: 'technical' },
  { name: 'react', category: 'technical' },
  { name: 'node.js', category: 'technical' },
  { name: 'sql', category: 'technical' },
  { name: 'machine learning', category: 'technical' },
  { name: 'data science', category: 'technical' },
  { name: 'docker', category: 'tool' },
  { name: 'kubernetes', category: 'tool' },
  { name: 'aws', category: 'tool' },
  { name: 'git', category: 'tool' },
  { name: 'postgresql', category: 'tool' },
  { name: 'redis', category: 'tool' },
  { name: 'ci/cd', category: 'tool' },
  { name: 'leadership', category: 'soft' },
  { name: 'communication', category: 'soft' },
  { name: 'project management', category: 'soft' },
  { name: 'agile', category: 'soft' },
  { name: 'fintech', category: 'domain' },
  { name: 'healthcare', category: 'domain' },
  { name: 'e-commerce', category: 'domain' },
];

const ROADMAP_PROJECTS = {
  python: {
    title: 'Build a CLI Task Manager (Python)',
    url: 'https://realpython.com/python-project-ideas/',
    rank: 1,
  },
  javascript: {
    title: 'Interactive Quiz App (JavaScript/DOM)',
    url: 'https://developer.mozilla.org/en-US/docs/Learn',
    rank: 1,
  },
  typescript: {
    title: 'Type-Safe REST Client (TypeScript Generics)',
    url: 'https://www.typescriptlang.org/docs/handbook/',
    rank: 1,
  },
  react: {
    title: 'Personal Analytics Dashboard (React & Hooks)',
    url: 'https://react.dev/learn',
    rank: 1,
  },
  'node.js': {
    title: 'Real-Time WebSocket Server (Node.js & Express)',
    url: 'https://nodejs.org/en/learn',
    rank: 1,
  },
  sql: {
    title: 'Normalized E-Commerce Schema (SQL & Indexes)',
    url: 'https://sqlbolt.com/',
    rank: 1,
  },
  'machine learning': {
    title: 'End-to-End Classification Pipeline (scikit-learn)',
    url: 'https://scikit-learn.org/stable/tutorial/',
    rank: 1,
  },
  'data science': {
    title: 'Exploratory Data Analysis Case Study (pandas/numpy)',
    url: 'https://kaggle.com/learn',
    rank: 1,
  },
  docker: {
    title: 'Multi-Service Containerization (Docker Compose)',
    url: 'https://docs.docker.com/get-started/',
    rank: 1,
  },
  kubernetes: {
    title: 'Microservices Deployment (Kubernetes K8s)',
    url: 'https://kubernetes.io/docs/tutorials/',
    rank: 1,
  },
  aws: {
    title: 'Serverless API Backend (AWS Lambda & API GW)',
    url: 'https://aws.amazon.com/getting-started/',
    rank: 1,
  },
  git: {
    title: 'Open Source Contribution Workflow (Git & GitHub)',
    url: 'https://opensource.guide/how-to-contribute/',
    rank: 1,
  },
  postgresql: {
    title: 'Advanced Query Workshop (PostgreSQL CTEs & JSONB)',
    url: 'https://www.postgresqltutorial.com/',
    rank: 1,
  },
  redis: {
    title: 'In-Memory Cache & Rate Limiter (Redis)',
    url: 'https://redis.io/docs/getting-started/',
    rank: 1,
  },
  'ci/cd': {
    title: 'Automated CI/CD Pipeline (GitHub Actions)',
    url: 'https://docs.github.com/en/actions',
    rank: 1,
  },
  leadership: {
    title: 'Lead an Agile Engineering Sprint Project',
    url: 'https://hbr.org/topic/leadership',
    rank: 1,
  },
  communication: {
    title: 'Technical Documentation & Architecture Series',
    url: 'https://dev.to/',
    rank: 1,
  },
  'project management': {
    title: 'Agile Kanban Project Workflow Simulation',
    url: 'https://atlassian.com/agile/kanban',
    rank: 1,
  },
  agile: {
    title: 'Scrum Sprint Planning & Retrospective Simulation',
    url: 'https://scrumguides.org/',
    rank: 1,
  },
  fintech: {
    title: 'Personal Financial Analytics & Budgeting App',
    url: 'https://plaid.com/docs/',
    rank: 1,
  },
  healthcare: {
    title: 'Clinical Records & Health Data Dashboard',
    url: 'https://hl7.org/fhir/',
    rank: 1,
  },
  'e-commerce': {
    title: 'Inventory & Product Catalog API Service',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side',
    rank: 1,
  },
};

async function run() {
  console.log('🧹 [1/3] Clearing past database data...');

  // 1. Delete dependent tables in order
  const tables = [
    'matched_lines',
    'match_reports',
    'job_descriptions',
    'resumes',
    'roadmap_items',
    'skill_taxonomy',
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.warn(`  ⚠️ Table ${table} delete note:`, error.message);
    } else {
      console.log(`  ✓ Cleared table: ${table}`);
    }
  }

  console.log('\n🌱 [2/3] Seeding fresh 22 skill taxonomy records...');
  const { data: insertedSkills, error: skillErr } = await supabase
    .from('skill_taxonomy')
    .upsert(SKILLS_DATA, { onConflict: 'name' })
    .select('id, name, category');

  if (skillErr) {
    console.error('  ❌ Error inserting skill taxonomy:', skillErr);
    process.exit(1);
  }
  console.log(`  ✓ Seeded ${insertedSkills.length} skills into skill_taxonomy!`);

  // Map skill name -> ID
  const skillMap = {};
  insertedSkills.forEach((s) => {
    skillMap[s.name] = s.id;
  });

  console.log('\n🗺️ [3/3] Seeding curated roadmap project recommendations...');
  const roadmapRecords = [];
  for (const [skillName, proj] of Object.entries(ROADMAP_PROJECTS)) {
    const skillId = skillMap[skillName];
    if (skillId) {
      roadmapRecords.push({
        skill_id: skillId,
        project_title: proj.title,
        resource_url: proj.url,
        impact_rank: proj.rank,
      });
    }
  }

  const { data: insertedRoadmaps, error: roadErr } = await supabase
    .from('roadmap_items')
    .insert(roadmapRecords)
    .select('id');

  if (roadErr) {
    console.error('  ❌ Error inserting roadmap items:', roadErr);
    process.exit(1);
  }
  console.log(`  ✓ Seeded ${insertedRoadmaps.length} roadmap items into roadmap_items!`);

  console.log('\n✨ Verifying database state:');
  const { count: finalSkills } = await supabase.from('skill_taxonomy').select('*', { count: 'exact', head: true });
  const { count: finalRoadmaps } = await supabase.from('roadmap_items').select('*', { count: 'exact', head: true });
  const { count: finalReports } = await supabase.from('match_reports').select('*', { count: 'exact', head: true });
  const { count: finalResumes } = await supabase.from('resumes').select('*', { count: 'exact', head: true });
  const { count: finalJDs } = await supabase.from('job_descriptions').select('*', { count: 'exact', head: true });

  console.log(`  • skill_taxonomy: ${finalSkills} rows`);
  console.log(`  • roadmap_items:  ${finalRoadmaps} rows`);
  console.log(`  • match_reports:  ${finalReports} rows (clean)`);
  console.log(`  • resumes:        ${finalResumes} rows (clean)`);
  console.log(`  • job_descriptions: ${finalJDs} rows (clean)`);
  console.log('\n🎉 Complete! Database is clean and freshly seeded.');
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
