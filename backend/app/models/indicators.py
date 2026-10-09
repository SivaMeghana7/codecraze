from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class AcademicIndicator(Base):
    __tablename__ = "academic_indicators"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    cgpa = Column(Float, nullable=False)
    backlogs = Column(Integer, default=0, nullable=False)
    internal_exam_avg = Column(Float, nullable=False)
    attendance_pct = Column(Float, nullable=False)
    attended_classes = Column(Integer, nullable=False)
    total_classes = Column(Integer, nullable=False)
    assignment_completion_pct = Column(Float, nullable=False)
    certifications_count = Column(Integer, default=0, nullable=False)
    lab_performance_score = Column(Float, default=75.0, nullable=False)
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="academic_indicator")


class PlacementIndicator(Base):
    __tablename__ = "placement_indicators"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    coding_score = Column(Float, nullable=False)
    aptitude_score = Column(Float, nullable=False)
    mock_interviews_completed = Column(Integer, default=0, nullable=False)
    technical_skills_count = Column(Integer, default=0, nullable=False)
    soft_skills_rating = Column(Float, default=3.5, nullable=False)
    internship_status = Column(String(32), default="None", nullable=False)
    projects_count = Column(Integer, default=1, nullable=False)
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="placement_indicator")
