from typing import List, Optional
from pydantic import BaseModel
from app.schemas.student import StudentListItemDTO

class AttendanceWarningDTO(BaseModel):
    student_id: str
    name: str
    current_attendance_pct: float
    attended_classes: int
    total_classes: int
    attendance_margin: int
    consecutive_classes_needed: int
    risk_level: str

class FacultyCohortOverviewDTO(BaseModel):
    department: str
    total_students: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    avg_cgpa: float
    avg_attendance: float
    pending_interventions_count: int
    attendance_defaulters_count: int
    attendance_warnings: List[AttendanceWarningDTO]
    students: List[StudentListItemDTO]
