"""
SkillBridge AI — Pre-check Service
Cheap file validation BEFORE any expensive operations (NVIDIA calls, parsing).
Catches unreadable files immediately with honest error messages.
"""

import logging

logger = logging.getLogger("skillbridge.precheck")

ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
}

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}
MAX_SIZE_MB = 10
MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024


def precheck_file(
    file_bytes: bytes,
    filename: str | None = None,
    content_type: str | None = None,
) -> dict:
    """
    Run cheap checks on uploaded file before expensive processing.
    Returns {"ok": True/False, "message": "..."}.
    """
    # Check file size
    if len(file_bytes) > MAX_SIZE_BYTES:
        return {
            "ok": False,
            "message": f"File too large ({len(file_bytes) / 1024 / 1024:.1f}MB). Maximum is {MAX_SIZE_MB}MB.",
        }

    if len(file_bytes) < 100:
        return {
            "ok": False,
            "message": "File appears to be empty or too small to be a valid resume.",
        }

    # Check file extension
    if filename:
        ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext and ext not in ALLOWED_EXTENSIONS:
            return {
                "ok": False,
                "message": f"Unsupported file type '{ext}'. Please upload a PDF, DOCX, or TXT file.",
            }

    # Check content type
    if content_type and content_type not in ALLOWED_TYPES:
        # Don't hard-fail on content type alone — browser detection can be unreliable
        logger.warning(f"Unexpected content type: {content_type} for {filename}")

    # Check PDF header
    if filename and filename.lower().endswith(".pdf"):
        if not file_bytes[:5] == b"%PDF-":
            return {
                "ok": False,
                "message": "This file has a .pdf extension but doesn't appear to be a valid PDF.",
            }

    # Check DOCX header (PK zip signature)
    if filename and filename.lower().endswith(".docx"):
        if not file_bytes[:2] == b"PK":
            return {
                "ok": False,
                "message": "This file has a .docx extension but doesn't appear to be a valid DOCX file.",
            }

    logger.info(f"Pre-check passed: {filename} ({len(file_bytes)} bytes)")
    return {"ok": True, "message": "File looks good."}
