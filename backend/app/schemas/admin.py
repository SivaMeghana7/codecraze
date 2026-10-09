from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.schemas.common import RiskTier

class DepartmentMetricDTO(BaseModel):
    department: str
    total_students: int
    avg_success_score: float
    avg_cgpa: float
    avg_attendance: float
    high_risk_count: int
    placement_readiness_pct: float

class PersonaDistributionDTO(BaseModel):
    cluster: int
    label: str
    count: int
    percentage: float
    description: str

class RiskDistributionDTO(BaseModel):
    tier: RiskTier
    count: int
    percentage: float

class InterventionStatsDTO(BaseModel):
    proposed: int
    active: int
    completed: int
    declined: int
    success_rate_pct: float

class CriticalAlertDTO(BaseModel):
    student_id: str
    name: str
    department: str
    semester: int
    risk_level: RiskTier
    top_trigger: str
    attendance_margin: int
    recommended_intervention: str

class AdminOverviewDTO(BaseModel):
    total_students: int
    active_students: int
    avg_success_score: float
    avg_cgpa: float
    avg_attendance_pct: float
    avg_coding_score: float
    
    # Distributions
    risk_breakdown: List[RiskDistributionDTO]
    persona_distribution: List[PersonaDistributionDTO]
    department_metrics: List[DepartmentMetricDTO]
    intervention_stats: InterventionStatsDTO
    critical_alerts: List[CriticalAlertDTO]

class CsvImportRowErrorDTO(BaseModel):
    row_number: int
    student_id: Optional[str] = None
    reason: str

class CsvImportResultDTO(BaseModel):
    total_rows: int
    imported_count: int
    updated_count: int
    failed_count: int
    errors: List[CsvImportRowErrorDTO] = []
    message: str
