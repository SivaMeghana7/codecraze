from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.common import InterventionType, InterventionPriority, InterventionStatus

class InterventionCreateDTO(BaseModel):
    student_id: str
    type: InterventionType
    priority: InterventionPriority = InterventionPriority.MEDIUM
    reason: str = Field(..., min_length=5)
    recommended_action: str = Field(..., min_length=5)
    assigned_to: Optional[str] = None

class InterventionUpdateDTO(BaseModel):
    status: Optional[InterventionStatus] = None
    priority: Optional[InterventionPriority] = None
    outcome_notes: Optional[str] = None
    assigned_to: Optional[str] = None

class InterventionResponseDTO(BaseModel):
    id: str
    student_id: str
    student_name: Optional[str] = None
    student_department: Optional[str] = None
    type: InterventionType
    priority: InterventionPriority
    status: InterventionStatus
    reason: str
    recommended_action: str
    outcome_notes: Optional[str] = None
    assigned_to: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class PrescriptiveRecommendationDTO(BaseModel):
    intervention_type: InterventionType
    priority: InterventionPriority
    confidence_score: float
    trigger_driver: str
    rationale: str
    action_plan: str
    projected_success_gain: float
