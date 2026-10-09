from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.student import Student
from app.models.indicators import AcademicIndicator, PlacementIndicator
from app.models.score import StudentScore, RiskAssessment
from app.models.intervention import Intervention
from app.schemas.student import (
    StudentListItemDTO, StudentDetailDTO, AcademicIndicatorsDTO,
    PlacementIndicatorsDTO, StudentScoreDTO, RiskAssessmentDTO, InterventionBriefDTO
)
from app.schemas.common import ApiResponse, RiskTier, InterventionType, InterventionPriority, InterventionStatus
from app.services.scoring_engine import scoring_engine
from app.services.ml_service import ml_service
from app.services.clustering_engine import clustering_engine
from app.core.security import require_role, get_current_user_claims, Role

router = APIRouter()

@router.get("", response_model=ApiResponse[List[StudentListItemDTO]])
def list_students(
    department: Optional[str] = None,
    risk_tier: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    claims: dict = Depends(require_role([Role.FACULTY, Role.ADMIN])),
    db: Session = Depends(get_db)
):
    """Lists students with summary performance and risk metrics. Restricted to Faculty and Administrators."""
    query = (
        db.query(Student, AcademicIndicator, PlacementIndicator, StudentScore, RiskAssessment)
        .join(AcademicIndicator, Student.id == AcademicIndicator.student_id)
        .join(PlacementIndicator, Student.id == PlacementIndicator.student_id)
        .join(StudentScore, Student.id == StudentScore.student_id)
        .join(RiskAssessment, Student.id == RiskAssessment.student_id)
    )

    # Scoping for Faculty
    if claims.get("role") == Role.FACULTY and claims.get("department"):
        query = query.filter(Student.department == claims.get("department"))
    elif department and department != "All":
        query = query.filter(Student.department == department)

    if risk_tier and risk_tier != "All":
        query = query.filter(RiskAssessment.overall_risk_tier == risk_tier)
    if search:
        s_term = f"%{search}%"
        query = query.filter(
            (Student.first_name.ilike(s_term)) |
            (Student.last_name.ilike(s_term)) |
            (Student.student_id.ilike(s_term))
        )

    records = query.limit(limit).all()

    items = []
    for stu, acad, place, score, risk in records:
        items.append(StudentListItemDTO(
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
            overall_risk_tier=RiskTier(risk.overall_risk_tier),
            persona_cluster=risk.persona_cluster,
            persona_label=risk.persona_label,
            attendance_margin=score.attendance_margin,
            backlogs=acad.backlogs,
            coding_score=round(place.coding_score, 1)
        ))

    return ApiResponse(data=items)

@router.get("/{id_or_code}", response_model=ApiResponse[StudentDetailDTO])
def get_student_detail(
    id_or_code: str,
    claims: dict = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    """Retrieves deep-dive student profile. Enforces privacy boundaries and IDOR prevention."""
    # Match by internal id or student_id
    stu = db.query(Student).filter(
        (Student.id == id_or_code) | (Student.student_id == id_or_code)
    ).first()

    if not stu:
        raise HTTPException(status_code=404, detail=f"Student with identifier '{id_or_code}' not found.")

    # Privacy Protection & IDOR Prevention
    caller_role = claims.get("role")
    if caller_role == Role.STUDENT:
        caller_student_id = claims.get("student_id")
        caller_sub = claims.get("sub")
        caller_email = claims.get("email")
        if stu.student_id != caller_student_id and stu.id != caller_sub and stu.email != caller_email:
            raise HTTPException(
                status_code=403,
                detail="Access forbidden: Students may only inspect their personal academic records."
            )
    elif caller_role == Role.FACULTY:
        faculty_dept = claims.get("department")
        if faculty_dept and stu.department != faculty_dept and claims.get("name") != stu.mentor_name:
            raise HTTPException(
                status_code=403,
                detail=f"Access forbidden: You are authorized to access student records in '{faculty_dept}' only."
            )

    acad = stu.academic_indicator
    place = stu.placement_indicator
    score = stu.score
    risk = stu.risk_assessment

    if not acad or not place or not score or not risk:
        raise HTTPException(status_code=404, detail="Student profile records or indicators are incomplete.")

    interventions_list = [
        InterventionBriefDTO(
            id=iv.id,
            type=InterventionType(iv.type),
            priority=InterventionPriority(iv.priority),
            status=InterventionStatus(iv.status),
            reason=iv.reason,
            recommended_action=iv.recommended_action,
            assigned_to=iv.assigned_to,
            created_at=iv.created_at
        )
        for iv in stu.interventions
    ]

    detail = StudentDetailDTO(
        id=stu.id,
        student_id=stu.student_id,
        first_name=stu.first_name,
        last_name=stu.last_name,
        full_name=f"{stu.first_name} {stu.last_name}",
        email=stu.email,
        department=stu.department,
        semester=stu.semester,
        cohort_year=stu.cohort_year,
        mentor_name=stu.mentor_name,
        avatar_url=stu.avatar_url,
        status=stu.status,
        created_at=stu.created_at,
        academic_indicators=AcademicIndicatorsDTO(
            cgpa=round(acad.cgpa, 2),
            backlogs=acad.backlogs,
            internal_exam_avg=round(acad.internal_exam_avg, 1),
            attendance_pct=round(acad.attendance_pct, 1),
            attended_classes=acad.attended_classes,
            total_classes=acad.total_classes,
            assignment_completion_pct=round(acad.assignment_completion_pct, 1),
            certifications_count=acad.certifications_count,
            lab_performance_score=round(acad.lab_performance_score, 1)
        ),
        placement_indicators=PlacementIndicatorsDTO(
            coding_score=round(place.coding_score, 1),
            aptitude_score=round(place.aptitude_score, 1),
            mock_interviews_completed=place.mock_interviews_completed,
            technical_skills_count=place.technical_skills_count,
            soft_skills_rating=round(place.soft_skills_rating, 1),
            internship_status=place.internship_status,
            projects_count=place.projects_count
        ),
        score=StudentScoreDTO(
            academic_index=round(score.academic_index, 2),
            engagement_index=round(score.engagement_index, 2),
            placement_index=round(score.placement_index, 2),
            success_score=round(score.success_score, 2),
            attendance_margin=score.attendance_margin,
            percentile_rank=score.percentile_rank,
            last_calculated_at=score.last_calculated_at
        ),
        risk=RiskAssessmentDTO(
            academic_risk_level=RiskTier(risk.academic_risk_level),
            academic_risk_prob=round(risk.academic_risk_prob, 3),
            placement_risk_level=RiskTier(risk.placement_risk_level),
            placement_risk_prob=round(risk.placement_risk_prob, 3),
            overall_risk_tier=RiskTier(risk.overall_risk_tier),
            persona_cluster=risk.persona_cluster,
            persona_label=risk.persona_label,
            top_risk_driver=risk.top_risk_driver,
            calculated_at=risk.calculated_at
        ),
        interventions=interventions_list
    )

    return ApiResponse(data=detail)
