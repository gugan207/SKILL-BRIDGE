"""
SkillBridge AI — Auth Routes
Supabase Auth wiring: signup with consent, login, logout, session refresh.
"""

import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.deps import get_supabase_admin, get_supabase_client

logger = logging.getLogger("skillbridge.auth")
router = APIRouter()


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""
    consent_given: bool = False


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    email: str


@router.post("/signup", response_model=TokenResponse)
async def signup(req: SignUpRequest):
    """Sign up with email/password. Consent must be given before proceeding."""
    if not req.consent_given:
        raise HTTPException(
            status_code=400,
            detail="You must consent to the privacy policy before creating an account.",
        )

    try:
        client = get_supabase_client()
        result = client.auth.sign_up({
            "email": req.email,
            "password": req.password,
        })

        if not result.user:
            raise HTTPException(status_code=400, detail="Signup failed. Please try again.")

        # Update profile with full name and consent timestamp
        admin = get_supabase_admin()
        admin.table("profiles").update({
            "full_name": req.full_name or None,
            "consent_given_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", result.user.id).execute()

        logger.info(f"New user signed up: {req.email}")

        return TokenResponse(
            access_token=result.session.access_token,
            refresh_token=result.session.refresh_token,
            user_id=result.user.id,
            email=req.email,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """Log in with email/password."""
    try:
        client = get_supabase_client()
        result = client.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password,
        })

        if not result.user:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        logger.info(f"User logged in: {req.email}")

        return TokenResponse(
            access_token=result.session.access_token,
            refresh_token=result.session.refresh_token,
            user_id=result.user.id,
            email=req.email,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=401, detail="Invalid email or password.")


@router.post("/refresh")
async def refresh_session(refresh_token: str):
    """Refresh an expired session token."""
    try:
        client = get_supabase_client()
        result = client.auth.refresh_session(refresh_token)

        return {
            "access_token": result.session.access_token,
            "refresh_token": result.session.refresh_token,
        }
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")


@router.get("/me")
async def get_current_user(access_token: str):
    """Get current user profile."""
    try:
        client = get_supabase_client()
        user = client.auth.get_user(access_token)

        if not user:
            raise HTTPException(status_code=401, detail="Invalid session.")

        # Fetch profile
        admin = get_supabase_admin()
        profile = admin.table("profiles").select("*").eq("id", user.user.id).single().execute()

        return {
            "id": user.user.id,
            "email": user.user.email,
            "full_name": profile.data.get("full_name"),
            "role": profile.data.get("role"),
            "created_at": profile.data.get("created_at"),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {e}")
        raise HTTPException(status_code=401, detail="Invalid session.")
