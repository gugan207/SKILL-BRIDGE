"""
SkillBridge AI — Database Seeder
Seeds the Supabase skill_taxonomy and roadmap_items tables.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.deps import get_supabase_admin

SKILLS_DATA = [
    {"name": "python", "category": "technical"},
    {"name": "javascript", "category": "technical"},
    {"name": "typescript", "category": "technical"},
    {"name": "react", "category": "technical"},
    {"name": "node.js", "category": "technical"},
    {"name": "sql", "category": "technical"},
    {"name": "machine learning", "category": "technical"},
    {"name": "data science", "category": "technical"},
    {"name": "docker", "category": "tool"},
    {"name": "kubernetes", "category": "tool"},
    {"name": "aws", "category": "tool"},
    {"name": "git", "category": "tool"},
    {"name": "postgresql", "category": "tool"},
    {"name": "redis", "category": "tool"},
    {"name": "ci/cd", "category": "tool"},
    {"name": "leadership", "category": "soft"},
    {"name": "communication", "category": "soft"},
    {"name": "project management", "category": "soft"},
    {"name": "agile", "category": "soft"},
    {"name": "fintech", "category": "domain"},
    {"name": "healthcare", "category": "domain"},
    {"name": "e-commerce", "category": "domain"},
]

ROADMAP_PROJECTS = {
    "python": {
        "title": "Build a CLI Task Manager",
        "description": "Create a command-line task manager with file persistence, priorities, and due dates using only Python stdlib.",
        "url": "https://realpython.com/python-project-ideas/",
        "difficulty": "beginner",
        "hours": 8,
        "rank": 1,
    },
    "javascript": {
        "title": "Interactive Quiz App",
        "description": "Build a dynamic quiz app with scoring, timer, and local storage for progress tracking.",
        "url": "https://developer.mozilla.org/en-US/docs/Learn",
        "difficulty": "beginner",
        "hours": 6,
        "rank": 1,
    },
    "typescript": {
        "title": "Type-Safe API Client",
        "description": "Build a fully typed REST API client with generics, error handling, and request interceptors.",
        "url": "https://www.typescriptlang.org/docs/handbook/",
        "difficulty": "intermediate",
        "hours": 10,
        "rank": 1,
    },
    "react": {
        "title": "Personal Dashboard App",
        "description": "Build a modular dashboard with widgets, drag-and-drop layout, and responsive data visualization.",
        "url": "https://react.dev/learn",
        "difficulty": "intermediate",
        "hours": 15,
        "rank": 1,
    },
    "node.js": {
        "title": "Real-Time Chat Server",
        "description": "Build a WebSocket chat server with rooms, user presence, and message history.",
        "url": "https://nodejs.org/en/learn",
        "difficulty": "intermediate",
        "hours": 12,
        "rank": 1,
    },
    "sql": {
        "title": "E-Commerce Database Design",
        "description": "Design and query a normalized e-commerce schema with products, orders, reviews, and analytics views.",
        "url": "https://sqlbolt.com/",
        "difficulty": "beginner",
        "hours": 8,
        "rank": 1,
    },
    "machine learning": {
        "title": "Sentiment Analysis Pipeline",
        "description": "Build an end-to-end ML pipeline: data collection, preprocessing, model training, and API deployment.",
        "url": "https://scikit-learn.org/stable/tutorial/",
        "difficulty": "intermediate",
        "hours": 20,
        "rank": 1,
    },
    "data science": {
        "title": "Exploratory Data Analysis Project",
        "description": "Perform EDA on a real dataset with pandas, visualization, statistical analysis, and a written report.",
        "url": "https://kaggle.com/learn",
        "difficulty": "beginner",
        "hours": 12,
        "rank": 1,
    },
    "docker": {
        "title": "Containerize a Full-Stack App",
        "description": "Dockerize a multi-service app with frontend, backend, and database using Docker Compose.",
        "url": "https://docs.docker.com/get-started/",
        "difficulty": "intermediate",
        "hours": 8,
        "rank": 1,
    },
    "kubernetes": {
        "title": "Deploy to a K8s Cluster",
        "description": "Deploy a microservice to Kubernetes with deployments, services, config maps, and horizontal autoscaling.",
        "url": "https://kubernetes.io/docs/tutorials/",
        "difficulty": "advanced",
        "hours": 15,
        "rank": 1,
    },
    "aws": {
        "title": "Serverless API on Lambda",
        "description": "Build and deploy a serverless REST API using AWS Lambda, API Gateway, and DynamoDB.",
        "url": "https://aws.amazon.com/getting-started/",
        "difficulty": "intermediate",
        "hours": 12,
        "rank": 1,
    },
    "git": {
        "title": "Open Source Contribution",
        "description": "Fork a popular repo, fix a real issue, write tests, and submit a pull request following contribution guidelines.",
        "url": "https://opensource.guide/how-to-contribute/",
        "difficulty": "beginner",
        "hours": 4,
        "rank": 1,
    },
    "postgresql": {
        "title": "Advanced Query Workshop",
        "description": "Master window functions, CTEs, JSON operations, and full-text search with PostgreSQL.",
        "url": "https://www.postgresqltutorial.com/",
        "difficulty": "intermediate",
        "hours": 10,
        "rank": 1,
    },
    "redis": {
        "title": "Caching Layer Implementation",
        "description": "Add Redis caching to an existing API with cache invalidation, TTL strategies, and pub/sub messaging.",
        "url": "https://redis.io/docs/getting-started/",
        "difficulty": "intermediate",
        "hours": 8,
        "rank": 1,
    },
    "ci/cd": {
        "title": "GitHub Actions Pipeline",
        "description": "Set up a complete CI/CD pipeline with linting, testing, building, and automated deployment.",
        "url": "https://docs.github.com/en/actions",
        "difficulty": "intermediate",
        "hours": 6,
        "rank": 1,
    },
    "leadership": {
        "title": "Lead a Team Project",
        "description": "Organize and lead a 3-person team project with sprint planning, daily standups, and retrospectives.",
        "url": None,
        "difficulty": "beginner",
        "hours": 20,
        "rank": 1,
    },
    "communication": {
        "title": "Technical Blog Series",
        "description": "Write a 5-post technical blog series explaining complex topics to beginners with diagrams and examples.",
        "url": "https://dev.to/",
        "difficulty": "beginner",
        "hours": 10,
        "rank": 1,
    },
    "project management": {
        "title": "Kanban Board Implementation",
        "description": "Build a project management tool with drag-and-drop tasks, labels, assignees, and progress tracking.",
        "url": None,
        "difficulty": "intermediate",
        "hours": 15,
        "rank": 1,
    },
    "agile": {
        "title": "Scrum Simulation",
        "description": "Run a 2-week sprint simulation with user stories, story points, velocity tracking, and a retrospective.",
        "url": "https://scrumguides.org/",
        "difficulty": "beginner",
        "hours": 8,
        "rank": 1,
    },
    "fintech": {
        "title": "Personal Finance Tracker",
        "description": "Build a finance app with transaction categorization, budget tracking, and spending visualizations.",
        "url": None,
        "difficulty": "intermediate",
        "hours": 15,
        "rank": 1,
    },
    "healthcare": {
        "title": "Patient Records Dashboard",
        "description": "Build a HIPAA-aware patient dashboard with data visualization and role-based access control.",
        "url": None,
        "difficulty": "intermediate",
        "hours": 18,
        "rank": 1,
    },
    "e-commerce": {
        "title": "Product Catalog API",
        "description": "Build a RESTful product catalog with search, filtering, pagination, and inventory management.",
        "url": None,
        "difficulty": "intermediate",
        "hours": 12,
        "rank": 1,
    },
}


def seed():
    print("🌱 Seeding SkillBridge database...")
    admin = get_supabase_admin()

    # 1. Upsert skills
    for skill in SKILLS_DATA:
        try:
            admin.table("skill_taxonomy").upsert(
                {"name": skill["name"], "category": skill["category"]},
                on_conflict="name"
            ).execute()
        except Exception as e:
            print(f"Error seeding skill {skill['name']}: {e}")

    print(f"✅ Upserted {len(SKILLS_DATA)} skills in taxonomy.")

    # 2. Get skill IDs
    skills_res = admin.table("skill_taxonomy").select("id, name").execute()
    skill_map = {row["name"]: row["id"] for row in skills_res.data}

    # 3. Upsert roadmap items
    seeded_items = 0
    for skill_name, proj in ROADMAP_PROJECTS.items():
        skill_id = skill_map.get(skill_name)
        if not skill_id:
            continue

        try:
            # Check if exists
            existing = admin.table("roadmap_items").select("id").eq("skill_id", skill_id).execute()
            item_data = {
                "skill_id": skill_id,
                "project_title": proj["title"],
                "project_description": proj["description"],
                "resource_url": proj["url"],
                "difficulty": proj["difficulty"],
                "estimated_hours": proj["hours"],
                "impact_rank": proj["rank"],
            }
            if existing.data:
                admin.table("roadmap_items").update(item_data).eq("id", existing.data[0]["id"]).execute()
            else:
                admin.table("roadmap_items").insert(item_data).execute()
            seeded_items += 1
        except Exception as e:
            print(f"Error seeding roadmap for {skill_name}: {e}")

    print(f"✅ Upserted {seeded_items} roadmap project recommendations.")
    print("🎉 Database seeding complete!")


if __name__ == "__main__":
    seed()
