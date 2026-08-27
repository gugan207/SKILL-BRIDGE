"""
SkillBridge AI — Backend Configuration
Loads all settings from environment variables. Never hardcode secrets.
"""

import os
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # NVIDIA NIM
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    NVIDIA_BASE_URL: str = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
    NVIDIA_EMBED_MODEL: str = os.getenv("NVIDIA_EMBED_MODEL", "nvidia/nv-embedqa-e5-v5")
    NVIDIA_LLM_MODEL: str = os.getenv("NVIDIA_LLM_MODEL", "nvidia/nemotron-mini-4b-instruct")

    # YouTube Data API v3
    YOUTUBE_API_KEY: str = os.getenv("YOUTUBE_API_KEY", "")

    # GitHub
    GITHUB_PAT: str = os.getenv("GITHUB_PAT", "")

    # App
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")

    # Limits
    MAX_UPLOAD_SIZE_MB: int = 10
    MAX_RESUME_PAGES: int = 10
    NVIDIA_TIMEOUT_SECONDS: int = 30
    NVIDIA_MAX_RETRIES: int = 3


@lru_cache()
def get_settings() -> Settings:
    return Settings()
