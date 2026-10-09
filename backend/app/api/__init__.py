from fastapi import APIRouter
from app.api.admin import router as admin_router
from app.api.faculty import router as faculty_router
from app.api.student import router as student_router
from app.api.xai import router as xai_router
from app.api.simulator import router as simulator_router
from app.api.interventions import router as interventions_router

from app.api.auth import router as auth_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication & RBAC"])
api_router.include_router(admin_router, prefix="/admin", tags=["Admin Executive"])
api_router.include_router(faculty_router, prefix="/faculty", tags=["Faculty Cohort"])
api_router.include_router(student_router, prefix="/students", tags=["Student Management"])
api_router.include_router(xai_router, prefix="/xai", tags=["Explainable AI (XAI)"])
api_router.include_router(simulator_router, prefix="/simulator", tags=["Digital Twin Simulator"])
api_router.include_router(interventions_router, prefix="/interventions", tags=["Closed-Loop Interventions"])
