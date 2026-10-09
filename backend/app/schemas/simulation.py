from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.common import RiskTier

class SimulationRequestDTO(BaseModel):
    student_id: Optional[str] = None
    cgpa: float = Field(..., ge=0.0, le=10.0)
    backlogs: int = Field(..., ge=0)
    attendance_pct: float = Field(..., ge=0.0, le=100.0)
    assignment_completion_pct: float = Field(..., ge=0.0, le=100.0)
    certifications_count: int = Field(..., ge=0)
    coding_score: float = Field(..., ge=0.0, le=100.0)
    aptitude_score: float = Field(..., ge=0.0, le=100.0)
    mock_interviews_completed: int = Field(..., ge=0)
    attended_classes: Optional[int] = None
    total_classes: Optional[int] = None

class SimulationScoreBreakdownDTO(BaseModel):
    academic_index: float
    engagement_index: float
    placement_index: float
    success_score: float
    attendance_margin: int
    risk_tier: RiskTier
    persona_cluster: int
    persona_label: str

class SimulationDeltaDTO(BaseModel):
    success_score_delta: float
    academic_index_delta: float
    engagement_index_delta: float
    placement_index_delta: float
    margin_delta: int
    risk_status_changed: bool
    risk_migration: str

class SimulationResponseDTO(BaseModel):
    baseline: SimulationScoreBreakdownDTO
    simulated: SimulationScoreBreakdownDTO
    deltas: SimulationDeltaDTO
    recommendations: List[str]
    fastest_path_to_low_risk: List[str]
