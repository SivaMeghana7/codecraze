from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class StudentScore(Base):
    __tablename__ = "student_scores"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    academic_index = Column(Float, nullable=False)
    engagement_index = Column(Float, nullable=False)
    placement_index = Column(Float, nullable=False)
    success_score = Column(Float, nullable=False, index=True)
    attendance_margin = Column(Integer, nullable=False)
    percentile_rank = Column(Float, nullable=True)
    last_calculated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="score")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    academic_risk_level = Column(String(16), nullable=False)
    academic_risk_prob = Column(Float, nullable=False)
    placement_risk_level = Column(String(16), nullable=False)
    placement_risk_prob = Column(Float, nullable=False)
    overall_risk_tier = Column(String(16), nullable=False, index=True)
    persona_cluster = Column(Integer, nullable=False, index=True)
    persona_label = Column(String(64), nullable=False)
    top_risk_driver = Column(String(128), nullable=True)
    calculated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="risk_assessment")
