"""
SkillBridge AI — Analysis Pipeline
Orchestrates the full resume-to-report pipeline:
parse → extract skills → embed → match → score → roadmap → explain → assemble.
"""

import logging
from app.deps import get_supabase_admin
from app.services.skills import extract_skills, find_skill_gaps
from app.services.nvidia import get_embedding, generate_explanation
from app.services.scoring import (
    compute_employability_score,
    build_skill_radar,
    compute_cosine_similarity,
)
from app.services.roadmap import get_roadmap_for_skills

logger = logging.getLogger("skillbridge.pipeline")


def run_analysis(
    resume_id: str,
    jd_text: str,
    jd_title: str | None,
    jd_company: str | None,
    user_id: str,
) -> dict:
    """
    Run the full analysis pipeline. Returns a complete report object.

    Steps:
    1. Fetch resume parsed text
    2. Store JD
    3. Extract skills from both
    4. Embed both texts
    5. Compute similarity
    6. Find skill gaps
    7. Score employability
    8. Build roadmap
    9. Generate AI explanations
    10. Assemble and store report
    """
    admin = get_supabase_admin()

    # Step 1: Fetch resume
    resume_result = admin.table("resumes").select("*").eq("id", resume_id).single().execute()
    resume = resume_result.data
    resume_text = resume["parsed_text"]

    if not resume_text:
        raise ValueError("Resume has no parsed text.")

    # Step 2: Store JD
    jd_result = admin.table("job_descriptions").insert({
        "user_id": user_id,
        "title": jd_title,
        "company": jd_company,
        "raw_text": jd_text,
    }).execute()
    jd_id = jd_result.data[0]["id"]

    yield {"stage": "skills", "message": "Extracting skills from resume and job description..."}

    # Step 3: Extract skills
    resume_skills_result = extract_skills(resume_text)
    jd_skills_result = extract_skills(jd_text)

    resume_skills = resume_skills_result["skills"]
    jd_skills = jd_skills_result["skills"]

    yield {"stage": "embedding", "message": "Analyzing semantic similarity..."}

    # Step 4: Generate embeddings
    try:
        resume_embedding = get_embedding(resume_text, input_type="passage")
        jd_embedding = get_embedding(jd_text, input_type="query")

        # Store embeddings
        admin.table("resumes").update({
            "embedding": resume_embedding,
        }).eq("id", resume_id).execute()

        admin.table("job_descriptions").update({
            "embedding": jd_embedding,
        }).eq("id", jd_id).execute()
    except Exception as e:
        logger.error(f"Embedding generation failed: {e}")
        resume_embedding = None
        jd_embedding = None

    yield {"stage": "matching", "message": "Matching skills and computing scores..."}

    # Step 5: Compute semantic similarity
    if resume_embedding and jd_embedding:
        semantic_similarity = compute_cosine_similarity(resume_embedding, jd_embedding)
    else:
        semantic_similarity = 0.5  # Fallback if embeddings fail

    # Step 6: Find skill gaps
    gap_result = find_skill_gaps(resume_skills, jd_skills)

    # Step 7: Score employability
    score_result = compute_employability_score(
        semantic_similarity=semantic_similarity,
        skill_coverage_percent=gap_result["coverage_percent"],
        matched_skills=gap_result["matched"],
        missing_skills=gap_result["missing"],
    )

    # Step 8: Build radar
    radar = build_skill_radar(gap_result["matched"], gap_result["missing"])

    yield {"stage": "roadmap", "message": "Building your personalized roadmap..."}

    # Step 9: Get roadmap for missing skills
    roadmap = get_roadmap_for_skills(gap_result["missing"])

    yield {"stage": "explaining", "message": "Generating AI-powered insights..."}

    # Step 10: Generate AI explanations for top missing skills (limit to top 5 to save API calls)
    for i, item in enumerate(roadmap[:5]):
        try:
            explanation = generate_explanation(
                skill_name=item["skill_name"],
                resume_text=resume_text[:2000],  # Truncate to save tokens
                recommendation=item["project"]["project_title"] if isinstance(item["project"], dict) else str(item["project"]),
            )
            roadmap[i]["ai_explanation"] = explanation
        except Exception as e:
            logger.error(f"Explanation generation failed for {item['skill_name']}: {e}")
            roadmap[i]["ai_explanation"] = (
                f"Learning {item['skill_name']} will strengthen your profile by addressing "
                f"a key requirement in this role."
            )

    yield {"stage": "assembling", "message": "Assembling your report..."}

    # Step 11: Assemble and store report
    report_data = {
        "resume_id": resume_id,
        "jd_id": jd_id,
        "user_id": user_id,
        "employability_score": score_result["score"],
        "skill_radar": radar,
        "matched_skills": gap_result["matched"],
        "missing_skills": gap_result["missing"],
        "roadmap": roadmap,
        "ai_explanations": {
            item["skill_name"]: item.get("ai_explanation")
            for item in roadmap if item.get("ai_explanation")
        },
    }

    report_result = admin.table("match_reports").insert(report_data).execute()
    report_id = report_result.data[0]["id"]

    # Step 12: Store matched lines for explainability
    for match in gap_result["matched"]:
        admin.table("matched_lines").insert({
            "report_id": report_id,
            "skill_name": match["name"],
            "resume_line": f"Found '{match['name']}' in resume",
            "jd_requirement": f"Required: {match['name']}",
            "similarity_score": match.get("resume_confidence", match.get("confidence", 0)),
        }).execute()

    yield {
        "stage": "complete",
        "message": "Analysis complete!",
        "report": {
            "id": report_id,
            "employability_score": score_result["score"],
            "score_breakdown": score_result["breakdown"],
            "skill_radar": radar,
            "matched_skills": gap_result["matched"],
            "missing_skills": gap_result["missing"],
            "coverage_percent": gap_result["coverage_percent"],
            "roadmap": roadmap,
            "semantic_similarity": round(semantic_similarity * 100, 1),
            "jd_title": jd_title,
            "jd_company": jd_company,
            "created_at": report_result.data[0]["created_at"],
        },
    }
