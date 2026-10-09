from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(32), unique=True, index=True, nullable=False)
    first_name = Column(String(64), nullable=False)
    last_name = Column(String(64), nullable=False)
    email = Column(String(128), unique=True, nullable=False)
    department = Column(String(64), nullable=False, index=True)
    semester = Column(Integer, nullable=False, index=True)
    cohort_year = Column(Integer, nullable=False)
    mentor_name = Column(String(128), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    status = Column(String(32), default="Active", index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    academic_indicator = relationship("AcademicIndicator", back_populates="student", uselist=False, cascade="all, delete-orphan")
    placement_indicator = relationship("PlacementIndicator", back_populates="student", uselist=False, cascade="all, delete-orphan")
    score = relationship("StudentScore", back_populates="student", uselist=False, cascade="all, delete-orphan")
    risk_assessment = relationship("RiskAssessment", back_populates="student", uselist=False, cascade="all, delete-orphan")
    interventions = relationship("Intervention", back_populates="student", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="student", cascade="all, delete-orphan")
