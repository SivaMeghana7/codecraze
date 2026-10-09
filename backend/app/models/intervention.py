from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(64), nullable=False)
    priority = Column(String(16), nullable=False)
    status = Column(String(32), default="Proposed", nullable=False, index=True)
    assigned_to = Column(String(128), nullable=True)
    reason = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    outcome_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="interventions")
