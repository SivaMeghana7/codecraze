import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.scoring_engine import scoring_engine
from app.services.ml_service import ml_service
from app.services.clustering_engine import clustering_engine
from app.core.database import SessionLocal
from app.models.student import Student

client = TestClient(app)

def get_auth_headers(email: str, password: str) -> dict:
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, f"Login failed for {email}: {response.text}"
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="module")
def admin_headers():
    return get_auth_headers("admin@campus.edu", "Admin@2026")

@pytest.fixture(scope="module")
def faculty_headers():
    return get_auth_headers("faculty@campus.edu", "Faculty@2026")

@pytest.fixture(scope="module")
def student_headers():
    return get_auth_headers("student@campus.edu", "Student@2026")

# 1. Student data import
def test_1_student_data_import(admin_headers):
    csv_content = (
        "student_id,first_name,last_name,email,department,semester,cgpa,attendance_pct,backlogs,"
        "assignment_completion_pct,lms_logins_per_week,library_visits_per_month,extracurricular_score,"
        "coding_score,aptitude_score,certifications_count,mock_interviews_completed,mentor_feedback_score\n"
        "STU-KPMG-999,Aarav,Patel,aarav.patel.kpmg@campus.edu,Computer Science,6,8.75,91.0,0,"
        "95.0,22,12,85.0,88.5,82.0,3,4,4.8\n"
    )
    file_bytes = io.BytesIO(csv_content.encode("utf-8"))
    files = {"file": ("kpmg_test_import.csv", file_bytes, "text/csv")}
    
    response = client.post("/api/v1/admin/import-csv", files=files, headers=admin_headers)
    assert response.status_code == 200, f"Import failed: {response.text}"
    data = response.json()["data"]
    assert data["total_rows"] == 1
    assert data["imported_count"] + data["updated_count"] == 1
    assert data["failed_count"] == 0
    assert len(data["errors"]) == 0

    # Verify persistence in database
    db = SessionLocal()
    try:
        stu = db.query(Student).filter(Student.student_id == "STU-KPMG-999").first()
        assert stu is not None
        assert stu.first_name == "Aarav"
        assert stu.academic_indicator is not None
        assert stu.academic_indicator.cgpa == 8.75
        assert stu.score is not None
        assert stu.score.success_score > 0
        assert stu.risk_assessment is not None
    finally:
        db.close()

# 2. Student profile retrieval
def test_2_student_profile_retrieval(admin_headers):
    response = client.get("/api/v1/students/STU-2024-001", headers=admin_headers)
    assert response.status_code == 200
    profile = response.json()["data"]
    assert profile["student_id"] == "STU-2024-001"
    assert "academic_indicators" in profile
    assert "placement_indicators" in profile
    assert "score" in profile
    assert "risk" in profile
    assert "interventions" in profile
    assert profile["academic_indicators"]["cgpa"] > 0
    assert 0.0 <= profile["score"]["success_score"] <= 100.0

# 3. Success Score calculation
def test_3_success_score_calculation():
    acad_idx = scoring_engine.calculate_academic_index(8.5, 0)
    eng_idx = scoring_engine.calculate_engagement_index(92.0, 90.0, 3)
    place_idx = scoring_engine.calculate_placement_index(85.0, 80.0, 3)
    score = scoring_engine.calculate_success_score(acad_idx, eng_idx, place_idx)

    assert 0.0 <= score <= 100.0
    assert 0.0 <= acad_idx <= 100.0
    assert 0.0 <= eng_idx <= 100.0
    assert 0.0 <= place_idx <= 100.0

    metrics = scoring_engine.compute_all_metrics(
        cgpa=8.5,
        backlogs=0,
        attendance_pct=92.0,
        assignment_completion_pct=90.0,
        certifications_count=3,
        coding_score=85.0,
        aptitude_score=80.0,
        mock_interviews_completed=3
    )
    assert 0.0 <= metrics["success_score"] <= 100.0
    assert "attendance_margin" in metrics

    # Verify weights config exists and sums to 1.0
    weights = scoring_engine.get_weight_configuration()
    domain_sum = sum(weights.values())
    assert abs(domain_sum - 1.0) < 1e-4

# 4. Academic-risk prediction
def test_4_academic_risk_prediction():
    student_vector = {
        "cgpa": 6.2,
        "backlogs": 2,
        "attendance_pct": 65.0,
        "assignment_completion_pct": 60.0,
        "internal_exam_avg": 58.0,
        "coding_score": 50.0,
        "aptitude_score": 52.0,
        "certifications_count": 0,
        "mock_interviews_completed": 0,
        "technical_skills_count": 2
    }
    risk_res = ml_service.predict_risk(student_vector)
    assert "academic_risk_prob" in risk_res
    assert 0.0 <= risk_res["academic_risk_prob"] <= 1.0
    assert risk_res["academic_risk_level"] in ["Low", "Medium", "High"]
    assert "academic_model_source" in risk_res
    assert risk_res["academic_model_source"] in ["xgboost_model", "heuristic_fallback"]

