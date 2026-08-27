"""
SkillBridge AI — Analysis Routes
Triggers the full analysis pipeline with streaming progress updates.
"""

import json
import logging
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.deps import get_supabase_client
from app.services.pipeline import run_analysis

logger = logging.getLogger("skillbridge.analysis")
router = APIRouter()


class AnalysisRequest(BaseModel):
    resume_id: str
    jd_text: str
    jd_title: str | None = None
    jd_company: str | None = None


@router.post("/run")
async def start_analysis(
    req: AnalysisRequest,
    authorization: str = Header(...),
):
    """
    Start a full analysis. Returns a streaming response with pipeline progress.
    Each line is a JSON object: {"stage": "...", "message": "..."}
    The final message includes the complete report.
    """
    access_token = authorization.replace("Bearer ", "")

    # Validate user
    client = get_supabase_client()
    try:
        user = client.auth.get_user(access_token)
        user_id = user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session.")

    # Validate JD text
    if not req.jd_text or len(req.jd_text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short. Please provide more detail.",
        )

    def event_stream():
        try:
            for update in run_analysis(
                resume_id=req.resume_id,
                jd_text=req.jd_text.strip(),
                jd_title=req.jd_title,
                jd_company=req.jd_company,
                user_id=user_id,
            ):
                yield f"data: {json.dumps(update)}\n\n"
        except Exception as e:
            logger.error(f"Analysis pipeline error: {e}")
            yield f"data: {json.dumps({'stage': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@router.post("/run-sync")
async def run_analysis_sync(
    req: AnalysisRequest,
    authorization: str = Header(...),
):
    """
    Synchronous analysis endpoint (non-streaming).
    Returns the complete report in a single response.
    """
    access_token = authorization.replace("Bearer ", "")

    client = get_supabase_client()
    try:
        user = client.auth.get_user(access_token)
        user_id = user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session.")

    if not req.jd_text or len(req.jd_text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short.",
        )

    try:
        result = None
        for update in run_analysis(
            resume_id=req.resume_id,
            jd_text=req.jd_text.strip(),
            jd_title=req.jd_title,
            jd_company=req.jd_company,
            user_id=user_id,
        ):
            if update.get("stage") == "complete":
                result = update
        return result
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
