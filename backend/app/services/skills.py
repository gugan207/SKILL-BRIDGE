"""
SkillBridge AI — Skill Extraction Service
Uses SkillNer (spaCy + EMSI/Lightcast taxonomy) for skill extraction.
Same extraction path for both resume and JD text.
"""

import logging
import re

logger = logging.getLogger("skillbridge.skills")

# Fallback skill extraction using keyword matching when SkillNer is unavailable
SKILL_KEYWORDS = {
    "technical": [
        "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust", "ruby",
        "react", "angular", "vue", "node.js", "express", "django", "flask", "fastapi",
        "spring", "spring boot", "html", "css", "sql", "nosql", "graphql", "rest api",
        "machine learning", "deep learning", "natural language processing", "nlp",
        "computer vision", "data science", "data engineering", "data analysis",
        "artificial intelligence", "neural networks", "tensorflow", "pytorch",
        "scikit-learn", "pandas", "numpy", "algorithms", "data structures",
        "microservices", "system design", "distributed systems", "cloud computing",
        "devops", "ci/cd", "containerization", "kubernetes", "blockchain",
        "cybersecurity", "networking", "embedded systems", "mobile development",
        "ios", "android", "flutter", "react native", "web development",
        "backend development", "frontend development", "full stack",
    ],
    "tool": [
        "docker", "kubernetes", "aws", "azure", "gcp", "google cloud", "terraform",
        "jenkins", "github actions", "gitlab ci", "ansible", "linux", "unix",
        "git", "github", "bitbucket", "jira", "confluence", "slack",
        "mongodb", "postgresql", "mysql", "redis", "elasticsearch",
        "kafka", "rabbitmq", "nginx", "apache", "vscode", "intellij",
        "postman", "swagger", "figma", "tableau", "power bi",
        "excel", "google sheets", "jupyter", "databricks", "snowflake",
        "supabase", "firebase", "vercel", "netlify", "heroku",
    ],
    "soft": [
        "leadership", "communication", "teamwork", "problem solving",
        "critical thinking", "project management", "time management",
        "agile", "scrum", "kanban", "mentoring", "collaboration",
        "presentation", "public speaking", "negotiation", "conflict resolution",
        "adaptability", "creativity", "analytical thinking", "decision making",
        "emotional intelligence", "work ethic", "attention to detail",
        "customer service", "stakeholder management", "cross-functional",
    ],
    "domain": [
        "fintech", "healthcare", "e-commerce", "edtech", "saas",
        "banking", "insurance", "supply chain", "logistics", "manufacturing",
        "retail", "media", "entertainment", "gaming", "automotive",
        "aerospace", "energy", "telecommunications", "real estate",
        "pharmaceutical", "biotech", "agriculture", "government",
    ],
}


def extract_skills(text: str) -> dict:
    """
    Extract skills from text using SkillNer (with fallback to keyword matching).
    Returns {
        "skills": [{"name": str, "category": str, "confidence": float}],
        "method": "skillner" | "keyword"
    }
    """
    try:
        return _extract_with_skillner(text)
    except Exception as e:
        logger.warning(f"SkillNer unavailable ({e}), falling back to keyword extraction")
        return _extract_with_keywords(text)


def _extract_with_skillner(text: str) -> dict:
    """Extract skills using SkillNer (spaCy + EMSI taxonomy)."""
    import spacy
    from skillNer.general_params import SKILL_DB
    from skillNer.skill_extractor_class import SkillExtractor

    nlp = spacy.load("en_core_web_lg")
    skill_extractor = SkillExtractor(nlp, SKILL_DB, PhraseMatcher=None)

    annotations = skill_extractor.annotate(text)

    skills = []
    seen = set()

    # Process full matches
    for match in annotations.get("results", {}).get("full_matches", []):
        name = match["doc_node_value"].lower().strip()
        if name not in seen:
            seen.add(name)
            category = _categorize_skill(name)
            skills.append({
                "name": name,
                "category": category,
                "confidence": round(match.get("score", 0.8), 2),
            })

    # Process sub matches
    for match in annotations.get("results", {}).get("ngram_scored", []):
        if match.get("score", 0) > 0.5:
            name = match["doc_node_value"].lower().strip()
            if name not in seen:
                seen.add(name)
                category = _categorize_skill(name)
                skills.append({
                    "name": name,
                    "category": category,
                    "confidence": round(match["score"], 2),
                })

    logger.info(f"SkillNer extracted {len(skills)} skills")
    return {"skills": skills, "method": "skillner"}


def _extract_with_keywords(text: str) -> dict:
    """Fallback keyword-based skill extraction."""
    text_lower = text.lower()
    skills = []
    seen = set()

    for category, keywords in SKILL_KEYWORDS.items():
        for keyword in keywords:
            # Use word boundary matching for accuracy
            pattern = r'\b' + re.escape(keyword) + r'\b'
            if re.search(pattern, text_lower) and keyword not in seen:
                seen.add(keyword)
                skills.append({
                    "name": keyword,
                    "category": category,
                    "confidence": 0.7,  # Lower confidence for keyword matching
                })

    logger.info(f"Keyword extraction found {len(skills)} skills")
    return {"skills": skills, "method": "keyword"}


def _categorize_skill(skill_name: str) -> str:
    """Categorize a skill into technical/tool/soft/domain."""
    name = skill_name.lower()
    for category, keywords in SKILL_KEYWORDS.items():
        if name in keywords:
            return category
    return "technical"  # Default


def find_skill_gaps(resume_skills: list[dict], jd_skills: list[dict]) -> dict:
    """
    Compare resume skills against JD skills.
    Returns matched skills, missing skills, and overlap percentage.
    """
    resume_set = {s["name"].lower() for s in resume_skills}
    jd_set = {s["name"].lower() for s in jd_skills}

    matched = []
    missing = []

    for jd_skill in jd_skills:
        name = jd_skill["name"].lower()
        if name in resume_set:
            # Find corresponding resume skill for confidence
            resume_match = next(
                (s for s in resume_skills if s["name"].lower() == name), None
            )
            matched.append({
                **jd_skill,
                "resume_confidence": resume_match["confidence"] if resume_match else 0,
            })
        else:
            missing.append(jd_skill)

    # Sort missing by category priority: technical > tool > domain > soft
    category_order = {"technical": 0, "tool": 1, "domain": 2, "soft": 3}
    missing.sort(key=lambda s: category_order.get(s["category"], 4))

    coverage = len(matched) / len(jd_skills) * 100 if jd_skills else 0

    return {
        "matched": matched,
        "missing": missing,
        "coverage_percent": round(coverage, 1),
        "total_jd_skills": len(jd_skills),
        "total_resume_skills": len(resume_skills),
    }
