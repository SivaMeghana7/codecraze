import uuid
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.student import Student
from app.models.intervention import Intervention
from app.schemas.intervention import (
    InterventionCreateDTO, InterventionUpdateDTO,
    InterventionResponseDTO, PrescriptiveRecommendationDTO
)
from app.schemas.common import ApiResponse, InterventionType, InterventionPriority, InterventionStatus
from app.services.resource_allocator import resource_allocator
from app.core.security import require_role, get_current_user_claims, Role

router = APIRouter()

@router.get("", response_model=ApiResponse[List[InterventionResponseDTO]])
def list_interventions(
    status: Optional[str] = Query(None, description="Filter by status (Proposed, Active, Completed, Declined)"),
    priority: Optional[str] = Query(None, description="Filter by priority (High, Medium, Low)"),
    student_id: Optional[str] = Query(None, description="Filter by student ID"),
    claims: dict = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    """Lists closed-loop interventions, strictly isolating student records."""
    query = db.query(Intervention).join(Student, Intervention.student_id == Student.id)

    # Privacy Isolation: Students can ONLY view interventions assigned to themselves
    caller_role = claims.get("role")
    if caller_role == Role.STUDENT:
        caller_stu_id = claims.get("student_id")
        caller_sub = claims.get("sub")
        query = query.filter((Student.student_id == caller_stu_id) | (Student.id == caller_sub))
    elif caller_role == Role.FACULTY and claims.get("department") and not student_id:
        # Default faculty to their department
        query = query.filter(Student.department == claims.get("department"))

    if status and status != "All":
        query = query.filter(Intervention.status == status)
    if priority and priority != "All":
        query = query.filter(Intervention.priority == priority)
    if student_id and caller_role != Role.STUDENT:
        query = query.filter((Student.student_id == student_id) | (Student.id == student_id))

    records = query.order_by(Intervention.created_at.desc()).all()

    items = []
    for r in records:
        stu_name = f"{r.student.first_name} {r.student.last_name}" if r.student else "Unknown"
        dept = r.student.department if r.student else "General"
        items.append(InterventionResponseDTO(
            id=r.id,
            student_id=r.student.student_id if r.student else r.student_id,
            student_name=stu_name,
            student_department=dept,
            type=InterventionType(r.type),
            priority=InterventionPriority(r.priority),
            status=InterventionStatus(r.status),
            reason=r.reason,
            recommended_action=r.recommended_action,
            outcome_notes=r.outcome_notes,
            assigned_to=r.assigned_to,
            created_at=r.created_at,
            updated_at=r.updated_at
        ))

    return ApiResponse(data=items)

@router.post("", response_model=ApiResponse[InterventionResponseDTO])
def create_intervention(
    req: InterventionCreateDTO,
    claims: dict = Depends(require_role([Role.FACULTY, Role.ADMIN])),
    db: Session = Depends(get_db)
):
    """Creates a new closed-loop intervention linking high-risk flag to institutional action."""
    stu = db.query(Student).filter(
        (Student.id == req.student_id) | (Student.student_id == req.student_id)
    ).first()

    if not stu:
        raise HTTPException(status_code=404, detail="Target student record not found.")

    new_id = f"int-{uuid.uuid4().hex[:8]}"
    intervention = Intervention(
        id=new_id,
        student_id=stu.id,
        type=req.type.value,
        priority=req.priority.value,
        status="Proposed",
        assigned_to=req.assigned_to or stu.mentor_name or "Faculty Advisor",
        reason=req.reason,
        recommended_action=req.recommended_action,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

    db.add(intervention)
    db.commit()
    db.refresh(intervention)

    return ApiResponse(data=InterventionResponseDTO(
        id=intervention.id,
        student_id=stu.student_id,
        student_name=f"{stu.first_name} {stu.last_name}",
        student_department=stu.department,
        type=InterventionType(intervention.type),
        priority=InterventionPriority(intervention.priority),
        status=InterventionStatus(intervention.status),
        reason=intervention.reason,
        recommended_action=intervention.recommended_action,
        assigned_to=intervention.assigned_to,
        outcome_notes=None,
        created_at=intervention.created_at,
        updated_at=intervention.updated_at
    ))

@router.patch("/{intervention_id}", response_model=ApiResponse[InterventionResponseDTO])
def update_intervention(
    intervention_id: str,
    req: InterventionUpdateDTO,
    claims: dict = Depends(require_role([Role.FACULTY, Role.ADMIN])),
    db: Session = Depends(get_db)
):
    """Updates status (Proposed -> Active -> Completed), notes, and accountability mentor."""
    iv = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not iv:
        raise HTTPException(status_code=404, detail="Intervention record not found.")

    if req.status:
        iv.status = req.status.value
    if req.priority:
        iv.priority = req.priority.value
    if req.outcome_notes is not None:
        iv.outcome_notes = req.outcome_notes
    if req.assigned_to is not None:
        iv.assigned_to = req.assigned_to

    iv.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(iv)

    stu = iv.student
    return ApiResponse(data=InterventionResponseDTO(
        id=iv.id,
        student_id=stu.student_id if stu else iv.student_id,
        student_name=f"{stu.first_name} {stu.last_name}" if stu else "Unknown",
        student_department=stu.department if stu else "General",
        type=InterventionType(iv.type),
        priority=InterventionPriority(iv.priority),
        status=InterventionStatus(iv.status),
        reason=iv.reason,
        recommended_action=iv.recommended_action,
        outcome_notes=iv.outcome_notes,
        assigned_to=iv.assigned_to,
        created_at=iv.created_at,
        updated_at=iv.updated_at
    ))

@router.get("/prescribe/{student_id}", response_model=ApiResponse[List[PrescriptiveRecommendationDTO]])
def prescribe_student_interventions(
    student_id: str,
    claims: dict = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    """Generates prescriptive recommendations using the resource allocation matrix."""
    caller_role = claims.get("role")
    if caller_role == Role.STUDENT:
        caller_stu_id = claims.get("student_id")
        caller_sub = claims.get("sub")
        if student_id != caller_stu_id and student_id != caller_sub:
            raise HTTPException(
                status_code=403,
                detail="Access forbidden: Students may only generate prescriptive roadmaps for themselves."
            )

    stu = db.query(Student).filter(
        (Student.id == student_id) | (Student.student_id == student_id)
    ).first()

    if not stu:
        raise HTTPException(status_code=404, detail="Student not found.")

    acad = stu.academic_indicator
    place = stu.placement_indicator
    score = stu.score
    risk = stu.risk_assessment

    data = {
        "cgpa": acad.cgpa,
        "backlogs": acad.backlogs,
        "attendance_pct": acad.attendance_pct,
        "attendance_margin": score.attendance_margin,
        "coding_score": place.coding_score,
        "mock_interviews_completed": place.mock_interviews_completed,
        "academic_risk_level": risk.academic_risk_level,
        "placement_risk_level": risk.placement_risk_level,
        "persona_cluster": risk.persona_cluster
    }

    recs = resource_allocator.prescribe_interventions(data)
    return ApiResponse(data=recs)
