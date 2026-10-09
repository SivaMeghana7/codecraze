import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List, Union
import jwt
from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings

security = HTTPBearer(auto_error=False)

class Role:
    ADMIN = "admin"
    FACULTY = "faculty"
    STUDENT = "student"

def hash_password(password: str, salt: Optional[str] = None) -> str:
    """Hashes a password with salt using PBKDF2-HMAC-SHA256."""
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, stored_hash_or_password: str) -> bool:
    """Constant-time password verification supporting PBKDF2 hashes and legacy migration."""
    try:
        if "$" in stored_hash_or_password:
            salt, key = stored_hash_or_password.split("$", 1)
            computed = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
            return hmac.compare_digest(computed, key)
        # Constant-time comparison for plaintext legacy accounts
        return hmac.compare_digest(plain_password, stored_hash_or_password)
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates an enterprise HMAC-SHA256 JWT token with role claims."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Dict[str, Any]:
    """Decodes and validates a JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please authenticate again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user_claims(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> Dict[str, Any]:
    """
    Extracts and validates user claims from Authorization header.
    Rejects unauthenticated requests with HTTP 401 Unauthorized.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return decode_token(credentials.credentials)

def require_role(required_roles: Union[str, List[str]]):
    """Dependency factory enforcing strict Role-Based Access Control."""
    allowed_roles = [required_roles] if isinstance(required_roles, str) else list(required_roles)
    
    def role_checker(claims: Dict[str, Any] = Depends(get_current_user_claims)):
        user_role = claims.get("role")
        # Admin has root access across all institutional surfaces
        if user_role != Role.ADMIN and user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires authorization as {allowed_roles}."
            )
        return claims
    return role_checker
