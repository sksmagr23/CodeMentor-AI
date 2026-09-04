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
    email: str = Field(..., description="Google account email")
    name: str = Field(..., description="User's full name")
    avatar_url: Optional[str] = Field(None, description="User avatar image URL")
    google_id: Optional[str] = Field(None, description="Google OAuth user ID or sub")


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


@router.post("/google", response_model=AuthResponse, summary="Sign in or register with Google")
async def google_login(request: GoogleLoginRequest):
    """
    Authenticate with Google. Finds existing user or creates a new user in MongoDB,
    and returns a signed JWT bearer token.
    """
    if not request.email or "@" not in request.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid Google email address is required.",
        )

    auth_service = get_auth_service()
    user_doc = auth_service.get_or_create_google_user(
        email=request.email,
        name=request.name or request.email.split("@")[0],
        avatar_url=request.avatar_url,
        google_id=request.google_id,
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
