from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.student import Student
from app.models.indicators import AcademicIndicator, PlacementIndicator
from app.models.score import StudentScore, RiskAssessment
from app.models.intervention import Intervention
from app.schemas.admin import (
    AdminOverviewDTO, DepartmentMetricDTO, PersonaDistributionDTO,
    RiskDistributionDTO, InterventionStatsDTO, CriticalAlertDTO, CsvImportResultDTO
)
from app.schemas.common import RiskTier, ApiResponse
from app.services.clustering_engine import PERSONAS_METADATA, clustering_engine
from app.services.scoring_engine import scoring_engine
from app.services.ml_service import ml_service
from app.services.data_integration_service import data_integration_service
from app.core.security import require_role, Role

router = APIRouter()

@router.get("/overview", response_model=ApiResponse[AdminOverviewDTO])
def get_admin_overview(
    claims: dict = Depends(require_role(Role.ADMIN)),
    db: Session = Depends(get_db)
):
    """Provides high-level executive analytics for campus administrators."""
    total_students = db.query(Student).count()
    if total_students == 0:
        # Return structured empty state
        empty_data = AdminOverviewDTO(
            total_students=0,
            active_students=0,
            avg_success_score=0.0,
            avg_cgpa=0.0,
            avg_attendance_pct=0.0,
            avg_coding_score=0.0,
            risk_breakdown=[],
            persona_distribution=[],
            department_metrics=[],
            intervention_stats=InterventionStatsDTO(proposed=0, active=0, completed=0, declined=0, success_rate_pct=0.0),
            critical_alerts=[]
        )
        return ApiResponse(data=empty_data)

    active_students = db.query(Student).filter(Student.status == "Active").count()
    
    # Global Averages
    avg_score = db.query(func.avg(StudentScore.success_score)).scalar() or 0.0
    avg_cgpa = db.query(func.avg(AcademicIndicator.cgpa)).scalar() or 0.0
    avg_att = db.query(func.avg(AcademicIndicator.attendance_pct)).scalar() or 0.0
    avg_coding = db.query(func.avg(PlacementIndicator.coding_score)).scalar() or 0.0

    # Risk Breakdown
    risk_counts = dict(
        db.query(RiskAssessment.overall_risk_tier, func.count(RiskAssessment.id))
        .group_by(RiskAssessment.overall_risk_tier)
        .all()
    )
    risk_breakdown = [
        RiskDistributionDTO(
            tier=tier,
            count=risk_counts.get(tier.value, 0),
            percentage=round((risk_counts.get(tier.value, 0) / total_students) * 100, 1)
        )
        for tier in [RiskTier.HIGH, RiskTier.MEDIUM, RiskTier.LOW]
    ]

    # Persona Distribution
    persona_counts = dict(
        db.query(RiskAssessment.persona_cluster, func.count(RiskAssessment.id))
        .group_by(RiskAssessment.persona_cluster)
        .all()
    )
    persona_distribution = [
        PersonaDistributionDTO(
            cluster=c_id,
            label=meta["label"],
            count=persona_counts.get(c_id, 0),
            percentage=round((persona_counts.get(c_id, 0) / total_students) * 100, 1),
            description=meta["description"]
        )
        for c_id, meta in PERSONAS_METADATA.items()
    ]

    # Department Metrics
    dept_rows = (
        db.query(
            Student.department,
            func.count(Student.id).label("total"),
            func.avg(StudentScore.success_score).label("avg_success"),
            func.avg(AcademicIndicator.cgpa).label("avg_cgpa"),
            func.avg(AcademicIndicator.attendance_pct).label("avg_attendance")
        )
        .join(StudentScore, Student.id == StudentScore.student_id)
        .join(AcademicIndicator, Student.id == AcademicIndicator.student_id)
        .group_by(Student.department)
        .all()
    )

    department_metrics = []
    for row in dept_rows:
        dept = row.department
        high_risk_in_dept = (
            db.query(RiskAssessment)
            .join(Student, RiskAssessment.student_id == Student.id)
            .filter(Student.department == dept, RiskAssessment.overall_risk_tier == "High")
            .count()
        )
        ready_in_dept = (
            db.query(StudentScore)
            .join(Student, StudentScore.student_id == Student.id)
            .filter(Student.department == dept, StudentScore.placement_index >= 70.0)
            .count()
        )
        tot = row.total or 1
        department_metrics.append(DepartmentMetricDTO(
            department=dept,
            total_students=tot,
            avg_success_score=round(row.avg_success or 0.0, 1),
            avg_cgpa=round(row.avg_cgpa or 0.0, 2),
            avg_attendance=round(row.avg_attendance or 0.0, 1),
            high_risk_count=high_risk_in_dept,
            placement_readiness_pct=round((ready_in_dept / tot) * 100, 1)
        ))

    # Intervention Stats
    int_counts = dict(
        db.query(Intervention.status, func.count(Intervention.id))
        .group_by(Intervention.status)
        .all()
    )
    completed_int = int_counts.get("Completed", 0)
    total_active_int = completed_int + int_counts.get("Active", 0) + int_counts.get("Proposed", 0)
    succ_rate = round((completed_int / max(1, total_active_int)) * 100, 1)

    intervention_stats = InterventionStatsDTO(
        proposed=int_counts.get("Proposed", 0),
        active=int_counts.get("Active", 0),
        completed=completed_int,
        declined=int_counts.get("Declined", 0),
        success_rate_pct=succ_rate
    )

    # Critical Alerts (Top High-Risk Students with Deficit Margins)
    critical_query = (
        db.query(Student, StudentScore, RiskAssessment, AcademicIndicator)
        .join(StudentScore, Student.id == StudentScore.student_id)
        .join(RiskAssessment, Student.id == RiskAssessment.student_id)
        .join(AcademicIndicator, Student.id == AcademicIndicator.student_id)
        .filter(RiskAssessment.overall_risk_tier == "High")
        .order_by(StudentScore.success_score.asc())
        .limit(6)
        .all()
    )

    critical_alerts = []
    for stu, score, risk, acad in critical_query:
        critical_alerts.append(CriticalAlertDTO(
            student_id=stu.student_id,
            name=f"{stu.first_name} {stu.last_name}",
            department=stu.department,
            semester=stu.semester,
            risk_level=RiskTier(risk.overall_risk_tier),
            top_trigger=risk.top_risk_driver or f"Margin {score.attendance_margin} classes",
            attendance_margin=score.attendance_margin,
            recommended_intervention="Remedial Tutoring" if acad.backlogs >= 2 else "Attendance Counseling"
        ))

    overview = AdminOverviewDTO(
        total_students=total_students,
        active_students=active_students,
        avg_success_score=round(avg_score, 1),
        avg_cgpa=round(avg_cgpa, 2),
        avg_attendance_pct=round(avg_att, 1),
        avg_coding_score=round(avg_coding, 1),
        risk_breakdown=risk_breakdown,
        persona_distribution=persona_distribution,
        department_metrics=department_metrics,
        intervention_stats=intervention_stats,
        critical_alerts=critical_alerts
    )
    return ApiResponse(data=overview)

