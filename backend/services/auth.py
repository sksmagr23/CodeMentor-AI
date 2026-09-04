"""
Authentication Service for CodeMentor AI.
Manages user accounts, MongoDB persistence in 'users' collection,
and secure JWT token generation/validation.
"""
import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
import jwt
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.db.mongodb import get_db_manager, sanitize_mongo_doc

logger = logging.getLogger(__name__)

raw_jwt_secret = os.getenv("JWT_SECRET", "codementor_ai_super_secret_jwt_key_2026_dsa_full_secure_token_signing_secret_32bytes")

import hashlib
JWT_SECRET = hashlib.sha256(raw_jwt_secret.encode()).hexdigest()
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 30
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

security = HTTPBearer(auto_error=False)


class AuthService:
    def __init__(self):
        self.db = get_db_manager()
        self.google_client_id = GOOGLE_CLIENT_ID
        self.google_client_secret = GOOGLE_CLIENT_SECRET
        self._ensure_indexes()

    def _ensure_indexes(self):
        """Create necessary indexes on MongoDB 'users' collection."""
        try:
            self.db.users.create_index("email", unique=True, sparse=True)
            self.db.users.create_index("google_id", sparse=True)
            self.db.users.create_index("user_id", unique=True)
        except Exception as e:
            logger.warning(f"[AuthService] Index creation note: {e}")

    def verify_google_credential(self, credential: str) -> Optional[Dict[str, Any]]:
        """
        Verifies a Google OAuth ID Token (credential) received from Google Identity Services.
        Validates cryptographic signature, expiration, and issuer.
        """
        if not credential:
            return None

        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests

            req = google_requests.Request()
            audience = self.google_client_id if self.google_client_id else None
            id_info = id_token.verify_oauth2_token(credential, req, audience=audience)

            if id_info.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
                logger.warning(f"[AuthService] Invalid Google token issuer: {id_info.get('iss')}")
                return None

            email = id_info.get("email")
            if not email:
                return None

            return {
                "email": email.strip().lower(),
                "name": id_info.get("name") or email.split("@")[0],
                "avatar_url": id_info.get("picture") or "",
                "google_id": id_info.get("sub"),
            }
        except Exception as e:
            logger.warning(f"[AuthService] google-auth verify failed ({e}), checking tokeninfo endpoint...")

        try:
            import httpx
            resp = httpx.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}",
                timeout=8.0,
            )
            if resp.status_code == 200:
                data = resp.json()
                if data.get("iss") in ["accounts.google.com", "https://accounts.google.com"]:
                    if self.google_client_id and data.get("aud") != self.google_client_id:
                        return None
                    email = data.get("email")
                    if email:
                        return {
                            "email": email.strip().lower(),
                            "name": data.get("name") or email.split("@")[0],
                            "avatar_url": data.get("picture") or "",
                            "google_id": data.get("sub"),
                        }
        except Exception as e:
            logger.warning(f"[AuthService] Google tokeninfo verify fallback error: {e}")

        return None

    def get_or_create_google_user(
        self,
        email: str,
        name: str,
        avatar_url: Optional[str] = None,
        google_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Finds an existing user by email or creates a new user record in MongoDB 'users' collection.
        """
        clean_email = email.strip().lower()
        now = datetime.now(timezone.utc)

        existing_user = self.db.users.find_one({"email": clean_email})

        if existing_user:
            update_data = {
                "name": name.strip() or existing_user.get("name", "Coder"),
                "avatar_url": avatar_url or existing_user.get("avatar_url", ""),
                "last_login": now,
                "updated_at": now,
            }
            if google_id:
                update_data["google_id"] = google_id

            self.db.users.update_one({"_id": existing_user["_id"]}, {"$set": update_data})
            existing_user.update(update_data)
            logger.info(f"[AuthService] User logged in: {clean_email} ({existing_user.get('user_id')})")
            return sanitize_mongo_doc(existing_user)

        # Create new user record
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = {
            "user_id": user_id,
            "email": clean_email,
            "name": name.strip() or clean_email.split("@")[0],
            "avatar_url": avatar_url or f"https://api.dicebear.com/7.x/bottts/svg?seed={user_id}",
            "provider": "google",
            "google_id": google_id,
            "created_at": now,
            "updated_at": now,
            "last_login": now,
        }

        self.db.users.insert_one(new_user)
        logger.info(f"[AuthService] New user created: {clean_email} -> {user_id}")
        return sanitize_mongo_doc(new_user)

    def create_access_token(self, user_id: str, email: str) -> str:
        """Generate a signed JWT access token."""
        expire = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS)
        payload = {
            "sub": user_id,
            "email": email,
            "exp": expire,
            "iat": datetime.now(timezone.utc),
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    def verify_access_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode a JWT token."""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("[AuthService] Token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"[AuthService] Invalid token: {e}")
            return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve user record from MongoDB by user_id."""
        user = self.db.users.find_one({"user_id": user_id})
        return sanitize_mongo_doc(user) if user else None


_auth_service: Optional[AuthService] = None


def get_auth_service() -> AuthService:
    global _auth_service
    if _auth_service is None:
        _auth_service = AuthService()
    return _auth_service


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[Dict[str, Any]]:
    """Optional authentication dependency: returns user dict if valid token, else None."""
    if not credentials or not credentials.credentials:
        return None

    auth_service = get_auth_service()
    payload = auth_service.verify_access_token(credentials.credentials)
    if not payload or not payload.get("sub"):
        return None

    user = auth_service.get_user_by_id(payload["sub"])
    return user


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Dict[str, Any]:
    """Required authentication dependency: raises 401 if unauthenticated."""
    user = await get_current_user_optional(credentials)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
