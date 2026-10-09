import os
import sys
import uuid
import random
from pathlib import Path
from datetime import datetime, timezone

# Add backend to PYTHONPATH to leverage native engines
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import SessionLocal, init_db, engine
from app.models.student import Student
from app.models.indicators import AcademicIndicator, PlacementIndicator
from app.models.score import StudentScore, RiskAssessment
from app.models.intervention import Intervention
from app.services.scoring_engine import scoring_engine
from app.services.ml_service import ml_service
from app.services.clustering_engine import clustering_engine, PERSONAS_METADATA

DEPARTMENTS = [
    "Computer Science & Engineering",
    "Artificial Intelligence & Machine Learning",
    "Data Science",
    "Information Technology",
    "Electronics & Communication Engineering"
]

FACULTY_MENTORS = [
    "Dr. Rameshwar Sharma",
    "Prof. Ananya Sen",
    "Dr. Arvind Krishnan",
    "Prof. Priya Nair",
    "Dr. Vikramaditya Rao",
    "Prof. Sunita Deshmukh"
]

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Muhammad", "Sai", "Ayaan", "Krishna",
    "Ishaan", "Shaurya", "Atharv", "Dhruv", "Kabir", "Diya", "Saanvi", "Aanya", "Aadhya", "Pari",
    "Ananya", "Myra", "Riya", "Avani", "Isha", "Rohan", "Meera", "Kavya", "Tanvi", "Neha",
    "Dev", "Rishi", "Siddharth", "Tara", "Nikhil", "Zoya", "Gaurav", "Simran", "Rahul", "Pooja",
    "Vikram", "Anjali", "Harsh", "Sneha", "Karan", "Shruti", "Akash", "Bhavna", "Manish", "Divya"
]

LAST_NAMES = [
    "Patel", "Sharma", "Verma", "Rao", "Reddy", "Iyer", "Nair", "Mehta", "Deshmukh", "Chopra",
    "Kapoor", "Kulkarni", "Mukherjee", "Banerjee", "Gupta", "Bhat", "Joshi", "Singhania", "Pillai", "Menon"
]

AVATARS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80"
]

