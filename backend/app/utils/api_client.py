"""
SkillBridge AI — API Client Utilities
Retry/backoff wrapper for all external API calls (NVIDIA, YouTube, GitHub).
A hung request should never hang the whole pipeline.
"""

import logging
import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)
from app.config import get_settings

logger = logging.getLogger("skillbridge.api_client")
settings = get_settings()


def get_http_client(timeout: float = 30.0) -> httpx.AsyncClient:
    """Create an async HTTP client with timeout."""
    return httpx.AsyncClient(timeout=httpx.Timeout(timeout))


# Retry decorator for external API calls
def with_retry(max_attempts: int = 3, min_wait: float = 1.0, max_wait: float = 10.0):
    """Decorator for retrying external API calls with exponential backoff."""
    return retry(
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(multiplier=min_wait, max=max_wait),
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException, ConnectionError)),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True,
    )
