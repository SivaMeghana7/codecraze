import hashlib
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.core.security import create_access_token, Role, verify_password
from app.models.student import Student
from app.schemas.auth import UserDTO, LoginResponseDTO, DemoCredentialDTO

# Institutional Accounts Catalog
DEMO_CREDENTIALS = [
    DemoCredentialDTO(
        role=Role.ADMIN,
        label="Administrator",
        email="admin@campus.edu",
        password="Admin@2026",
        description="Full access to executive risk command, department metrics, model synchronizations, and data operations.",
        badge_color="rose",
        redirect_url="/admin"
    ),
    DemoCredentialDTO(
        role=Role.FACULTY,
        label="Faculty Advisor",
        email="faculty@campus.edu",
        password="Faculty@2026",
        description="Department cohort management, attendance deficit margin alerts, and closed-loop intervention prescriptions.",
        badge_color="indigo",
        redirect_url="/faculty"
    ),
    DemoCredentialDTO(
        role=Role.STUDENT,
        label="Student",
        email="student@campus.edu",
        password="Student@2026",
        description="Access personal student success index, TreeSHAP explainability drivers, statutory attendance margin, and What-If Digital Twin simulator.",
        badge_color="emerald",
        redirect_url="/student"
    ),
]

STATIC_USERS: Dict[str, Dict[str, Any]] = {
    "admin@campus.edu": {
        "id": "usr-admin-01",
        "email": "admin@campus.edu",
        "password": "Admin@2026",
        "name": "Dr. Eleanor Vance",
        "role": Role.ADMIN,
        "department": "Office of Academic Affairs & Analytics",
        "student_id": None,
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "redirect_url": "/admin"
    },
    "faculty@campus.edu": {
        "id": "usr-faculty-01",
        "email": "faculty@campus.edu",
        "password": "Faculty@2026",
        "name": "Prof. Ananya Sen",
        "role": Role.FACULTY,
        "department": "Artificial Intelligence & Machine Learning",
        "student_id": None,
        "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
        "redirect_url": "/faculty"
    },
    "rameshwar@campus.edu": {
        "id": "usr-faculty-02",
        "email": "rameshwar@campus.edu",
        "password": "Faculty@2026",
        "name": "Dr. Rameshwar Sharma",
        "role": Role.FACULTY,
        "department": "Computer Science & Engineering",
        "student_id": None,
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        "redirect_url": "/faculty"
    },
    "student@campus.edu": {
        "id": "usr-stu-01",
        "email": "student@campus.edu",
        "password": "Student@2026",
        "name": "Aarav Patel",
        "role": Role.STUDENT,
        "department": "Computer Science & Engineering",
        "student_id": "STU-2024-001",
        "avatar_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        "redirect_url": "/student"
    },
    "atrisk.student@campus.edu": {
        "id": "usr-stu-03",
        "email": "atrisk.student@campus.edu",
        "password": "Student@2026",
        "name": "Kabir Verma",
        "role": Role.STUDENT,
        "department": "Data Science",
        "student_id": "STU-2024-003",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        "redirect_url": "/students/STU-2024-003"
    }
}

class AuthService:
    """Manages multi-tenant authentication, credentials verification, and JWT session generation."""

    def authenticate_user(self, email_or_id: str, password: str, db: Session) -> Optional[LoginResponseDTO]:
        normalized = email_or_id.strip().lower()

        # 1. Match against static canonical accounts
        if normalized in STATIC_USERS:
            user_data = STATIC_USERS[normalized]
            if verify_password(password, user_data["password"]):
                return self._build_login_response(user_data)

        # Also support canonical username aliases with secure constant-time verification
        if normalized == "admin" and verify_password(password, "Admin@2026"):
            return self._build_login_response(STATIC_USERS["admin@campus.edu"])
        if normalized == "faculty" and verify_password(password, "Faculty@2026"):
            return self._build_login_response(STATIC_USERS["faculty@campus.edu"])
        if normalized == "student" and verify_password(password, "Student@2026"):
            return self._build_login_response(STATIC_USERS["student@campus.edu"])

        # 2. Check Database for Students by student_id or email
        db_student = db.query(Student).filter(
            (Student.email.ilike(normalized)) | (Student.student_id.ilike(normalized))
        ).first()

        # Enforce consistent institutional password verification for registered students
        if db_student and verify_password(password, "Student@2026"):
            user_data = {
                "id": db_student.id,
                "email": db_student.email,
                "name": f"{db_student.first_name} {db_student.last_name}",
                "role": Role.STUDENT,
                "department": db_student.department,
                "student_id": db_student.student_id,
                "avatar_url": db_student.avatar_url,
                "redirect_url": f"/students/{db_student.student_id}"
            }
            return self._build_login_response(user_data)

        return None

    def _build_login_response(self, user_data: Dict[str, Any]) -> LoginResponseDTO:
        claims = {
            "sub": user_data["id"],
            "email": user_data["email"],
            "name": user_data["name"],
            "role": user_data["role"],
            "department": user_data["department"],
            "student_id": user_data.get("student_id")
        }
        token = create_access_token(claims)
        user_dto = UserDTO(
            id=user_data["id"],
            email=user_data["email"],
            name=user_data["name"],
            role=user_data["role"],
            department=user_data["department"],
            student_id=user_data.get("student_id"),
            avatar_url=user_data.get("avatar_url")
        )
        return LoginResponseDTO(
            access_token=token,
            token_type="bearer",
            user=user_dto,
            redirect_url=user_data["redirect_url"]
        )

    def get_demo_credentials(self) -> List[DemoCredentialDTO]:
        return DEMO_CREDENTIALS

auth_service = AuthService()
