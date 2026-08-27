"""
SkillBridge AI — PDF Report Generator
Generates a real, downloadable PDF report using ReportLab.
"""

import io
import logging
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT

logger = logging.getLogger("skillbridge.pdf")

# Brand colors
PRIMARY = HexColor("#6366f1")      # Indigo
SECONDARY = HexColor("#8b5cf6")    # Violet
SUCCESS = HexColor("#22c55e")      # Green
WARNING = HexColor("#f59e0b")      # Amber
DANGER = HexColor("#ef4444")       # Red
TEXT_DARK = HexColor("#1e293b")
TEXT_LIGHT = HexColor("#64748b")
BG_LIGHT = HexColor("#f8fafc")


def generate_report_pdf(report: dict, jd_title: str = "Job Analysis") -> bytes:
    """Generate a PDF report from the analysis data."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=1.5*cm, rightMargin=1.5*cm,
        topMargin=2*cm, bottomMargin=2*cm,
    )

    styles = getSampleStyleSheet()
    elements = []

    # Custom styles
    title_style = ParagraphStyle(
        "ReportTitle", parent=styles["Title"],
        fontSize=24, textColor=PRIMARY, spaceAfter=6,
    )
    heading_style = ParagraphStyle(
        "ReportHeading", parent=styles["Heading2"],
        fontSize=16, textColor=PRIMARY, spaceBefore=16, spaceAfter=8,
    )
    body_style = ParagraphStyle(
        "ReportBody", parent=styles["Normal"],
        fontSize=10, textColor=TEXT_DARK, spaceAfter=4,
    )
    score_style = ParagraphStyle(
        "ScoreStyle", parent=styles["Title"],
        fontSize=48, textColor=PRIMARY, alignment=TA_CENTER,
    )

    # === HEADER ===
    elements.append(Paragraph("SkillBridge AI", title_style))
    elements.append(Paragraph("Skill Gap Analysis Report", ParagraphStyle(
        "Subtitle", parent=styles["Normal"],
        fontSize=14, textColor=TEXT_LIGHT, spaceAfter=16,
    )))
    elements.append(HRFlowable(width="100%", thickness=2, color=PRIMARY))
    elements.append(Spacer(1, 12))

    # === JOB INFO ===
    elements.append(Paragraph(f"<b>Position:</b> {jd_title}", body_style))
    elements.append(Spacer(1, 16))

    # === EMPLOYABILITY SCORE ===
    elements.append(Paragraph("Employability Score", heading_style))
    score = report.get("employability_score", 0)
    elements.append(Paragraph(f"{score}/100", score_style))
    elements.append(Spacer(1, 8))

    # Score breakdown
    breakdown = report.get("skill_radar", {})
    if isinstance(breakdown, dict):
        for category, data in breakdown.items():
            if isinstance(data, dict):
                cat_score = data.get("score", 0)
                matched = data.get("matched", 0)
                total = data.get("total", 0)
                elements.append(Paragraph(
                    f"<b>{category.title()}</b>: {matched}/{total} skills matched ({cat_score}%)",
                    body_style,
                ))

    elements.append(Spacer(1, 16))

    # === MATCHED SKILLS ===
    matched = report.get("matched_skills", [])
    if matched:
        elements.append(Paragraph("Matched Skills ✓", heading_style))
        for skill in matched:
            name = skill.get("name", "")
            conf = skill.get("confidence", 0)
            cat = skill.get("category", "")
            elements.append(Paragraph(
                f"✓ <b>{name}</b> ({cat}) — {int(conf * 100)}% confidence",
                body_style,
            ))
        elements.append(Spacer(1, 12))

    # === MISSING SKILLS / ROADMAP ===
    roadmap = report.get("roadmap", [])
    if roadmap:
        elements.append(Paragraph("Skill Gaps & Roadmap", heading_style))
        for item in roadmap:
            skill_name = item.get("skill_name", "")
            category = item.get("category", "")
            elements.append(Paragraph(
                f"<b>#{item.get('rank', '')}: {skill_name}</b> ({category})",
                ParagraphStyle("GapTitle", parent=body_style, fontSize=12, textColor=DANGER),
            ))

            # Project recommendation
            project = item.get("project", {})
            if isinstance(project, dict):
                elements.append(Paragraph(
                    f"  → Project: {project.get('project_title', 'N/A')}",
                    body_style,
                ))

            # AI explanation
            explanation = item.get("ai_explanation")
            if explanation:
                elements.append(Paragraph(
                    f"  💡 {explanation}",
                    ParagraphStyle("Explanation", parent=body_style, textColor=TEXT_LIGHT, fontSize=9),
                ))

            # YouTube
            yt = item.get("youtube")
            if yt and yt.get("title"):
                elements.append(Paragraph(
                    f"  📺 Video: {yt['title']}",
                    body_style,
                ))

            # GitHub
            gh = item.get("github")
            if gh and gh.get("repo_url"):
                elements.append(Paragraph(
                    f"  🔗 GitHub: {gh.get('repo_name', gh['repo_url'])} "
                    f"({gh.get('stars', 0)}⭐)",
                    body_style,
                ))

            elements.append(Spacer(1, 8))

    # === FOOTER ===
    elements.append(Spacer(1, 24))
    elements.append(HRFlowable(width="100%", thickness=1, color=TEXT_LIGHT))
    elements.append(Paragraph(
        "Generated by SkillBridge AI — skillbridge.ai",
        ParagraphStyle("Footer", parent=body_style, fontSize=8, textColor=TEXT_LIGHT, alignment=TA_CENTER),
    ))

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    logger.info(f"PDF generated: {len(pdf_bytes)} bytes")
    return pdf_bytes
