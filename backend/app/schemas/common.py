from enum import Enum
from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel, Field

T = TypeVar("T")

class RiskTier(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class InterventionType(str, Enum):
    REMEDIAL_TUTORING = "Remedial Tutoring"
    CODING_BOOTCAMP = "Coding Bootcamp"
    ATTENDANCE_COUNSELING = "Attendance Counseling"
    PLACEMENT_MENTORSHIP = "Placement Mentorship"
    PEER_STUDY_GROUP = "Peer Study Group"

class InterventionPriority(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class InterventionStatus(str, Enum):
    PROPOSED = "Proposed"
    ACTIVE = "Active"
    COMPLETED = "Completed"
    DECLINED = "Declined"

class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str
    models_loaded: bool
    database_connected: bool
    timestamp: str

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: Optional[str] = None
    data: T

class PaginationMeta(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