@router.post("/recalculate-all", response_model=ApiResponse[dict])
def recalculate_all_scores(
    claims: dict = Depends(require_role(Role.ADMIN)),
    db: Session = Depends(get_db)
):
    """Triggers batch recalculation across all students in the database."""
    students = db.query(Student).all()
    updated = 0
    for s in students:
        if s.academic_indicator and s.placement_indicator:
            acad = s.academic_indicator
            place = s.placement_indicator
            metrics = scoring_engine.compute_all_metrics(
                cgpa=acad.cgpa,
                backlogs=acad.backlogs,
                attendance_pct=acad.attendance_pct,
                attended_classes=acad.attended_classes,
                total_classes=acad.total_classes,
                assignment_completion_pct=acad.assignment_completion_pct,
                certifications_count=acad.certifications_count,
                coding_score=place.coding_score,
                aptitude_score=place.aptitude_score,
                mock_interviews_completed=place.mock_interviews_completed
            )
            # Update Score
            if s.score:
                s.score.academic_index = metrics["academic_index"]
                s.score.engagement_index = metrics["engagement_index"]
                s.score.placement_index = metrics["placement_index"]
                s.score.success_score = metrics["success_score"]
                s.score.attendance_margin = metrics["attendance_margin"]
            
            # Update Risk & Persona with all 10 feature attributes
            rdata = {
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
            risk_pred = ml_service.predict_risk(rdata)
            persona_pred = clustering_engine.segment_student(rdata)

            if s.risk_assessment:
                s.risk_assessment.academic_risk_level = risk_pred["academic_risk_level"]
                s.risk_assessment.academic_risk_prob = risk_pred["academic_risk_prob"]
                s.risk_assessment.placement_risk_level = risk_pred["placement_risk_level"]
                s.risk_assessment.placement_risk_prob = risk_pred["placement_risk_prob"]
                s.risk_assessment.overall_risk_tier = risk_pred["overall_risk_tier"]
                s.risk_assessment.persona_cluster = persona_pred["cluster"]
                s.risk_assessment.persona_label = persona_pred["label"]
            updated += 1

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Recalculation transaction failed: {str(e)}")

    return ApiResponse(data={"message": f"Successfully recalculated {updated} students."})

@router.post("/import-csv", response_model=ApiResponse[CsvImportResultDTO])
async def import_students_csv(
    file: UploadFile = File(...),
    claims: dict = Depends(require_role([Role.ADMIN, Role.FACULTY])),
    db: Session = Depends(get_db)
):
    """
    Ingests and validates unified student records via CSV upload.
    Performs header normalization, missing-value imputation, duplicate detection/upsert,
    synchronous score computation, XGBoost risk evaluation, and K-Means segmentation.
    """
    if not file.filename.endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only CSV files (.csv) are supported for batch student ingestion.")

    content_bytes = await file.read()
    try:
        content_str = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        content_str = content_bytes.decode("latin-1", errors="replace")

    result = data_integration_service.parse_and_import_csv(content_str, db)
    return ApiResponse(data=result, message=result.message)

@router.get("/sample-csv")
def download_sample_csv(claims: dict = Depends(require_role([Role.ADMIN, Role.FACULTY]))):
    """Downloads a benchmark student CSV template with pre-populated diverse test records."""
    csv_content = data_integration_service.generate_sample_csv()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=smart_campus_students_sample.csv"
        }
    )

@router.post("/seed-sample-cohort", response_model=ApiResponse[CsvImportResultDTO])
def seed_sample_cohort(
    claims: dict = Depends(require_role(Role.ADMIN)),
    db: Session = Depends(get_db)
):
    """Convenience endpoint: ingests benchmark student cohort into the live database in one click."""
    csv_content = data_integration_service.generate_sample_csv()
    result = data_integration_service.parse_and_import_csv(csv_content, db)
    return ApiResponse(data=result, message="Successfully ingested sample student cohort.")

@router.get("/model-evaluation", response_model=ApiResponse[dict])
def get_model_evaluation_report(claims: dict = Depends(require_role([Role.ADMIN, Role.FACULTY]))):
    """Returns genuine evaluation metrics and hyperparameters from holdout test validation."""
    metrics = ml_service.get_evaluation_metrics()
    return ApiResponse(data=metrics)

