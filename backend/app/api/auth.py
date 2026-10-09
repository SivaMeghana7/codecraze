from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_claims
from app.schemas.auth import LoginRequestDTO, LoginResponseDTO, DemoCredentialDTO, UserDTO
from app.schemas.common import ApiResponse
from app.services.auth_service import auth_service

router = APIRouter()

@router.post("/login", response_model=ApiResponse[LoginResponseDTO])
def login(req: LoginRequestDTO, db: Session = Depends(get_db)):
    """Authenticates student, faculty, or administrator credentials and returns JWT bearer token."""
    result = auth_service.authenticate_user(req.email, req.password, db)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your email and password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return ApiResponse(data=result, message=f"Welcome back, {result.user.name} ({result.user.role.title()})")

@router.get("/me", response_model=ApiResponse[UserDTO])
def get_me(claims: Dict[str, Any] = Depends(get_current_user_claims)):
    """Retrieves authenticated session profile and role claims."""
    user = UserDTO(
        id=claims.get("sub", "anon"),
        email=claims.get("email", "user@campus.edu"),
        name=claims.get("name", "Authenticated User"),
        role=claims.get("role", "admin"),
        department=claims.get("department"),
        student_id=claims.get("student_id")
    )
    return ApiResponse(data=user)

@router.get("/demo-credentials", response_model=ApiResponse[List[DemoCredentialDTO]])
def get_demo_credentials():
    """Provides pre-configured institutional credentials for Administrator, Faculty, and Student roles."""
    creds = auth_service.get_demo_credentials()
    return ApiResponse(data=creds)
