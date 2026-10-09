import pytest
from fastapi.testclient import TestClient
from app.main import app

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

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] in ["healthy", "degraded"]
    assert "version" in data["data"]
    assert data["data"]["models_loaded"] is True
    assert data["data"]["database_connected"] is True

def test_admin_overview_endpoint(admin_headers, student_headers):
    # 1. Unauthenticated request must return 401
    unauth_res = client.get("/api/v1/admin/overview")
    assert unauth_res.status_code == 401

    # 2. Student accessing admin endpoint must return 403
    forbidden_res = client.get("/api/v1/admin/overview", headers=student_headers)
    assert forbidden_res.status_code == 403

    # 3. Admin request succeeds
    response = client.get("/api/v1/admin/overview", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    overview = data["data"]
    assert "total_students" in overview
    assert "avg_success_score" in overview
    assert "risk_breakdown" in overview
    assert "persona_distribution" in overview

def test_faculty_cohort_endpoint(faculty_headers, student_headers):
    # 1. Unauthenticated request must return 401
    unauth_res = client.get("/api/v1/faculty/cohort")
    assert unauth_res.status_code == 401

    # 2. Student accessing faculty cohort must return 403
    forbidden_res = client.get("/api/v1/faculty/cohort", headers=student_headers)
    assert forbidden_res.status_code == 403

    # 3. Faculty request succeeds
    response = client.get("/api/v1/faculty/cohort", headers=faculty_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    cohort = data["data"]
    assert "total_students" in cohort
    assert "students" in cohort
    assert isinstance(cohort["students"], list)

def test_students_list_and_detail_endpoint(admin_headers, faculty_headers, student_headers):
    # 1. Unauthenticated request must return 401
    unauth_res = client.get("/api/v1/students?limit=5")
    assert unauth_res.status_code == 401

    # 2. Student role cannot access students directory (403)
    stu_forbidden = client.get("/api/v1/students?limit=5", headers=student_headers)
    assert stu_forbidden.status_code == 403

    # 3. Faculty / Admin can list students
    list_res = client.get("/api/v1/students?limit=5", headers=admin_headers)
    assert list_res.status_code == 200
    list_data = list_res.json()["data"]
    assert len(list_data) > 0
    first_student_id = list_data[0]["student_id"]

    # 4. Student cannot access another student's record (IDOR protection)
    # student@campus.edu owns STU-2024-001
    other_student_res = client.get("/api/v1/students/STU-2024-002", headers=student_headers)
    assert other_student_res.status_code == 403

    # 5. Student can access their own record
    own_student_res = client.get("/api/v1/students/STU-2024-001", headers=student_headers)
    assert own_student_res.status_code == 200
    own_detail = own_student_res.json()["data"]
    assert own_detail["student_id"] == "STU-2024-001"
    assert "academic_indicators" in own_detail
    assert "score" in own_detail
    assert "risk" in own_detail

    # 6. Admin can view any student detail
    detail_res = client.get(f"/api/v1/students/{first_student_id}", headers=admin_headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()["data"]
    assert detail["student_id"] == first_student_id

def test_xai_explainability_endpoint(admin_headers, student_headers):
    # 1. Student attempting to inspect another student's XAI returns 403
    other_xai = client.get("/api/v1/xai/student/STU-2024-002", headers=student_headers)
    assert other_xai.status_code == 403

    # 2. Student inspecting their own XAI returns 200
    own_xai = client.get("/api/v1/xai/student/STU-2024-001", headers=student_headers)
    assert own_xai.status_code == 200
    xai_data = own_xai.json()["data"]
    assert len(xai_data["top_drivers"]) == 4
    for driver in xai_data["top_drivers"]:
        assert driver["impact_direction"] in ["+Risk", "Support"]
        assert "feature_label" in driver
        assert "narrative" in driver

    # 3. Admin can inspect any student
    admin_xai = client.get("/api/v1/xai/student/STU-2024-001", headers=admin_headers)
    assert admin_xai.status_code == 200

def test_simulator_what_if_endpoint():
    payload = {
        "cgpa": 7.5,
        "backlogs": 1,
        "attendance_pct": 78.0,
        "assignment_completion_pct": 80.0,
        "certifications_count": 2,
        "coding_score": 72.0,
        "aptitude_score": 70.0,
        "mock_interviews_completed": 2
    }
    sim_res = client.post("/api/v1/simulator/what-if", json=payload)
    assert sim_res.status_code == 200
    sim_data = sim_res.json()["data"]
    assert "baseline" in sim_data
    assert "simulated" in sim_data
    assert "deltas" in sim_data
    assert 0.0 <= sim_data["simulated"]["success_score"] <= 100.0

def test_interventions_lifecycle(admin_headers, student_headers):
    # 1. Unauthenticated list must return 401
    unauth_list = client.get("/api/v1/interventions")
    assert unauth_list.status_code == 401

    # 2. Admin/Faculty list succeeds
    list_res = client.get("/api/v1/interventions", headers=admin_headers)
    assert list_res.status_code == 200

    # 3. Student attempting to create intervention is forbidden (403)
    target_id = "STU-2024-001"
    create_payload = {
        "student_id": target_id,
        "type": "Coding Bootcamp",
        "priority": "High",
        "reason": "Test intervention creation for algorithmic sprint.",
        "recommended_action": "Complete weekly lab challenges."
    }
    stu_create = client.post("/api/v1/interventions", json=create_payload, headers=student_headers)
    assert stu_create.status_code == 403

    # 4. Admin creates intervention
    create_res = client.post("/api/v1/interventions", json=create_payload, headers=admin_headers)
    assert create_res.status_code == 200
    created_int = create_res.json()["data"]
    int_id = created_int["id"]
    assert created_int["status"] == "Proposed"

    # 5. Update status (Proposed -> Active)
    patch_payload = {
        "status": "Active",
        "outcome_notes": "Student attended onboarding briefing."
    }
    patch_res = client.patch(f"/api/v1/interventions/{int_id}", json=patch_payload, headers=admin_headers)
    assert patch_res.status_code == 200
    updated = patch_res.json()["data"]
    assert updated["status"] == "Active"
    assert updated["outcome_notes"] == "Student attended onboarding briefing."

def test_auth_login_and_roles():
    # 1. Admin login
    admin_res = client.post("/api/v1/auth/login", json={"email": "admin@campus.edu", "password": "Admin@2026"})
    assert admin_res.status_code == 200
    admin_data = admin_res.json()["data"]
    assert admin_data["user"]["role"] == "admin"
    assert "access_token" in admin_data

    # 2. Faculty login
    faculty_res = client.post("/api/v1/auth/login", json={"email": "faculty@campus.edu", "password": "Faculty@2026"})
    assert faculty_res.status_code == 200
    faculty_data = faculty_res.json()["data"]
    assert faculty_data["user"]["role"] == "faculty"

    # 3. Student login
    student_res = client.post("/api/v1/auth/login", json={"email": "student@campus.edu", "password": "Student@2026"})
    assert student_res.status_code == 200
    student_data = student_res.json()["data"]
    assert student_data["user"]["role"] == "student"
    assert student_data["user"]["student_id"] == "STU-2024-001"

    # 4. Invalid credentials
    bad_res = client.post("/api/v1/auth/login", json={"email": "admin@campus.edu", "password": "wrongpassword"})
    assert bad_res.status_code == 401

    # 5. Demo credentials listing
    demo_res = client.get("/api/v1/auth/demo-credentials")
    assert demo_res.status_code == 200
    roles = [c["role"] for c in demo_res.json()["data"]]
    assert "admin" in roles
    assert "faculty" in roles
    assert "student" in roles
