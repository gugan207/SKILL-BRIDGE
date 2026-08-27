"""
SkillBridge AI — Upload Routes
Resume upload with pre-check, parsing (pdfplumber/python-docx/OCR), and storage.
"""

import logging
import io
import hashlib
from fastapi import APIRouter, HTTPException, UploadFile, File, Header
from app.deps import get_supabase_admin, get_supabase_client
from app.config import get_settings
from app.services.parsing import extract_text
from app.services.precheck import precheck_file

logger = logging.getLogger("skillbridge.upload")
router = APIRouter()
settings = get_settings()


@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    authorization: str = Header(..., description="Bearer <access_token>"),
):
    """
    Upload a resume file (PDF or DOCX).
    1. Pre-check (size, type, readability)
    2. Parse text (pdfplumber → python-docx → OCR fallback)
    3. Store file in private Supabase Storage bucket
    4. Create resumes row with parsed text
    """
    access_token = authorization.replace("Bearer ", "")

    # Validate user session
    client = get_supabase_client()
    try:
        user = client.auth.get_user(access_token)
        user_id = user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session.")

    # Read file bytes
    file_bytes = await file.read()

    # Step 1: Pre-check
    precheck_result = precheck_file(file_bytes, file.filename, file.content_type)
    if not precheck_result["ok"]:
        raise HTTPException(status_code=400, detail=precheck_result["message"])

    # Step 2: Parse text
    try:
        parsed_text = extract_text(file_bytes, file.filename)
    except Exception as e:
        logger.error(f"Parse error for {file.filename}: {e}")
        raise HTTPException(
            status_code=422,
            detail=(
                "Could not extract text from this file. "
                "Please try a different format or paste your resume text directly."
            ),
        )

    if not parsed_text or len(parsed_text.strip()) < 50:
        raise HTTPException(
            status_code=422,
            detail=(
                "The uploaded file appears to be mostly empty or unreadable. "
                "Please try a text-based PDF or paste your resume text directly."
            ),
        )

    # Step 3: Upload to private Supabase Storage
    file_hash = hashlib.md5(file_bytes).hexdigest()[:8]
    safe_name = f"{user_id}/{file_hash}_{file.filename}"

    admin = get_supabase_admin()
    try:
        admin.storage.from_("resumes").upload(
            safe_name,
            file_bytes,
            {"content-type": file.content_type or "application/pdf"},
        )
    except Exception as e:
        logger.error(f"Storage upload error: {e}")
        # If file already exists, that's fine
        if "Duplicate" not in str(e) and "already exists" not in str(e):
            raise HTTPException(status_code=500, detail="Failed to store resume file.")

    # Step 4: Create resumes row
    try:
        result = admin.table("resumes").insert({
            "user_id": user_id,
            "file_name": file.filename,
            "storage_path": safe_name,
            "parsed_text": parsed_text,
        }).execute()

        resume_id = result.data[0]["id"]
        logger.info(f"Resume uploaded: {resume_id} for user {user_id}")

        return {
            "resume_id": resume_id,
            "file_name": file.filename,
            "text_length": len(parsed_text),
            "preview": parsed_text[:300] + "..." if len(parsed_text) > 300 else parsed_text,
        }

    except Exception as e:
        logger.error(f"DB insert error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save resume data.")


@router.post("/paste-resume")
async def paste_resume_text(
    text: str,
    authorization: str = Header(...),
):
    """Fallback: paste resume text directly when file parsing fails."""
    access_token = authorization.replace("Bearer ", "")

    client = get_supabase_client()
    try:
        user = client.auth.get_user(access_token)
        user_id = user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session.")

    if not text or len(text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume text is too short. Please provide more content.")

    admin = get_supabase_admin()
    result = admin.table("resumes").insert({
        "user_id": user_id,
        "file_name": "pasted_resume.txt",
        "storage_path": f"{user_id}/pasted_text",
        "parsed_text": text.strip(),
    }).execute()

    return {
        "resume_id": result.data[0]["id"],
        "file_name": "pasted_resume.txt",
        "text_length": len(text.strip()),
    }
