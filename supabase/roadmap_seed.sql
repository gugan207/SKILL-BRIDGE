-- SkillBridge AI — Roadmap Seed Data
-- 22 curated skills with project recommendations

INSERT INTO skill_taxonomy (name, category) VALUES
  ('python', 'technical'),
  ('javascript', 'technical'),
  ('typescript', 'technical'),
  ('react', 'technical'),
  ('node.js', 'technical'),
  ('sql', 'technical'),
  ('machine learning', 'technical'),
  ('data science', 'technical'),
  ('docker', 'tool'),
  ('kubernetes', 'tool'),
  ('aws', 'tool'),
  ('git', 'tool'),
  ('postgresql', 'tool'),
  ('redis', 'tool'),
  ('ci/cd', 'tool'),
  ('leadership', 'soft'),
  ('communication', 'soft'),
  ('project management', 'soft'),
  ('agile', 'soft'),
  ('fintech', 'domain'),
  ('healthcare', 'domain'),
  ('e-commerce', 'domain')
ON CONFLICT (name) DO NOTHING;

-- Roadmap items for each skill
INSERT INTO roadmap_items (skill_id, project_title, project_description, resource_url, difficulty, estimated_hours, impact_rank)
SELECT s.id, r.title, r.description, r.url, r.difficulty, r.hours, r.rank
FROM skill_taxonomy s
CROSS JOIN LATERAL (VALUES
  ('python', 'Build a CLI Task Manager', 'Create a command-line task manager with file persistence, priorities, and due dates using only stdlib.', 'https://realpython.com/python-project-ideas/', 'beginner', 8, 1),
  ('javascript', 'Interactive Quiz App', 'Build a dynamic quiz app with scoring, timer, and local storage for progress tracking.', 'https://developer.mozilla.org/en-US/docs/Learn', 'beginner', 6, 1),
  ('typescript', 'Type-Safe API Client', 'Build a fully typed REST API client with generics, error handling, and request interceptors.', 'https://www.typescriptlang.org/docs/handbook/', 'intermediate', 10, 1),
  ('react', 'Personal Dashboard App', 'Build a modular dashboard with widgets, drag-and-drop layout, and data visualization.', 'https://react.dev/learn', 'intermediate', 15, 1),
  ('node.js', 'Real-Time Chat Server', 'Build a WebSocket chat server with rooms, user presence, and message history.', 'https://nodejs.org/en/learn', 'intermediate', 12, 1),
  ('sql', 'E-Commerce Database Design', 'Design and query a normalized e-commerce schema with products, orders, reviews, and analytics views.', 'https://sqlbolt.com/', 'beginner', 8, 1),
  ('machine learning', 'Sentiment Analysis Pipeline', 'Build an end-to-end ML pipeline: data collection, preprocessing, model training, and API deployment.', 'https://scikit-learn.org/stable/tutorial/', 'intermediate', 20, 1),
  ('data science', 'Exploratory Data Analysis Project', 'Perform EDA on a real dataset with pandas, visualization, statistical analysis, and a written report.', 'https://kaggle.com/learn', 'beginner', 12, 1),
  ('docker', 'Containerize a Full-Stack App', 'Dockerize a multi-service app with frontend, backend, and database using Docker Compose.', 'https://docs.docker.com/get-started/', 'intermediate', 8, 1),
  ('kubernetes', 'Deploy to a K8s Cluster', 'Deploy a microservice to Kubernetes with deployments, services, config maps, and horizontal autoscaling.', 'https://kubernetes.io/docs/tutorials/', 'advanced', 15, 1),
  ('aws', 'Serverless API on Lambda', 'Build and deploy a serverless REST API using AWS Lambda, API Gateway, and DynamoDB.', 'https://aws.amazon.com/getting-started/', 'intermediate', 12, 1),
  ('git', 'Open Source Contribution Guide', 'Fork a popular repo, fix a real issue, write tests, and submit a pull request following contribution guidelines.', 'https://opensource.guide/how-to-contribute/', 'beginner', 4, 1),
  ('postgresql', 'Advanced Query Workshop', 'Master window functions, CTEs, JSON operations, and full-text search with PostgreSQL.', 'https://www.postgresqltutorial.com/', 'intermediate', 10, 1),
  ('redis', 'Caching Layer Implementation', 'Add Redis caching to an existing API with cache invalidation, TTL strategies, and pub/sub messaging.', 'https://redis.io/docs/getting-started/', 'intermediate', 8, 1),
  ('ci/cd', 'GitHub Actions Pipeline', 'Set up a complete CI/CD pipeline with linting, testing, building, and automated deployment.', 'https://docs.github.com/en/actions', 'intermediate', 6, 1),
  ('leadership', 'Lead a Team Project', 'Organize and lead a 3-person team project with sprint planning, daily standups, and retrospectives.', NULL, 'beginner', 20, 1),
  ('communication', 'Technical Blog Series', 'Write a 5-post technical blog series explaining complex topics to beginners with diagrams and examples.', 'https://dev.to/', 'beginner', 10, 1),
  ('project management', 'Kanban Board Implementation', 'Build a project management tool with drag-and-drop tasks, labels, assignees, and progress tracking.', NULL, 'intermediate', 15, 1),
  ('agile', 'Scrum Simulation', 'Run a 2-week sprint simulation with user stories, story points, velocity tracking, and a retrospective.', 'https://scrumguides.org/', 'beginner', 8, 1),
  ('fintech', 'Personal Finance Tracker', 'Build a finance app with transaction categorization, budget tracking, and spending visualizations.', NULL, 'intermediate', 15, 1),
  ('healthcare', 'Patient Records Dashboard', 'Build a HIPAA-aware patient dashboard with data visualization and role-based access control.', NULL, 'intermediate', 18, 1),
  ('e-commerce', 'Product Catalog API', 'Build a RESTful product catalog with search, filtering, pagination, and inventory management.', NULL, 'intermediate', 12, 1)
) AS r(skill, title, description, url, difficulty, hours, rank)
WHERE s.name = r.skill;
