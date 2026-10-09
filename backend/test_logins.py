import httpx

def run_live_login_tests():
    creds = [
        ("student@campus.edu", "Student@2026"),
        ("faculty@campus.edu", "Faculty@2026"),
        ("admin@campus.edu", "Admin@2026"),
    ]

    print("=== TESTING LOGIN FOR ALL ROLES ===")
    for email, pwd in creds:
        try:
            res = httpx.post("http://127.0.0.1:8000/api/v1/auth/login", json={"email": email, "password": pwd}, timeout=5.0)
            data = res.json().get("data", {})
            user = data.get("user", {})
            token_len = len(data.get("access_token", ""))
            print(f"Logged in: {user.get('name')} | Role: {user.get('role')} | Dept: {user.get('department')} | Target: {data.get('redirect_url')} | JWT Token: {token_len} chars")
        except Exception as e:
            print(f"Live server connection error for {email}: {e}")

    print("Live authentication check script completed.")

if __name__ == "__main__":
    run_live_login_tests()
