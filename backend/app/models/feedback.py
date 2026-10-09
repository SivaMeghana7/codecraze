from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String(64), primary_key=True, index=True)
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    faculty_id = Column(String(64), nullable=False)
    faculty_name = Column(String(128), nullable=False)
    comments = Column(Text, nullable=False)
    rating = Column(Integer, default=4, nullable=False)
    tags = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="feedbacks")
