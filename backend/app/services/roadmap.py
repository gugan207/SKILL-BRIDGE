"""
SkillBridge AI — Roadmap Service
Looks up curated roadmap items for missing skills.
Handles the case where a skill isn't in the seed data gracefully.
"""

import logging
from app.deps import get_supabase_admin

logger = logging.getLogger("skillbridge.roadmap")


def get_roadmap_for_skills(missing_skills: list[dict]) -> list[dict]:
    """
    For each missing skill, look up:
    1. Curated roadmap_items (project title, resource URL)
    2. Cached YouTube video from skill_taxonomy
    3. Cached GitHub repo from skill_taxonomy

    Returns a ranked list of roadmap recommendations.
    """
    admin = get_supabase_admin()
    roadmap = []

    for i, skill in enumerate(missing_skills):
        skill_name = skill["name"].lower()

        # Look up skill in taxonomy
        tax_result = admin.table("skill_taxonomy") \
            .select("*") \
            .ilike("name", skill_name) \
            .execute()

        taxonomy_entry = tax_result.data[0] if tax_result.data else None

        # Look up roadmap items for this skill
        roadmap_items = []
        if taxonomy_entry:
            items_result = admin.table("roadmap_items") \
                .select("*") \
                .eq("skill_id", taxonomy_entry["id"]) \
                .order("impact_rank") \
                .execute()
            roadmap_items = items_result.data or []

        # Build roadmap entry
        entry = {
            "rank": i + 1,
            "skill_name": skill["name"],
            "category": skill.get("category", "technical"),
            "confidence": skill.get("confidence", 0),
            # Curated project/resource
            "project": roadmap_items[0] if roadmap_items else {
                "project_title": f"Build a project using {skill['name']}",
                "project_description": f"Create a hands-on project to demonstrate your {skill['name']} skills.",
                "resource_url": None,
                "difficulty": "beginner",
            },
            # YouTube video
            "youtube": {
                "video_id": taxonomy_entry.get("youtube_video_id") if taxonomy_entry else None,
                "title": taxonomy_entry.get("youtube_video_title") if taxonomy_entry else None,
                "channel": taxonomy_entry.get("youtube_channel_title") if taxonomy_entry else None,
                "thumbnail": taxonomy_entry.get("youtube_thumbnail_url") if taxonomy_entry else None,
            } if taxonomy_entry and taxonomy_entry.get("youtube_video_id") else None,
            # GitHub resource
            "github": {
                "repo_url": taxonomy_entry.get("github_repo_url") if taxonomy_entry else None,
                "repo_name": taxonomy_entry.get("github_repo_name") if taxonomy_entry else None,
                "stars": taxonomy_entry.get("github_repo_stars") if taxonomy_entry else None,
                "good_first_issue_url": taxonomy_entry.get("github_good_first_issue_url") if taxonomy_entry else None,
            } if taxonomy_entry and taxonomy_entry.get("github_repo_url") else None,
            # AI explanation (filled later by the pipeline)
            "ai_explanation": None,
        }

        roadmap.append(entry)

    logger.info(f"Built roadmap for {len(roadmap)} missing skills")
    return roadmap
