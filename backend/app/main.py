from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from app.config import settings
from app.core.database import init_db, SessionLocal
from app.models.student import Student
from app.services.ml_service import ml_service
from app.api import api_router
from app.schemas.common import HealthResponse, ApiResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database and Warm Up ML In-Memory Service
    print(f"[{settings.PROJECT_NAME}] Initializing database tables...")
    init_db()
    print(f"[{settings.PROJECT_NAME}] Warming up machine learning models in memory...")
    ml_service.load_models()
    print(f"[{settings.PROJECT_NAME}] Models active: {ml_service.is_loaded}. Backend ready on port 8000.")
    yield
    # Shutdown
    print(f"[{settings.PROJECT_NAME}] Shutting down engine gracefully...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan
)

# Cross-Origin Resource Sharing (CORS) Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Latency and telemetry middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = (time.perf_counter() - start_time) * 1000  # ms
    response.headers["X-Response-Time-Ms"] = f"{process_time:.2f}"
    return response

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

@app.get("/health", response_model=ApiResponse[HealthResponse], tags=["Health"])
def health_check():
    """Global system health probe and ML readiness check."""
    db_ok = False
    try:
        db = SessionLocal()
        db.query(Student).first()
        db.close()
        db_ok = True
    except Exception:
        db_ok = False

    return ApiResponse(data=HealthResponse(
        status="healthy" if db_ok else "degraded",
        version=settings.VERSION,
        models_loaded=ml_service.is_loaded,
        database_connected=db_ok,
        timestamp=datetime.now(timezone.utc).isoformat()
    ))

@app.get("/", tags=["Root"])
def root():
    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_url": "/health",
        "api_v1_prefix": settings.API_V1_PREFIX
    }
@app.get("/", tags=["Root"])
def root():
    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_url": "/health",
        "api_v1_prefix": settings.API_V1_PREFIX
    }


print("REGISTERED ROUTES:")
for route in app.routes:
    print(
        getattr(route, "methods", None),
        getattr(route, "path", None)
    )