def generate_seeds(total_count: int = 75):
    print("[SeedGenerator] Initializing schema and warming ML services...")
    init_db()
    ml_service.load_models()
    db = SessionLocal()

    # Clear existing data
    db.query(Intervention).delete()
    db.query(RiskAssessment).delete()
    db.query(StudentScore).delete()
    db.query(PlacementIndicator).delete()
    db.query(AcademicIndicator).delete()
    db.query(Student).delete()
    db.commit()

    random.seed(2026)

    students_created = 0
    sql_statements = []

    for i in range(1, total_count + 1):
        s_uuid = f"stu-{uuid.uuid4().hex[:12]}"
        code = f"STU-2024-{i:03d}"
        
        # Canonical demo students alignment
        if i == 1:
            fname = "Aarav"
            lname = "Patel"
            email = "student@campus.edu"
            dept = "Computer Science & Engineering"
            avatar = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
            archetype = 0
        elif i == 3:
            fname = "Kabir"
            lname = "Verma"
            email = "atrisk.student@campus.edu"
            dept = "Data Science"
            avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
            archetype = 3
        else:
            fname = random.choice(FIRST_NAMES)
            lname = random.choice(LAST_NAMES)
            email = f"{fname.lower()}.{lname.lower()}{i}@campus.edu"
            dept = random.choice(DEPARTMENTS)
            avatar = random.choice(AVATARS)
            # Distribute into the 4 core archetypes
            archetype = i % 4

        sem = random.choice([4, 5, 6, 7])
        cohort = 2024
        mentor = random.choice(FACULTY_MENTORS)

        if archetype == 0:
            # Cluster 0: High Academic / Placement Ready (Top Tier)
            cgpa = round(random.uniform(8.4, 9.8), 2)
            backlogs = 0
            attendance_pct = round(random.uniform(84.0, 96.0), 1)
            assignment_pct = round(random.uniform(88.0, 99.0), 1)
            certs = random.choice([2, 3, 4, 5])
            coding = round(random.uniform(78.0, 96.0), 1)
            aptitude = round(random.uniform(80.0, 95.0), 1)
            mocks = random.choice([3, 4, 5])
            internship = random.choice(["Completed", "In-Progress"])
            tech_skills = random.randint(6, 11)

        elif archetype == 1:
            # Cluster 1: Unpolished Gems (High CGPA, Low Practical Skills)
            cgpa = round(random.uniform(8.1, 9.4), 2)
            backlogs = 0
            attendance_pct = round(random.uniform(85.0, 95.0), 1)
            assignment_pct = round(random.uniform(82.0, 94.0), 1)
            certs = random.choice([0, 1])
            coding = round(random.uniform(38.0, 58.0), 1)
            aptitude = round(random.uniform(62.0, 76.0), 1)
            mocks = random.choice([0, 1])
            internship = "None"
            tech_skills = random.randint(2, 4)

        elif archetype == 2:
            # Cluster 2: Disengaged Talents (Low Attendance, High Technical)
            cgpa = round(random.uniform(6.8, 7.8), 2)
            backlogs = random.choice([0, 1])
            attendance_pct = round(random.uniform(62.0, 73.5), 1)  # Below 75%
            assignment_pct = round(random.uniform(68.0, 79.0), 1)
            certs = random.choice([1, 2, 3])
            coding = round(random.uniform(76.0, 94.0), 1)
            aptitude = round(random.uniform(72.0, 88.0), 1)
            mocks = random.choice([1, 2])
            internship = random.choice(["Completed", "None"])
            tech_skills = random.randint(5, 9)

        else:
            # Cluster 3: Critical Academic Support Needed
            cgpa = round(random.uniform(4.8, 6.3), 2)
            backlogs = random.choice([2, 3, 4])
            attendance_pct = round(random.uniform(55.0, 72.0), 1)
            assignment_pct = round(random.uniform(50.0, 68.0), 1)
            certs = 0
            coding = round(random.uniform(32.0, 54.0), 1)
            aptitude = round(random.uniform(40.0, 58.0), 1)
            mocks = 0
            internship = "None"
            tech_skills = random.randint(1, 3)

        total_cls = 100
        attended_cls = int(round((attendance_pct / 100.0) * total_cls))
        internal_exam = round(min(100.0, max(40.0, cgpa * 9.5 + random.uniform(-4, 4))), 1)

        # 1. Scoring Engine
        metrics = scoring_engine.compute_all_metrics(
            cgpa=cgpa,
            backlogs=backlogs,
            attendance_pct=attendance_pct,
            attended_classes=attended_cls,
            total_classes=total_cls,
            assignment_completion_pct=assignment_pct,
            certifications_count=certs,
            coding_score=coding,
            aptitude_score=aptitude,
            mock_interviews_completed=mocks
        )

        # 2. Risk Inference & Clustering
        rdata = {
            "student_id": code,
            "cgpa": cgpa,
            "backlogs": backlogs,
            "internal_exam_avg": internal_exam,
            "attendance_pct": attendance_pct,
            "assignment_completion_pct": assignment_pct,
            "certifications_count": certs,
            "coding_score": coding,
            "aptitude_score": aptitude,
            "mock_interviews_completed": mocks,
            "technical_skills_count": tech_skills
        }
        risk_pred = ml_service.predict_risk(rdata)
        persona_pred = clustering_engine.segment_student(rdata)

        # Top driver determination
        top_driver = None
        if backlogs >= 2:
            top_driver = f"{backlogs} Active Backlogs"
        elif attendance_pct < 75.0:
            top_driver = f"Attendance Deficit ({attendance_pct:.1f}%)"
        elif coding < 60.0:
            top_driver = f"Coding Readiness Shortfall ({coding:.1f}%)"
        else:
            top_driver = f"Exemplary CGPA ({cgpa:.2f})"

        # Persist Student
        student = Student(
            id=s_uuid,
            student_id=code,
            first_name=fname,
            last_name=lname,
            email=email,
            department=dept,
            semester=sem,
            cohort_year=cohort,
            mentor_name=mentor,
            avatar_url=avatar,
            status="Active" if risk_pred["overall_risk_tier"] != "High" else "At-Risk"
        )
        db.add(student)

        # Persist Academic Indicator
        acad = AcademicIndicator(
            id=f"acad-{s_uuid}",
            student_id=s_uuid,
            cgpa=cgpa,
            backlogs=backlogs,
            internal_exam_avg=internal_exam,
            attendance_pct=attendance_pct,
            attended_classes=attended_cls,
            total_classes=total_cls,
            assignment_completion_pct=assignment_pct,
            certifications_count=certs,
            lab_performance_score=round(random.uniform(65, 95), 1)
        )
        db.add(acad)

        # Persist Placement Indicator
        place = PlacementIndicator(
            id=f"place-{s_uuid}",
            student_id=s_uuid,
            coding_score=coding,
            aptitude_score=aptitude,
            mock_interviews_completed=mocks,
            technical_skills_count=tech_skills,
            soft_skills_rating=round(random.uniform(2.8, 4.8), 1),
            internship_status=internship,
            projects_count=random.randint(1, 4)
        )
        db.add(place)

        # Persist Score
        score = StudentScore(
            id=f"score-{s_uuid}",
            student_id=s_uuid,
            academic_index=metrics["academic_index"],
            engagement_index=metrics["engagement_index"],
            placement_index=metrics["placement_index"],
            success_score=metrics["success_score"],
            attendance_margin=metrics["attendance_margin"],
            percentile_rank=round(100.0 - (i / total_count * 100.0), 1)
        )
        db.add(score)

        # Persist Risk Assessment
        risk = RiskAssessment(
            id=f"risk-{s_uuid}",
            student_id=s_uuid,
            academic_risk_level=risk_pred["academic_risk_level"],
            academic_risk_prob=risk_pred["academic_risk_prob"],
            placement_risk_level=risk_pred["placement_risk_level"],
            placement_risk_prob=risk_pred["placement_risk_prob"],
            overall_risk_tier=risk_pred["overall_risk_tier"],
            persona_cluster=persona_pred["cluster"],
            persona_label=persona_pred["label"],
            top_risk_driver=top_driver
        )
        db.add(risk)

        # Create realistic interventions for High & Medium risk students
        if risk_pred["overall_risk_tier"] == "High":
            int_type = "Remedial Tutoring" if backlogs >= 2 else "Attendance Counseling"
            iv = Intervention(
                id=f"int-{uuid.uuid4().hex[:8]}",
                student_id=s_uuid,
                type=int_type,
                priority="High",
                status="Active" if random.random() > 0.4 else "Proposed",
                assigned_to=mentor,
                reason=f"Flagged for urgent intervention due to {top_driver}.",
                recommended_action="Execute 4-week recovery protocol with mentor sign-off."
            )
            db.add(iv)
        elif persona_pred["cluster"] == 1:
            iv = Intervention(
                id=f"int-{uuid.uuid4().hex[:8]}",
                student_id=s_uuid,
                type="Coding Bootcamp",
                priority="Medium",
                status="Proposed",
                assigned_to="Career & Placement Cell",
                reason="High academic aptitude but lacks hands-on coding proficiency.",
                recommended_action="Enroll in Algorithmic Problem Solving Bootcamp."
            )
            db.add(iv)

        students_created += 1

    db.commit()
    db.close()
    print(f"[SeedGenerator] Successfully generated {students_created} complete student records.")

if __name__ == "__main__":
    generate_seeds(75)