# 5. Placement-risk prediction
def test_5_placement_risk_prediction():
    student_vector = {
        "cgpa": 6.5,
        "backlogs": 1,
        "attendance_pct": 78.0,
        "assignment_completion_pct": 75.0,
        "internal_exam_avg": 68.0,
        "coding_score": 50.0,
        "aptitude_score": 55.0,
        "certifications_count": 0,
        "mock_interviews_completed": 1,
        "technical_skills_count": 3
    }
    risk_res = ml_service.predict_risk(student_vector)
    assert "placement_risk_prob" in risk_res
    assert 0.0 <= risk_res["placement_risk_prob"] <= 1.0
    assert risk_res["placement_risk_level"] in ["Low", "Medium", "High"]
    assert "placement_model_source" in risk_res
    assert risk_res["placement_model_source"] in ["xgboost_model", "heuristic_fallback"]

# 6. Explanation generation
def test_6_explanation_generation(admin_headers):
    response = client.get("/api/v1/xai/student/STU-2024-001", headers=admin_headers)
    assert response.status_code == 200
    xai = response.json()["data"]
    assert "top_drivers" in xai
    assert len(xai["top_drivers"]) >= 3
    for driver in xai["top_drivers"]:
        assert "feature_name" in driver
        assert "feature_label" in driver
        assert "impact_direction" in driver
        assert driver["impact_direction"] in ["+Risk", "Support"]
        assert "narrative" in driver
        assert len(driver["narrative"]) > 0

# 7. Student segmentation
def test_7_student_segmentation():
    seg = clustering_engine.segment_student({
        "cgpa": 8.8,
        "attendance_pct": 92.0,
        "coding_score": 85.0,
        "internal_exam_avg": 88.0,
        "backlogs": 0
    })
    assert "cluster" in seg
    assert 0 <= seg["cluster"] <= 3
    assert seg["label"] in [
        "High Academic / Placement Ready",
        "Unpolished Gems",
        "Disengaged Talents",
        "Critical Academic Support Needed"
    ]
    # For a high achiever, verify it maps to Cluster 0 (canonical top tier)
    assert seg["cluster"] == 0
    assert seg["label"] == "High Academic / Placement Ready"

# 8. Dashboard data retrieval
def test_8_dashboard_data_retrieval(admin_headers, faculty_headers):
    # Admin overview
    admin_res = client.get("/api/v1/admin/overview", headers=admin_headers)
    assert admin_res.status_code == 200
    admin_data = admin_res.json()["data"]
    assert admin_data["total_students"] > 0
    assert 0.0 <= admin_data["avg_success_score"] <= 100.0
    assert "risk_breakdown" in admin_data
    assert "department_metrics" in admin_data

    # Faculty cohort
    faculty_res = client.get("/api/v1/faculty/cohort", headers=faculty_headers)
    assert faculty_res.status_code == 200
    faculty_data = faculty_res.json()["data"]
    assert faculty_data["total_students"] > 0
    assert len(faculty_data["students"]) > 0

# 9. Intervention creation and status updates
def test_9_intervention_creation_and_status_updates(admin_headers):
    # Create intervention
    payload = {
        "student_id": "STU-2024-001",
        "type": "Remedial Tutoring",
        "priority": "Medium",
        "reason": "Midterm performance review follow-up",
        "recommended_action": "Schedule 2 weekly peer mentoring sessions in Algorithms."
    }
    create_res = client.post("/api/v1/interventions", json=payload, headers=admin_headers)
    assert create_res.status_code == 200, f"Intervention creation failed: {create_res.text}"
    created = create_res.json()["data"]
    int_id = created["id"]
    assert created["status"] == "Proposed"
    assert created["type"] == "Remedial Tutoring"

    # Status update: Proposed -> Active -> Completed
    patch_res = client.patch(
        f"/api/v1/interventions/{int_id}",
        json={"status": "Active", "outcome_notes": "Student paired with Senior Tutor."},
        headers=admin_headers
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()["data"]
    assert updated["status"] == "Active"
    assert "Senior Tutor" in updated["outcome_notes"]

    patch_comp = client.patch(
        f"/api/v1/interventions/{int_id}",
        json={"status": "Completed", "outcome_notes": "Completed 6 sessions; quiz score improved from 62 to 84."},
        headers=admin_headers
    )
    assert patch_comp.status_code == 200
    assert patch_comp.json()["data"]["status"] == "Completed"

# 10. Unauthorized access rejection
def test_10_unauthorized_access_rejection(student_headers):
    # 1. Missing Authorization header returns 401
    res_no_auth = client.get("/api/v1/admin/overview")
    assert res_no_auth.status_code == 401

    # 2. Invalid Bearer token returns 401
    res_bad_token = client.get("/api/v1/admin/overview", headers={"Authorization": "Bearer invalid.token.payload"})
    assert res_bad_token.status_code == 401

    # 3. Student role accessing Admin endpoint returns 403
    res_stu_admin = client.get("/api/v1/admin/overview", headers=student_headers)
    assert res_stu_admin.status_code == 403

    # 4. Student accessing students directory returns 403
    res_stu_list = client.get("/api/v1/students", headers=student_headers)
    assert res_stu_list.status_code == 403

    # 5. Student accessing another student's record returns 403 (IDOR)
    res_stu_idor = client.get("/api/v1/students/STU-2024-002", headers=student_headers)
    assert res_stu_idor.status_code == 403
