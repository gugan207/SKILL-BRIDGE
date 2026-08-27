"""
SkillBridge AI — Document Parsing Service
Extracts text from resume files: pdfplumber → python-docx → OCR fallback.
"""

import io
import logging

logger = logging.getLogger("skillbridge.parsing")


def extract_text(file_bytes: bytes, filename: str) -> str:
    """
    Extract text from a resume file. Tries multiple strategies:
    1. pdfplumber for PDFs
    2. python-docx for DOCX
    3. Plain text for TXT
    4. OCR fallback for scanned PDFs
    """
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext == "pdf":
        return _extract_from_pdf(file_bytes)
    elif ext in ("docx", "doc"):
        return _extract_from_docx(file_bytes)
    elif ext == "txt":
        return file_bytes.decode("utf-8", errors="replace")
    else:
        # Try PDF first, then DOCX, then plain text
        for extractor in [_extract_from_pdf, _extract_from_docx]:
            try:
                text = extractor(file_bytes)
                if text and len(text.strip()) > 50:
                    return text
            except Exception:
                continue
        return file_bytes.decode("utf-8", errors="replace")


def _extract_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF using pdfplumber, with OCR fallback."""
    import pdfplumber

    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

    full_text = "\n".join(text_parts).strip()

    # If pdfplumber got very little text, try OCR
    if len(full_text) < 100:
        logger.info("PDF text extraction yielded little text, attempting OCR...")
        ocr_text = _ocr_fallback(file_bytes)
        if ocr_text and len(ocr_text) > len(full_text):
            return ocr_text

    return full_text


def _extract_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX using python-docx."""
    from docx import Document

    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)


def _ocr_fallback(file_bytes: bytes) -> str:
    """OCR fallback for scanned/image PDFs using Tesseract."""
    try:
        import pytesseract
        from pdf2image import convert_from_bytes

        images = convert_from_bytes(file_bytes, dpi=200)
        text_parts = []
        for img in images:
            text = pytesseract.image_to_string(img)
            if text:
                text_parts.append(text)

        return "\n".join(text_parts).strip()
    except ImportError:
        logger.warning("OCR dependencies (pytesseract/pdf2image) not available")
        return ""
    except Exception as e:
        logger.error(f"OCR fallback failed: {e}")
        return ""
