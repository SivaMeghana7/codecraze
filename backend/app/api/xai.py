from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.student import Student
from app.schemas.outreach import ExplainabilityResponseDTO, OutreachDraftRequestDTO, OutreachDraftResponseDTO
from app.schemas.common import ApiResponse
from app.services.explainability_engine import explainability_engine
from app.core.security import require_role, get_current_user_claims, Role

router = APIRouter()

@router.get("/student/{id_or_code}", response_model=ApiResponse[ExplainabilityResponseDTO])
def get_student_explainability(
    id_or_code: str,
    claims: dict = Depends(get_current_user_claims),
    db: Session = Depends(get_db)
):
    """Computes exact local Shapley values via TreeSHAP. Enforces privacy boundary for students."""
    stu = db.query(Student).filter(
        (Student.id == id_or_code) | (Student.student_id == id_or_code)
    ).first()

    if not stu:
        raise HTTPException(status_code=404, detail="Student not found.")

    caller_role = claims.get("role")
    if caller_role == Role.STUDENT:
        caller_stu_id = claims.get("student_id")
        caller_sub = claims.get("sub")
        if stu.student_id != caller_stu_id and stu.id != caller_sub and stu.email != claims.get("email"):
            raise HTTPException(
                status_code=403,
                detail="Access forbidden: Students may only inspect their personal explainability drivers."
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

    student_data = {
        "student_id": stu.student_id,
        "cgpa": acad.cgpa,
        "backlogs": acad.backlogs,
        "internal_exam_avg": acad.internal_exam_avg,
        "attendance_pct": acad.attendance_pct,
        "assignment_completion_pct": acad.assignment_completion_pct,
        "certifications_count": acad.certifications_count,
        "coding_score": place.coding_score,
        "aptitude_score": place.aptitude_score,
        "mock_interviews_completed": place.mock_interviews_completed,
        "technical_skills_count": place.technical_skills_count
    }

    result = explainability_engine.explain_student_risk(student_data)
    return ApiResponse(data=ExplainabilityResponseDTO(**result))

@router.post("/outreach-draft", response_model=ApiResponse[OutreachDraftResponseDTO])
def generate_outreach_draft(
    req: OutreachDraftRequestDTO,
    claims: dict = Depends(require_role([Role.FACULTY, Role.ADMIN])),
    db: Session = Depends(get_db)
):
    """Generates automated personalized outreach draft integrating XAI risk drivers."""
    stu = db.query(Student).filter(
        (Student.id == req.student_id) | (Student.student_id == req.student_id)
    ).first()

    if not stu:
        raise HTTPException(status_code=404, detail="Student not found.")

    acad = stu.academic_indicator
    score = stu.score
    risk = stu.risk_assessment

    student_name = f"{stu.first_name} {stu.last_name}"

    if req.template_type == "attendance_warning":
        subject = f"[URGENT] Academic Attendance Advisory: Notice of Statutory Margin Shortfall - {stu.student_id}"
        body = (
            f"Dear {stu.first_name},\n\n"
            f"Our institutional monitoring system indicates that your current class attendance stands at "
            f"{acad.attendance_pct:.1f}%, resulting in an attendance margin of {score.attendance_margin} classes.\n\n"
            f"Under University Regulations, a minimum of 75% attendance is required for semester examination eligibility. "
            f"To restore compliant standing, you must attend consecutive scheduled sessions without unexcused absences.\n\n"
            f"Please schedule an immediate consultation with your faculty mentor, {stu.mentor_name or 'Department Office'}, "
            f"within 48 hours to confirm your academic recovery plan.\n\n"
            f"Office of Academic Affairs & Student Success\n"
            f"Smart Campus Intelligence Platform"
        )
        actions = ["Schedule Faculty Mentorship Meeting", "Sign Attendance Recovery Contract", "Review Weekly Lecture Timetable"]
        prio = "High"

    elif req.template_type == "academic_remedial":
        subject = f"Academic Performance Advisory & Remedial Tutoring Enrollment - {stu.student_id}"
        body = (
            f"Dear {stu.first_name},\n\n"
            f"In reviewing mid-term progress for semester {stu.semester}, our predictive analytics suite identified "
            f"that your academic trajectory would benefit from dedicated institutional support. "
            f"With current active backlogs at {acad.backlogs} and a CGPA of {acad.cgpa:.2f}, we are activating "
            f"a personalized remedial tutoring pathway tailored to your engineering coursework.\n\n"
            f"Your faculty advisor will walk you through the modular curriculum and problem-solving workshops.\n\n"
            f"Warm regards,\nDepartment of {stu.department}"
        )
        actions = ["Enroll in Remedial Tutoring Workshop", "Access Subject Study Material", "Attend Peer Problem Solving Lab"]
        prio = "High" if acad.backlogs >= 2 else "Medium"

    else:
        subject = f"Campus Placement Acceleration Track & Technical Booster - {stu.student_id}"
        body = (
            f"Dear {stu.first_name},\n\n"
            f"As part of our mission to ensure 100% placement readiness for the {stu.department} cohort, "
            f"we have selected your profile for an accelerated technical development sprint.\n\n"
            f"Your current success score is {score.success_score:.1f}. Enhancing algorithmic coding performance and "
            f"participating in structured mock interviews will immediately position you for Tier-1 corporate drives.\n\n"
            f"Campus Placement Cell"
        )
        actions = ["Register for 4-Week Coding Bootcamp", "Book Corporate Mock Interview", "Update GitHub / Portfolio"]
        prio = "Medium"

    draft = OutreachDraftResponseDTO(
        student_id=stu.student_id,
        student_name=student_name,
        recipient_email=stu.email,
        channel=req.channel,
        subject=subject,
        message_body=body,
        priority=prio,
        suggested_actions=actions
    )
    return ApiResponse(data=draft)
