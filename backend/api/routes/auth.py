"""
Authentication Router for CodeMentor AI.
Provides Google OAuth login, user verification, and profile endpoints.
"""
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from backend.services.auth import (
    get_auth_service,
    get_current_user,
    get_current_user_optional,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])


class GoogleLoginRequest(BaseModel):
    credential: str = Field(..., description="Google OAuth ID Token from Google Identity Services")


class UserProfileResponse(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: str
    provider: str = "google"


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse


@router.post("/google", response_model=AuthResponse, summary="Sign in with Google OAuth")
async def google_login(request: GoogleLoginRequest):
    """
    Authenticate exclusively with Google OAuth.
    Cryptographically verifies the Google ID Token credential with Google Identity Services,
    stores/updates the verified user in MongoDB, and issues a signed JWT session token.
    """
    auth_service = get_auth_service()

    if not request.credential or not request.credential.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google OAuth credential token is required.",
        )

    verified_data = auth_service.verify_google_credential(request.credential.strip())
    if not verified_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google OAuth credential.",
        )

    user_doc = auth_service.get_or_create_google_user(
        email=verified_data["email"],
        name=verified_data["name"],
        avatar_url=verified_data["avatar_url"],
        google_id=verified_data.get("google_id"),
    )

    user_id = user_doc["user_id"]
    token = auth_service.create_access_token(user_id=user_id, email=user_doc["email"])

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserProfileResponse(
            id=user_id,
            email=user_doc["email"],
            name=user_doc.get("name", "DSA Developer"),
            avatar_url=user_doc.get("avatar_url", ""),
            provider="google",
        ),
    )


@router.get("/me", response_model=UserProfileResponse, summary="Get current authenticated user profile")
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Retrieve profile of the currently authenticated user from MongoDB.
    """
    return UserProfileResponse(
        id=current_user["user_id"],
        email=current_user["email"],
        name=current_user.get("name", "DSA Developer"),
        avatar_url=current_user.get("avatar_url", ""),
        provider=current_user.get("provider", "google"),
    )


@router.post("/logout", summary="Logout current user")
async def logout(current_user: Optional[dict] = Depends(get_current_user_optional)):
    """
    Acknowledge logout on backend.
    """
    return {"success": True, "message": "Logged out successfully"}
