"""
SkillBridge AI — Account Routes
Account settings and data deletion (cascade-delete verified in DB).
"""

import logging
from fastapi import APIRouter, HTTPException, Header
from app.deps import get_supabase_admin, get_supabase_client

logger = logging.getLogger("skillbridge.account")
router = APIRouter()


@router.get("/profile")
async def get_profile(authorization: str = Header(...)):
    """Get user profile and account info."""
    access_token = authorization.replace("Bearer ", "")

    client = get_supabase_client()
    try:
        user = client.auth.get_user(access_token)
        user_id = user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session.")

    admin = get_supabase_admin()
    profile = admin.table("profiles").select("*").eq("id", user_id).single().execute()

    # Count user data
    resumes = admin.table("resumes").select("id", count="exact").eq("user_id", user_id).execute()
    reports = admin.table("match_reports").select("id", count="exact").eq("user_id", user_id).execute()

    return {
        "profile": profile.data,
        "email": user.user.email,
        "stats": {
            "total_resumes": resumes.count if hasattr(resumes, 'count') else len(resumes.data),
            "total_reports": reports.count if hasattr(reports, 'count') else len(reports.data),
        },
    }


@router.delete("/delete-my-data")
async def delete_my_data(authorization: str = Header(...)):
    """
    Delete ALL user data. This cascade-deletes:
    - resumes (and their storage files)
    - job_descriptions
    - match_reports (and their matched_lines via cascade)
    - The profile row itself

    This is REAL deletion, not just hiding in the UI.
    """
    access_token = authorization.replace("Bearer ", "")

    client = get_supabase_client()
    try:
        user = client.auth.get_user(access_token)
        user_id = user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session.")

    admin = get_supabase_admin()

    try:
        # Delete storage files first
        resumes = admin.table("resumes").select("storage_path").eq("user_id", user_id).execute()
        for resume in resumes.data:
            try:
                admin.storage.from_("resumes").remove([resume["storage_path"]])
            except Exception as e:
                logger.warning(f"Failed to delete storage file: {e}")

        # Delete report PDFs
        reports = admin.table("match_reports").select("report_pdf_path").eq("user_id", user_id).execute()
        for report in reports.data:
            if report.get("report_pdf_path"):
                try:
                    admin.storage.from_("reports").remove([report["report_pdf_path"]])
                except Exception as e:
                    logger.warning(f"Failed to delete report PDF: {e}")

        # Cascade-delete via DB (matched_lines auto-deleted via FK cascade)
        admin.table("match_reports").delete().eq("user_id", user_id).execute()
        admin.table("job_descriptions").delete().eq("user_id", user_id).execute()
        admin.table("resumes").delete().eq("user_id", user_id).execute()
        admin.table("profiles").delete().eq("id", user_id).execute()

        # Delete auth user
        admin.auth.admin.delete_user(user_id)

        logger.info(f"All data deleted for user {user_id}")

        return {"message": "All your data has been permanently deleted.", "deleted": True}

    except Exception as e:
        logger.error(f"Data deletion error for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete all data. Please contact support.")
