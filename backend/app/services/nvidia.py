"""
SkillBridge AI — NVIDIA NIM Service
Embeddings (nv-embedqa-e5-v5) and LLM explanations (nemotron-mini-4b-instruct).
All calls use timeout + retry. Content-hash caching avoids redundant API calls.
"""

import hashlib
import logging
from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.config import get_settings
from app.utils.security import build_safe_prompt

logger = logging.getLogger("skillbridge.nvidia")
settings = get_settings()

# In-memory cache (content hash → embedding). For Phase 1 scale this is fine.
_embedding_cache: dict[str, list[float]] = {}


def _get_nvidia_client() -> OpenAI:
    """Create NVIDIA NIM client (OpenAI-compatible API)."""
    return OpenAI(
        base_url=settings.NVIDIA_BASE_URL,
        api_key=settings.NVIDIA_API_KEY,
    )


def _content_hash(text: str) -> str:
    """Hash text content for caching."""
    return hashlib.sha256(text.encode()).hexdigest()


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, max=10),
    retry=retry_if_exception_type((Exception,)),
    reraise=True,
)
def get_embedding(text: str, input_type: str = "passage") -> list[float]:
    """
    Get embedding from NVIDIA NIM nv-embedqa-e5-v5.
    Uses passage:/query: prefix convention per the brief:
    - Resume text → input_type="passage"
    - JD text → input_type="query"
    Results cached by content hash.
    """
    cache_key = _content_hash(f"{input_type}:{text}")

    if cache_key in _embedding_cache:
        logger.debug("Embedding cache hit")
        return _embedding_cache[cache_key]

    client = _get_nvidia_client()

    response = client.embeddings.create(
        model=settings.NVIDIA_EMBED_MODEL,
        input=[f"{input_type}: {text}"],
        encoding_format="float",
        extra_body={"input_type": input_type, "truncate": "END"},
    )

    embedding = response.data[0].embedding
    _embedding_cache[cache_key] = embedding
    logger.info(f"Embedding generated: {len(embedding)} dims, type={input_type}")

    return embedding


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, max=10),
    retry=retry_if_exception_type((Exception,)),
    reraise=True,
)
def generate_explanation(
    skill_name: str,
    resume_text: str,
    recommendation: str,
) -> str:
    """
    Generate a short personalized explanation for a roadmap recommendation.
    Uses prompt injection guard: resume text is wrapped in delimiters
    with explicit 'treat as data' instruction.
    """
    client = _get_nvidia_client()

    messages = build_safe_prompt(
        system_instruction=(
            "You are a career advisor. Generate a brief, encouraging 2-3 sentence explanation "
            "of why this specific skill gap matters for this candidate and how the recommended "
            "resource will help them. Be specific to their background, not generic."
        ),
        user_text=resume_text,
        task_description=(
            f"The candidate is missing the skill: **{skill_name}**.\n"
            f"Recommended action: {recommendation}\n\n"
            f"Based on the candidate's resume below, explain why learning {skill_name} "
            f"would strengthen their profile and how the recommendation connects to their experience."
        ),
    )

    response = client.chat.completions.create(
        model=settings.NVIDIA_LLM_MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=200,
    )

    explanation = response.choices[0].message.content.strip()
    logger.info(f"Explanation generated for skill: {skill_name}")

    return explanation
