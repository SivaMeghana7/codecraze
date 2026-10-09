from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.student import Student
from app.schemas.simulation import SimulationRequestDTO, SimulationResponseDTO
from app.schemas.common import ApiResponse
from app.services.simulation_engine import simulation_engine

router = APIRouter()

@router.post("/what-if", response_model=ApiResponse[SimulationResponseDTO])
def simulate_trajectory(req: SimulationRequestDTO, db: Session = Depends(get_db)):
    """
    Sub-50ms real-time digital twin simulator.
    Recalculates normalized success score, dual XGBoost risk probability, attendance margin,
    and persona shift against baseline.
    """
    baseline_override = None

    if req.student_id:
        stu = db.query(Student).filter(
            (Student.id == req.student_id) | (Student.student_id == req.student_id)
        ).first()

        if stu and stu.score and stu.risk_assessment:
            baseline_override = {
                "academic_index": stu.score.academic_index,
                "engagement_index": stu.score.engagement_index,
                "placement_index": stu.score.placement_index,
                "success_score": stu.score.success_score,
                "attendance_margin": stu.score.attendance_margin,
                "overall_risk_tier": stu.risk_assessment.overall_risk_tier,
                "persona_cluster": stu.risk_assessment.persona_cluster,
                "persona_label": stu.risk_assessment.persona_label
            }

    sim_data = req.model_dump()
    result = simulation_engine.simulate(sim_data, baseline_override=baseline_override)
    return ApiResponse(data=SimulationResponseDTO(**result))
