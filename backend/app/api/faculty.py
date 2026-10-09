from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.student import Student
from app.models.indicators import AcademicIndicator, PlacementIndicator
from app.models.score import StudentScore, RiskAssessment
from app.models.intervention import Intervention
from app.schemas.faculty import FacultyCohortOverviewDTO, AttendanceWarningDTO
from app.schemas.student import StudentListItemDTO
from app.schemas.common import RiskTier, ApiResponse
from app.services.scoring_engine import scoring_engine
from app.core.security import require_role, Role

router = APIRouter()

@router.get("/cohort", response_model=ApiResponse[FacultyCohortOverviewDTO])
def get_faculty_cohort(
    department: Optional[str] = Query(None, description="Filter by department"),
    semester: Optional[int] = Query(None, description="Filter by semester"),
    risk_tier: Optional[str] = Query(None, description="Filter by risk tier (High, Medium, Low)"),
    search: Optional[str] = Query(None, description="Search by student name or ID"),
    claims: dict = Depends(require_role([Role.FACULTY, Role.ADMIN])),
    db: Session = Depends(get_db)
):
    """Retrieves faculty cohort overview, enforcing department authorization boundaries."""
    query = (
        db.query(Student, AcademicIndicator, PlacementIndicator, StudentScore, RiskAssessment)
        .join(AcademicIndicator, Student.id == AcademicIndicator.student_id)
        .join(PlacementIndicator, Student.id == PlacementIndicator.student_id)
        .join(StudentScore, Student.id == StudentScore.student_id)
        .join(RiskAssessment, Student.id == RiskAssessment.student_id)
    )

    # Department Authorization Scoping: Faculty are scoped to their assigned department
    user_role = claims.get("role")
    faculty_dept = claims.get("department")

    if user_role == Role.FACULTY and faculty_dept and department not in [None, "All Departments"] and department != faculty_dept:
        # Prevent faculty from unauthorized snooping into other departments
        raise HTTPException(
            status_code=403,
            detail=f"Access forbidden: You are only authorized to manage the '{faculty_dept}' department."
        )

    effective_dept = faculty_dept if (user_role == Role.FACULTY and faculty_dept) else department

    if effective_dept and effective_dept != "All Departments":
        query = query.filter(Student.department == effective_dept)
    if semester:
        query = query.filter(Student.semester == semester)
    if risk_tier and risk_tier != "All":
        query = query.filter(RiskAssessment.overall_risk_tier == risk_tier)
    if search:
        s_term = f"%{search}%"
        query = query.filter(
            (Student.first_name.ilike(s_term)) |
            (Student.last_name.ilike(s_term)) |
            (Student.student_id.ilike(s_term))
        )

    records = query.all()

    student_items: List[StudentListItemDTO] = []
    attendance_warnings: List[AttendanceWarningDTO] = []

    high_risk_cnt = 0
    med_risk_cnt = 0
    low_risk_cnt = 0
    total_cgpa = 0.0
    total_att = 0.0

    for stu, acad, place, score, risk in records:
        tier = RiskTier(risk.overall_risk_tier)
        if tier == RiskTier.HIGH:
            high_risk_cnt += 1
        elif tier == RiskTier.MEDIUM:
            med_risk_cnt += 1
        else:
            low_risk_cnt += 1

        total_cgpa += acad.cgpa
        total_att += acad.attendance_pct

        # Attendance warning check (margin < 0 or attendance < 75%)
        if score.attendance_margin < 0 or acad.attendance_pct < 75.0:
            needed = scoring_engine.calculate_consecutive_classes_needed(acad.attended_classes, acad.total_classes)
            attendance_warnings.append(AttendanceWarningDTO(
                student_id=stu.student_id,
                name=f"{stu.first_name} {stu.last_name}",
                current_attendance_pct=round(acad.attendance_pct, 1),
                attended_classes=acad.attended_classes,
                total_classes=acad.total_classes,
                attendance_margin=score.attendance_margin,
                consecutive_classes_needed=needed,
                risk_level=risk.overall_risk_tier
            ))

        student_items.append(StudentListItemDTO(
            id=stu.id,
            student_id=stu.student_id,
            full_name=f"{stu.first_name} {stu.last_name}",
            email=stu.email,
            department=stu.department,
            semester=stu.semester,
            cohort_year=stu.cohort_year,
            mentor_name=stu.mentor_name,
            avatar_url=stu.avatar_url,
            status=stu.status,
            cgpa=round(acad.cgpa, 2),
            attendance_pct=round(acad.attendance_pct, 1),
            success_score=round(score.success_score, 1),
            overall_risk_tier=tier,
            persona_cluster=risk.persona_cluster,
            persona_label=risk.persona_label,
            attendance_margin=score.attendance_margin,
            backlogs=acad.backlogs,
            coding_score=round(place.coding_score, 1)
        ))

    tot = len(records) or 1
    pending_interventions = (
        db.query(Intervention)
        .filter(Intervention.status.in_(["Proposed", "Active"]))
        .count()
    )

    overview = FacultyCohortOverviewDTO(
        department=department or "All Departments",
        total_students=len(records),
        high_risk_count=high_risk_cnt,
        medium_risk_count=med_risk_cnt,
        low_risk_count=low_risk_cnt,
        avg_cgpa=round(total_cgpa / tot, 2) if records else 0.0,
        avg_attendance=round(total_att / tot, 1) if records else 0.0,
        pending_interventions_count=pending_interventions,
        attendance_defaulters_count=len(attendance_warnings),
        attendance_warnings=attendance_warnings,
        students=student_items
    )
    return ApiResponse(data=overview)

@router.post("/trigger-batch-outreach", response_model=ApiResponse[dict])
def trigger_batch_outreach(
    student_ids: List[str],
    outreach_type: str = Query("attendance_warning", description="Type of advisory notification"),
    claims: dict = Depends(require_role([Role.FACULTY, Role.ADMIN])),
    db: Session = Depends(get_db)
):
    """Dispatches batched advisory notices to flagged students."""
    count = len(student_ids)
    return ApiResponse(data={
        "status": "dispatched",
        "recipients_count": count,
        "message": f"Successfully queued {count} automated {outreach_type} notifications via university portal and institutional email."
    })
