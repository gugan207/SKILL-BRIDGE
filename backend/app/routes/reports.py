"""
SkillBridge AI — Report Routes
Report retrieval, history listing, and PDF generation/download.
"""

import io
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse
from app.deps import get_supabase_admin, get_supabase_client
from app.services.pdf_generator import generate_report_pdf

logger = logging.getLogger("skillbridge.reports")
router = APIRouter()


@router.get("/")
async def list_reports(authorization: str = Header(...)):
    """List all reports for the current user (History screen)."""
    access_token = authorization.replace("Bearer ", "")

    client = get_supabase_client()
    try:
        user = client.auth.get_user(access_token)
        user_id = user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session.")

    admin = get_supabase_admin()
    result = admin.table("match_reports") \
        .select("id, employability_score, skill_radar, created_at, jd_id") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .execute()

    # Enrich with JD title/company
    reports = []
    for report in result.data:
        jd_data = admin.table("job_descriptions") \
            .select("title, company") \
            .eq("id", report["jd_id"]) \
            .single() \
            .execute()

        reports.append({
            "id": report["id"],
            "employability_score": report["employability_score"],
            "jd_title": jd_data.data.get("title") if jd_data.data else None,
            "jd_company": jd_data.data.get("company") if jd_data.data else None,
            "created_at": report["created_at"],
        })

    return {"reports": reports, "total": len(reports)}


@router.get("/{report_id}")
async def get_report(report_id: str, authorization: str = Header(...)):
    """Get a full report by ID."""
    access_token = authorization.replace("Bearer ", "")

    client = get_supabase_client()
    try:
        user = client.auth.get_user(access_token)
        user_id = user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session.")

    admin = get_supabase_admin()
    result = admin.table("match_reports") \
        .select("*") \
        .eq("id", report_id) \
        .eq("user_id", user_id) \
        .single() \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found.")

    report = result.data

    # Get matched lines
    lines = admin.table("matched_lines") \
        .select("*") \
        .eq("report_id", report_id) \
        .execute()

    # Get JD info
    jd = admin.table("job_descriptions") \
        .select("title, company, raw_text") \
        .eq("id", report["jd_id"]) \
        .single() \
        .execute()

    return {
        **report,
        "matched_lines": lines.data,
        "jd_title": jd.data.get("title") if jd.data else None,
        "jd_company": jd.data.get("company") if jd.data else None,
    }


@router.get("/{report_id}/pdf")
async def download_report_pdf(report_id: str, authorization: str = Header(...)):
    """Generate and download a PDF report."""
    access_token = authorization.replace("Bearer ", "")

    client = get_supabase_client()
    try:
        user = client.auth.get_user(access_token)
        user_id = user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session.")

    admin = get_supabase_admin()
    result = admin.table("match_reports") \
        .select("*") \
        .eq("id", report_id) \
        .eq("user_id", user_id) \
        .single() \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found.")

    report = result.data

    # Get JD info
    jd = admin.table("job_descriptions") \
        .select("title, company") \
        .eq("id", report["jd_id"]) \
        .single() \
        .execute()

    jd_title = jd.data.get("title", "Job Analysis") if jd.data else "Job Analysis"

    # Generate PDF
    try:
        pdf_bytes = generate_report_pdf(report, jd_title)
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate PDF.")

    filename = f"SkillBridge_Report_{jd_title.replace(' ', '_')}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
