import httpx

print("=== VERIFYING ALL PRODUCTION ROUTES & ENDPOINTS ===")

# 1. Verify Frontend Pages
frontend_urls = [
    ('Frontend /', 'http://localhost:3000'),
    ('Frontend /login', 'http://localhost:3000/login'),
    ('Frontend /admin', 'http://localhost:3000/admin'),
    ('Frontend /faculty', 'http://localhost:3000/faculty'),
    ('Frontend /student', 'http://localhost:3000/student'),
    ('Frontend /students/STU-2024-001', 'http://localhost:3000/students/STU-2024-001'),
    ('Frontend /interventions', 'http://localhost:3000/interventions'),
    ('Frontend /methodology', 'http://localhost:3000/methodology'),
    ('Frontend /data-management', 'http://localhost:3000/data-management'),
]

all_ok = True

for label, u in frontend_urls:
    try:
        r = httpx.get(u, timeout=10.0)
        status = r.status_code
        print(f"[{status}] {label}: {u}")
        if status != 200:
            all_ok = False
    except Exception as e:
        print(f"[FAIL] {label}: {e}")
        all_ok = False

# 2. Verify Backend Public Endpoints
public_backend = [
    ('Backend /health', 'http://127.0.0.1:8000/health'),
    ('Backend Auth Demo Creds', 'http://127.0.0.1:8000/api/v1/auth/demo-credentials'),
]

for label, u in public_backend:
    try:
        r = httpx.get(u, timeout=5.0)
        status = r.status_code
        print(f"[{status}] {label}: {u}")
        if status != 200:
            all_ok = False
    except Exception as e:
        print(f"[FAIL] {label}: {e}")
        all_ok = False

# 3. Authenticate to get JWT token
auth_res = httpx.post(
    "http://127.0.0.1:8000/api/v1/auth/login",
    json={"email": "admin@campus.edu", "password": "Admin@2026"},
    timeout=5.0
)
admin_token = auth_res.json().get("data", {}).get("access_token")
headers = {"Authorization": f"Bearer {admin_token}"}
print(f"[{auth_res.status_code}] Backend Auth Login: Token acquired ({len(admin_token or '')} chars)")

# 4. Verify Authenticated Backend Protected Endpoints
auth_backend = [
    ('Backend Admin Overview', 'http://127.0.0.1:8000/api/v1/admin/overview'),
    ('Backend Faculty Cohort', 'http://127.0.0.1:8000/api/v1/faculty/cohort'),
    ('Backend Students List', 'http://127.0.0.1:8000/api/v1/students'),
    ('Backend XAI Attribution', 'http://127.0.0.1:8000/api/v1/xai/student/STU-2024-001'),
    ('Backend Interventions List', 'http://127.0.0.1:8000/api/v1/interventions'),
]

for label, u in auth_backend:
    try:
        r = httpx.get(u, headers=headers, timeout=10.0)
        status = r.status_code
        print(f"[{status}] {label}: {u}")
        if status != 200:
            all_ok = False
    except Exception as e:
        print(f"[FAIL] {label}: {e}")
        all_ok = False

# 5. Test Simulator POST
sim_payload = {
    "cgpa": 8.0,
    "backlogs": 0,
    "attendance_pct": 88.0,
    "assignment_completion_pct": 90.0,
    "certifications_count": 2,
    "coding_score": 75.0,
    "aptitude_score": 80.0,
    "mock_interviews_completed": 2
}
r_sim = httpx.post("http://127.0.0.1:8000/api/v1/simulator/what-if", json=sim_payload, timeout=5.0)
sim_data = r_sim.json().get("data", {})
score = sim_data.get("simulated", {}).get("success_score")
latency = r_sim.headers.get("x-response-time-ms")
print(f"[{r_sim.status_code}] Backend Simulator POST /what-if: score={score}, latency={latency}ms")

print("ALL SYSTEMS OPERATIONAL:", all_ok and r_sim.status_code == 200)
