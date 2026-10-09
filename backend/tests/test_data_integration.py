import pytest
from app.core.database import SessionLocal
from app.models.student import Student
from app.services.data_integration_service import data_integration_service
from app.services.scoring_engine import scoring_engine
from app.services.ml_service import ml_service

def test_generate_sample_csv():
    csv_str = data_integration_service.generate_sample_csv()
    assert "student_id" in csv_str
    assert "cgpa" in csv_str
    assert "STU-2024-101" in csv_str

def test_parse_and_import_csv():
    db = SessionLocal()
    try:
        sample_csv = (
            "student_id,first_name,last_name,email,department,semester,cgpa,backlogs,attendance_pct,coding_score,aptitude_score,mock_interviews_completed\n"
            "TEST-IMPORT-001,TestFirstName,TestLastName,testimport001@campus.edu,Computer Science & Engineering,6,8.8,0,92.0,88.0,85.0,3\n"
            "TEST-IMPORT-002,AtRiskStudent,LastName,atrisk002@campus.edu,Data Science,6,5.2,3,62.0,40.0,45.0,0\n"
        )
        result = data_integration_service.parse_and_import_csv(sample_csv, db)
        assert result.imported_count >= 2 or result.updated_count >= 2
        assert result.failed_count == 0

        # Verify TEST-IMPORT-001 in DB
        s1 = db.query(Student).filter(Student.student_id == "TEST-IMPORT-001").first()
        assert s1 is not None
        assert s1.academic_indicator is not None
        assert s1.academic_indicator.cgpa == 8.8
        assert s1.score is not None
        assert s1.score.success_score > 70.0
        assert s1.risk_assessment is not None
        assert s1.risk_assessment.overall_risk_tier in ["Low", "Medium"]

        # Verify TEST-IMPORT-002 in DB (At-Risk)
        s2 = db.query(Student).filter(Student.student_id == "TEST-IMPORT-002").first()
        assert s2 is not None
        assert s2.academic_indicator.backlogs == 3
        assert s2.risk_assessment.overall_risk_tier == "High"
        assert s2.risk_assessment.persona_cluster == 3  # Critical Support

        # Test Upsert / Duplicate Detection: importing again should update, not create duplicate
        update_csv = (
            "student_id,first_name,last_name,cgpa,backlogs,attendance_pct\n"
            "TEST-IMPORT-001,TestFirstNameUpdated,TestLastName,9.2,0,95.0\n"
        )
        result_update = data_integration_service.parse_and_import_csv(update_csv, db)
        assert result_update.updated_count == 1
        db.refresh(s1)
        assert s1.first_name == "TestFirstNameUpdated"
        assert s1.academic_indicator.cgpa == 9.2

        # Clean up test rows
        db.delete(s1)
        db.delete(s2)
        db.commit()
    finally:
        db.close()

def test_missing_value_handling_in_csv():
    db = SessionLocal()
    try:
        # CSV with missing fields (empty cgpa, missing attendance, missing coding)
        sparse_csv = (
            "student_id,name\n"
            "TEST-SPARSE-001,John Doe\n"
        )
        result = data_integration_service.parse_and_import_csv(sparse_csv, db)
        assert result.imported_count == 1
        assert result.failed_count == 0

        stu = db.query(Student).filter(Student.student_id == "TEST-SPARSE-001").first()
        assert stu is not None
        assert stu.first_name == "John"
        assert stu.last_name == "Doe"
        assert stu.academic_indicator.cgpa == 6.8  # default imputed
        assert stu.score.success_score > 0

        # Clean up
        db.delete(stu)
        db.commit()
    finally:
        db.close()
