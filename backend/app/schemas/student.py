from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.common import RiskTier, InterventionType, InterventionPriority, InterventionStatus

class AcademicIndicatorsDTO(BaseModel):
    cgpa: float = Field(..., ge=0.0, le=10.0, description="Cumulative Grade Point Average")
    backlogs: int = Field(..., ge=0, description="Active backlog count")
    internal_exam_avg: float = Field(..., ge=0.0, le=100.0)
    attendance_pct: float = Field(..., ge=0.0, le=100.0)
    attended_classes: int = Field(..., ge=0)
    total_classes: int = Field(..., ge=0)
    assignment_completion_pct: float = Field(..., ge=0.0, le=100.0)
    certifications_count: int = Field(..., ge=0)
    lab_performance_score: float = Field(default=75.0, ge=0.0, le=100.0)

class PlacementIndicatorsDTO(BaseModel):
    coding_score: float = Field(..., ge=0.0, le=100.0)
    aptitude_score: float = Field(..., ge=0.0, le=100.0)
    mock_interviews_completed: int = Field(..., ge=0)
    technical_skills_count: int = Field(default=0, ge=0)
    soft_skills_rating: float = Field(default=3.5, ge=1.0, le=5.0)
    internship_status: str = Field(default="None")
    projects_count: int = Field(default=1, ge=0)

class StudentScoreDTO(BaseModel):
    academic_index: float
    engagement_index: float
    placement_index: float
    success_score: float
    attendance_margin: int
    percentile_rank: Optional[float] = None
    last_calculated_at: Optional[datetime] = None

class RiskAssessmentDTO(BaseModel):
    academic_risk_level: RiskTier
    academic_risk_prob: float
    placement_risk_level: RiskTier
    placement_risk_prob: float
    overall_risk_tier: RiskTier
    persona_cluster: int
    persona_label: str
    top_risk_driver: Optional[str] = None
    calculated_at: Optional[datetime] = None

class InterventionBriefDTO(BaseModel):
    id: str
    type: InterventionType
    priority: InterventionPriority
    status: InterventionStatus
    reason: str
    recommended_action: str
    assigned_to: Optional[str] = None
    created_at: datetime

class StudentListItemDTO(BaseModel):
    id: str
    student_id: str
    full_name: str
    email: str
    department: str
    semester: int
    cohort_year: int
    mentor_name: Optional[str] = None
    avatar_url: Optional[str] = None
    status: str
    cgpa: float
    attendance_pct: float
    success_score: float
    overall_risk_tier: RiskTier
    persona_cluster: int
    persona_label: str
    attendance_margin: int
    backlogs: int
    coding_score: float

class StudentDetailDTO(BaseModel):
    id: str
    student_id: str
    first_name: str
    last_name: str
    full_name: str
    email: str
    department: str
    semester: int
    cohort_year: int
    mentor_name: Optional[str] = None
    avatar_url: Optional[str] = None
    status: str
    created_at: datetime
    
    # Nested components
    academic_indicators: AcademicIndicatorsDTO
    placement_indicators: PlacementIndicatorsDTO
    score: StudentScoreDTO
    risk: RiskAssessmentDTO
    interventions: List[InterventionBriefDTO] = []
