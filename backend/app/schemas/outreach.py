from typing import List, Optional
from pydantic import BaseModel, Field

class XaiDriverDTO(BaseModel):
    rank: int
    feature_name: str
    feature_label: str
    raw_value: float
    shap_value: float
    impact_direction: str = Field(..., description="'+Risk' (increases vulnerability) or 'Support' (protective factor)")
    narrative: str

class ExplainabilityResponseDTO(BaseModel):
    student_id: str
    overall_risk_tier: str
    academic_risk_prob: float
    placement_risk_prob: float
    base_value: float
    top_drivers: List[XaiDriverDTO]
    academic_drivers: Optional[List[XaiDriverDTO]] = None
    placement_drivers: Optional[List[XaiDriverDTO]] = None
    summary_narrative: str
    counterfactual_advice: List[str]

class OutreachDraftRequestDTO(BaseModel):
    student_id: str
    template_type: str = "attendance_warning"  # attendance_warning, academic_remedial, placement_prep, mentor_checkin
    channel: str = "Email"  # Email, SMS, Portal

class OutreachDraftResponseDTO(BaseModel):
    student_id: str
    student_name: str
    recipient_email: str
    channel: str
    subject: str
    message_body: str
    priority: str
    suggested_actions: List[str]
