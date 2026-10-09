from typing import Optional, List
from pydantic import BaseModel, EmailStr

class LoginRequestDTO(BaseModel):
    email: str
    password: str

class UserDTO(BaseModel):
    id: str
    email: str
    name: str
    role: str  # admin, faculty, student
    department: Optional[str] = None
    student_id: Optional[str] = None
    avatar_url: Optional[str] = None

class LoginResponseDTO(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserDTO
    redirect_url: str

class DemoCredentialDTO(BaseModel):
    role: str
    label: str
    email: str
    password: str
    description: str
    badge_color: str
    redirect_url: str
