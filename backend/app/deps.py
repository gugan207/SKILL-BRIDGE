"""
SkillBridge AI — Supabase Client Dependencies
Provides authenticated Supabase clients for route handlers.
"""

from supabase import create_client, Client
from app.config import get_settings


def get_supabase_admin() -> Client:
    """Service-role client for backend operations (bypasses RLS)."""
    settings = get_settings()
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


def get_supabase_client(access_token: str | None = None) -> Client:
    """Anon client — used for user-scoped operations respecting RLS."""
    settings = get_settings()
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    if access_token:
        client.auth.set_session(access_token, "")
    return client
