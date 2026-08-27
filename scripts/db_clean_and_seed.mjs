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
    title: 'Build a CLI Task Manager',
    description: 'Create a command-line task manager with file persistence, priorities, and due dates using Python standard library.',
    url: 'https://realpython.com/python-project-ideas/',
    difficulty: 'beginner',
    hours: 8,
    rank: 1,
  },
  javascript: {
    title: 'Interactive Quiz App',
    description: 'Build a dynamic quiz app with scoring, timer, and local storage for progress tracking.',
    url: 'https://developer.mozilla.org/en-US/docs/Learn',
    difficulty: 'beginner',
    hours: 6,
    rank: 1,
  },
  typescript: {
    title: 'Type-Safe API Client',
    description: 'Build a fully typed REST API client with generics, error handling, and request interceptors.',
    url: 'https://www.typescriptlang.org/docs/handbook/',
    difficulty: 'intermediate',
    hours: 10,
    rank: 1,
  },
  react: {
    title: 'Personal Dashboard App',
    description: 'Build a modular dashboard with widgets, drag-and-drop layout, and responsive data visualization.',
    url: 'https://react.dev/learn',
    difficulty: 'intermediate',
    hours: 15,
    rank: 1,
  },
  'node.js': {
    title: 'Real-Time Chat Server',
    description: 'Build a WebSocket chat server with rooms, user presence, and message history.',
    url: 'https://nodejs.org/en/learn',
    difficulty: 'intermediate',
    hours: 12,
    rank: 1,
  },
  sql: {
    title: 'E-Commerce Database Design',
    description: 'Design and query a normalized e-commerce schema with products, orders, reviews, and analytics views.',
    url: 'https://sqlbolt.com/',
    difficulty: 'beginner',
    hours: 8,
    rank: 1,
  },
  'machine learning': {
    title: 'Sentiment Analysis Pipeline',
    description: 'Build an end-to-end ML pipeline: data collection, preprocessing, model training, and API deployment.',
    url: 'https://scikit-learn.org/stable/tutorial/',
    difficulty: 'intermediate',
    hours: 20,
    rank: 1,
  },
  'data science': {
    title: 'Exploratory Data Analysis Project',
    description: 'Perform EDA on a real dataset with pandas, visualization, statistical analysis, and a written report.',
    url: 'https://kaggle.com/learn',
    difficulty: 'beginner',
    hours: 12,
    rank: 1,
  },
  docker: {
    title: 'Containerize a Full-Stack App',
    description: 'Dockerize a multi-service app with frontend, backend, and database using Docker Compose.',
    url: 'https://docs.docker.com/get-started/',
    difficulty: 'intermediate',
    hours: 8,
    rank: 1,
  },
  kubernetes: {
    title: 'Deploy to a K8s Cluster',
    description: 'Deploy a microservice to Kubernetes with deployments, services, config maps, and horizontal autoscaling.',
    url: 'https://kubernetes.io/docs/tutorials/',
    difficulty: 'advanced',
    hours: 15,
    rank: 1,
  },
  aws: {
    title: 'Serverless API on Lambda',
    description: 'Build and deploy a serverless REST API using AWS Lambda, API Gateway, and DynamoDB.',
    url: 'https://aws.amazon.com/getting-started/',
    difficulty: 'intermediate',
    hours: 12,
    rank: 1,
  },
  git: {
    title: 'Open Source Contribution Guide',
    description: 'Fork a popular repo, fix a real issue, write tests, and submit a pull request following contribution guidelines.',
    url: 'https://opensource.guide/how-to-contribute/',
    difficulty: 'beginner',
    hours: 4,
    rank: 1,
  },
  postgresql: {
    title: 'Advanced Query Workshop',
    description: 'Master window functions, CTEs, JSON operations, and full-text search with PostgreSQL.',
    url: 'https://www.postgresqltutorial.com/',
    difficulty: 'intermediate',
    hours: 10,
    rank: 1,
  },
  redis: {
    title: 'Caching Layer Implementation',
    description: 'Add Redis caching to an existing API with cache invalidation, TTL strategies, and pub/sub messaging.',
    url: 'https://redis.io/docs/getting-started/',
    difficulty: 'intermediate',
    hours: 8,
    rank: 1,
  },
  'ci/cd': {
    title: 'GitHub Actions Pipeline',
    description: 'Set up a complete CI/CD pipeline with linting, testing, building, and automated deployment.',
    url: 'https://docs.github.com/en/actions',
    difficulty: 'intermediate',
    hours: 6,
    rank: 1,
  },
  leadership: {
    title: 'Lead a Team Project',
    description: 'Organize and lead a 3-person team project with sprint planning, daily standups, and retrospectives.',
    url: 'https://hbr.org/topic/leadership',
    difficulty: 'beginner',
    hours: 20,
    rank: 1,
  },
  communication: {
    title: 'Technical Blog Series',
    description: 'Write a 5-post technical blog series explaining complex topics to beginners with diagrams and examples.',
    url: 'https://dev.to/',
    difficulty: 'beginner',
    hours: 10,
    rank: 1,
  },
  'project management': {
    title: 'Kanban Board Implementation',
    description: 'Build a project management tool with drag-and-drop tasks, labels, assignees, and progress tracking.',
    url: 'https://atlassian.com/agile/kanban',
    difficulty: 'intermediate',
    hours: 15,
    rank: 1,
  },
  agile: {
    title: 'Scrum Simulation',
    description: 'Run a 2-week sprint simulation with user stories, story points, velocity tracking, and a retrospective.',
    url: 'https://scrumguides.org/',
    difficulty: 'beginner',
    hours: 8,
    rank: 1,
  },
  fintech: {
    title: 'Personal Finance Tracker',
    description: 'Build a finance app with transaction categorization, budget tracking, and spending visualizations.',
    url: 'https://plaid.com/docs/',
    difficulty: 'intermediate',
    hours: 15,
    rank: 1,
  },
  healthcare: {
    title: 'Patient Records Dashboard',
    description: 'Build a HIPAA-aware patient dashboard with data visualization and role-based access control.',
    url: 'https://hl7.org/fhir/',
    difficulty: 'intermediate',
    hours: 18,
    rank: 1,
  },
  'e-commerce': {
    title: 'Product Catalog API',
    description: 'Build a RESTful product catalog with search, filtering, pagination, and inventory management.',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side',
    difficulty: 'intermediate',
    hours: 12,
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
    const { error, count } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
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
        project_description: proj.description,
        resource_url: proj.url,
        difficulty: proj.difficulty,
        estimated_hours: proj.hours,
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
  console.log('\n🎉 Complete! Database is clean and seeded with required SkillBridge data.');
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
