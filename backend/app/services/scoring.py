"""
SkillBridge AI — Scoring Service
Employability score (0-100) combining semantic similarity and skill coverage.
Skills categorized into radar (technical/tools/soft/domain).
"""

import logging
import numpy as np

logger = logging.getLogger("skillbridge.scoring")


def compute_employability_score(
    semantic_similarity: float,
    skill_coverage_percent: float,
    matched_skills: list[dict],
    missing_skills: list[dict],
) -> dict:
    """
    Compute employability score (0-100) with documented formula:

    score = (
        semantic_similarity * 0.4          # How closely the resume matches JD semantically
        + skill_coverage * 0.35            # What % of JD skills are present
        + skill_depth_bonus * 0.15         # Average confidence of matched skills
        + category_breadth_bonus * 0.10    # Coverage across categories
    ) * 100

    Returns the score and a breakdown for transparency.
    """
    # Component 1: Semantic similarity (0-1)
    sem_score = max(0, min(1, semantic_similarity))

    # Component 2: Skill coverage (0-1)
    coverage = skill_coverage_percent / 100.0

    # Component 3: Skill depth — average confidence of matched skills
    if matched_skills:
        avg_confidence = np.mean([s.get("confidence", 0.5) for s in matched_skills])
    else:
        avg_confidence = 0.0

    # Component 4: Category breadth — how many categories are covered
    matched_categories = set(s.get("category", "") for s in matched_skills)
    total_categories = 4  # technical, tool, soft, domain
    breadth = len(matched_categories) / total_categories

    # Weighted sum
    raw_score = (
        sem_score * 0.40
        + coverage * 0.35
        + avg_confidence * 0.15
        + breadth * 0.10
    )

    final_score = int(round(raw_score * 100))
    final_score = max(0, min(100, final_score))

    breakdown = {
        "semantic_similarity": round(sem_score * 100, 1),
        "skill_coverage": round(coverage * 100, 1),
        "skill_depth": round(avg_confidence * 100, 1),
        "category_breadth": round(breadth * 100, 1),
        "weights": {
            "semantic_similarity": 0.40,
            "skill_coverage": 0.35,
            "skill_depth": 0.15,
            "category_breadth": 0.10,
        },
    }

    logger.info(f"Employability score: {final_score}/100")
    return {"score": final_score, "breakdown": breakdown}


def build_skill_radar(
    matched_skills: list[dict],
    missing_skills: list[dict],
) -> dict:
    """
    Build radar chart data categorizing skills into:
    technical, tool, soft, domain.

    Returns per-category counts (matched vs total) for radar visualization.
    """
    categories = ["technical", "tool", "soft", "domain"]
    radar = {}

    for cat in categories:
        matched_in_cat = [s for s in matched_skills if s.get("category") == cat]
        missing_in_cat = [s for s in missing_skills if s.get("category") == cat]
        total = len(matched_in_cat) + len(missing_in_cat)

        radar[cat] = {
            "matched": len(matched_in_cat),
            "missing": len(missing_in_cat),
            "total": total,
            "score": round(len(matched_in_cat) / total * 100) if total > 0 else 0,
            "matched_skills": [s["name"] for s in matched_in_cat],
            "missing_skills": [s["name"] for s in missing_in_cat],
        }

    return radar


def compute_cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """Compute cosine similarity between two embedding vectors."""
    a = np.array(vec_a)
    b = np.array(vec_b)

    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return float(dot / (norm_a * norm_b))
