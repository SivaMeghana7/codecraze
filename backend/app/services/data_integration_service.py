import io
import csv
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.student import Student
from app.models.indicators import AcademicIndicator, PlacementIndicator
from app.models.score import StudentScore, RiskAssessment
from app.services.scoring_engine import scoring_engine
from app.services.ml_service import ml_service
from app.services.clustering_engine import clustering_engine
from app.schemas.admin import CsvImportResultDTO, CsvImportRowErrorDTO

COLUMN_ALIASES = {
    "student_id": ["student_id", "studentid", "student id", "roll_no", "roll_number", "id", "usn"],
    "first_name": ["first_name", "firstname", "first name", "first"],
    "last_name": ["last_name", "lastname", "last name", "last", "surname"],
    "full_name": ["full_name", "name", "student_name", "student name"],
    "email": ["email", "email_id", "mail", "student_email"],
    "department": ["department", "dept", "branch", "program"],
    "semester": ["semester", "sem", "current_semester"],
    "cohort_year": ["cohort_year", "cohort", "batch", "year", "admission_year"],
    "mentor_name": ["mentor_name", "mentor", "advisor", "faculty_advisor"],
    "cgpa": ["cgpa", "gpa", "cumulative_gpa"],
    "backlogs": ["backlogs", "active_backlogs", "arrears", "standing_backlogs"],
    "internal_exam_avg": ["internal_exam_avg", "internal_exam", "internal_score", "cie", "midterm_avg"],
    "attendance_pct": ["attendance_pct", "attendance", "attendance_percentage", "attendance_rate"],
    "attended_classes": ["attended_classes", "attended", "classes_attended"],
    "total_classes": ["total_classes", "total", "classes_total", "total_lectures"],
    "assignment_completion_pct": ["assignment_completion_pct", "assignment_completion", "assignments", "lms_completion"],
    "certifications_count": ["certifications_count", "certifications", "certs", "industry_certs"],
    "coding_score": ["coding_score", "coding", "dsa_score", "programming_score"],
    "aptitude_score": ["aptitude_score", "aptitude", "quant_score", "reasoning_score"],
    "mock_interviews_completed": ["mock_interviews_completed", "mock_interviews", "mocks"],
    "technical_skills_count": ["technical_skills_count", "skills_count", "tech_skills"],
    "soft_skills_rating": ["soft_skills_rating", "soft_skills", "communication_rating"],
    "internship_status": ["internship_status", "internship", "intern_status"],
    "projects_count": ["projects_count", "projects", "academic_projects"]
}

class DataIntegrationService:
    """
    Enterprise Data Ingestion & ETL Pipeline.
    Supports CSV imports, schema validation, missing-value imputation,
    duplicate identification, upserts, and synchronous recalculations.
    """

    @classmethod
    def _normalize_header(cls, header: str) -> str:
        clean = header.strip().lower().replace("-", "_").replace(" ", "_")
        for canon, aliases in COLUMN_ALIASES.items():
            if clean == canon or clean in aliases:
                return canon
        return clean

    @classmethod
    def parse_and_import_csv(cls, file_content: str, db: Session) -> CsvImportResultDTO:
        # Strip potential BOM (Byte Order Mark)
        cleaned_content = file_content.lstrip("\ufeff").strip()
        if not cleaned_content:
            return CsvImportResultDTO(
                total_rows=0,
                imported_count=0,
                updated_count=0,
                failed_count=0,
                errors=[CsvImportRowErrorDTO(row_number=1, reason="CSV file is completely empty.")],
                message="Import failed: File is empty."
            )

        f = io.StringIO(cleaned_content)
        reader = csv.reader(f)
        try:
            raw_headers = next(reader)
        except StopIteration:
            return CsvImportResultDTO(
                total_rows=0,
                imported_count=0,
                updated_count=0,
                failed_count=0,
                errors=[CsvImportRowErrorDTO(row_number=1, reason="Missing header row.")],
                message="Import failed: No headers found."
            )

        headers = [cls._normalize_header(h) for h in raw_headers]
        
        imported = 0
        updated = 0
        errors: List[CsvImportRowErrorDTO] = []
        row_idx = 1  # 1-based data row counter (row 1 is data, row 0 was headers)

        for raw_row in reader:
            row_idx += 1
            if not raw_row or all(cell.strip() == "" for cell in raw_row):
                continue  # skip blank lines

            row_dict = {}
            for h_idx, col_name in enumerate(headers):
                if h_idx < len(raw_row):
                    val = raw_row[h_idx].strip()
                    row_dict[col_name] = val if val != "" else None

            # Student ID extraction
            student_id = row_dict.get("student_id")
            if not student_id:
                errors.append(CsvImportRowErrorDTO(
                    row_number=row_idx,
                    student_id=None,
                    reason="Missing required student identifier (student_id)."
                ))
                continue

            student_id = str(student_id).strip().upper()

            # Name extraction
            first_name = row_dict.get("first_name")
            last_name = row_dict.get("last_name")
            if not first_name:
                full_name = row_dict.get("full_name")
                if full_name:
                    parts = full_name.split(" ", 1)
                    first_name = parts[0]
                    last_name = parts[1] if len(parts) > 1 else ""
                else:
                    first_name = "Student"
                    last_name = student_id
            if not last_name:
                last_name = ""

            email = row_dict.get("email") or f"{student_id.lower().replace('-', '_')}@campus.edu"
            dept = row_dict.get("department") or "Computer Science & Engineering"
            
            try:
                sem = int(float(row_dict.get("semester", 6)))
                sem = min(8, max(1, sem))
            except Exception:
                sem = 6

            try:
                cohort = int(float(row_dict.get("cohort_year", 2024)))
            except Exception:
                cohort = 2024

            mentor = row_dict.get("mentor_name") or "Faculty Advisor"

            # Academic Indicators parsing & missing-value imputation
            try:
                cgpa = float(row_dict.get("cgpa", 6.8))
                cgpa = min(10.0, max(0.0, cgpa))
            except Exception:
                cgpa = 6.8

            try:
                backlogs = int(float(row_dict.get("backlogs", 0)))
                backlogs = max(0, backlogs)
            except Exception:
                backlogs = 0

            try:
                total_classes = int(float(row_dict.get("total_classes", 100)))
                total_classes = max(1, total_classes)
            except Exception:
                total_classes = 100

            try:
                if row_dict.get("attendance_pct") is not None:
                    att_pct = float(row_dict["attendance_pct"])
                elif row_dict.get("attended_classes") is not None:
                    att_pct = (float(row_dict["attended_classes"]) / total_classes) * 100.0
                else:
                    att_pct = 78.0
                att_pct = min(100.0, max(0.0, att_pct))
            except Exception:
                att_pct = 78.0

            try:
                if row_dict.get("attended_classes") is not None:
                    attended_classes = int(float(row_dict["attended_classes"]))
                else:
                    attended_classes = int(round((att_pct / 100.0) * total_classes))
                attended_classes = min(total_classes, max(0, attended_classes))
            except Exception:
                attended_classes = int(round((att_pct / 100.0) * total_classes))

            try:
                internal_exam = float(row_dict.get("internal_exam_avg", min(100.0, max(40.0, cgpa * 9.5))))
                internal_exam = min(100.0, max(0.0, internal_exam))
            except Exception:
                internal_exam = min(100.0, max(40.0, cgpa * 9.5))

            try:
                assign_pct = float(row_dict.get("assignment_completion_pct", min(100.0, max(50.0, att_pct * 0.95))))
                assign_pct = min(100.0, max(0.0, assign_pct))
            except Exception:
                assign_pct = 78.0

            try:
                certs = int(float(row_dict.get("certifications_count", 1)))
                certs = max(0, certs)
            except Exception:
                certs = 1

            # Placement Indicators parsing
            try:
                coding = float(row_dict.get("coding_score", 65.0))
                coding = min(100.0, max(0.0, coding))
            except Exception:
                coding = 65.0

            try:
                aptitude = float(row_dict.get("aptitude_score", 65.0))
                aptitude = min(100.0, max(0.0, aptitude))
            except Exception:
                aptitude = 65.0

            try:
                mocks = int(float(row_dict.get("mock_interviews_completed", 1)))
                mocks = max(0, mocks)
            except Exception:
                mocks = 1

            try:
                tech_skills = int(float(row_dict.get("technical_skills_count", 4)))
                tech_skills = max(0, tech_skills)
            except Exception:
                tech_skills = 4

            try:
                soft_skills = float(row_dict.get("soft_skills_rating", 3.8))
                soft_skills = min(5.0, max(1.0, soft_skills))
            except Exception:
                soft_skills = 3.8

            internship = row_dict.get("internship_status") or "None"
            try:
                projects = int(float(row_dict.get("projects_count", 1)))
            except Exception:
                projects = 1

            # 1. Scoring Engine Computations
            metrics = scoring_engine.compute_all_metrics(
                cgpa=cgpa,
                backlogs=backlogs,
                attendance_pct=att_pct,
                attended_classes=attended_classes,
                total_classes=total_classes,
                assignment_completion_pct=assign_pct,
                certifications_count=certs,
                coding_score=coding,
                aptitude_score=aptitude,
                mock_interviews_completed=mocks
            )

            # 2. Risk Inference & Clustering
            rdata = {
                "student_id": student_id,
                "cgpa": cgpa,
                "backlogs": backlogs,
                "internal_exam_avg": internal_exam,
                "attendance_pct": att_pct,
                "assignment_completion_pct": assign_pct,
                "certifications_count": certs,
                "coding_score": coding,
                "aptitude_score": aptitude,
                "mock_interviews_completed": mocks,
                "technical_skills_count": tech_skills
            }
            risk_pred = ml_service.predict_risk(rdata)
            persona_pred = clustering_engine.segment_student(rdata)

            # Top driver determination
            if backlogs >= 2:
                top_driver = f"{backlogs} Active Backlogs"
            elif att_pct < 75.0:
                top_driver = f"Attendance Deficit ({att_pct:.1f}%)"
            elif coding < 60.0:
                top_driver = f"Coding Readiness Shortfall ({coding:.1f}%)"
            else:
                top_driver = f"Strong Academic Foundation ({cgpa:.2f} CGPA)"

            # Check if student already exists in Database (ID matching / upsert)
            existing_stu = db.query(Student).filter(
                (Student.student_id == student_id) | (Student.email == email)
            ).first()

            if existing_stu:
                # Update existing student
                existing_stu.first_name = first_name
                existing_stu.last_name = last_name
                existing_stu.email = email
                existing_stu.department = dept
                existing_stu.semester = sem
                existing_stu.cohort_year = cohort
                existing_stu.mentor_name = mentor
                existing_stu.status = "Active" if risk_pred["overall_risk_tier"] != "High" else "At-Risk"
                existing_stu.updated_at = datetime.now(timezone.utc)

                # Update indicators
                if existing_stu.academic_indicator:
                    ai = existing_stu.academic_indicator
                    ai.cgpa = cgpa
                    ai.backlogs = backlogs
                    ai.internal_exam_avg = internal_exam
                    ai.attendance_pct = att_pct
                    ai.attended_classes = attended_classes
                    ai.total_classes = total_classes
                    ai.assignment_completion_pct = assign_pct
                    ai.certifications_count = certs
                else:
                    db.add(AcademicIndicator(
                        id=f"acad-{existing_stu.id}",
                        student_id=existing_stu.id,
                        cgpa=cgpa,
                        backlogs=backlogs,
                        internal_exam_avg=internal_exam,
                        attendance_pct=att_pct,
                        attended_classes=attended_classes,
                        total_classes=total_classes,
                        assignment_completion_pct=assign_pct,
                        certifications_count=certs
                    ))

                if existing_stu.placement_indicator:
                    pi = existing_stu.placement_indicator
                    pi.coding_score = coding
                    pi.aptitude_score = aptitude
                    pi.mock_interviews_completed = mocks
                    pi.technical_skills_count = tech_skills
                    pi.soft_skills_rating = soft_skills
                    pi.internship_status = internship
                    pi.projects_count = projects
                else:
                    db.add(PlacementIndicator(
                        id=f"place-{existing_stu.id}",
                        student_id=existing_stu.id,
                        coding_score=coding,
                        aptitude_score=aptitude,
                        mock_interviews_completed=mocks,
                        technical_skills_count=tech_skills,
                        soft_skills_rating=soft_skills,
                        internship_status=internship,
                        projects_count=projects
                    ))

                if existing_stu.score:
                    sc = existing_stu.score
                    sc.academic_index = metrics["academic_index"]
                    sc.engagement_index = metrics["engagement_index"]
                    sc.placement_index = metrics["placement_index"]
                    sc.success_score = metrics["success_score"]
                    sc.attendance_margin = metrics["attendance_margin"]
                    sc.last_calculated_at = datetime.now(timezone.utc)
                else:
                    db.add(StudentScore(
                        id=f"score-{existing_stu.id}",
                        student_id=existing_stu.id,
                        academic_index=metrics["academic_index"],
                        engagement_index=metrics["engagement_index"],
                        placement_index=metrics["placement_index"],
                        success_score=metrics["success_score"],
                        attendance_margin=metrics["attendance_margin"]
                    ))

                if existing_stu.risk_assessment:
                    ra = existing_stu.risk_assessment
                    ra.academic_risk_level = risk_pred["academic_risk_level"]
                    ra.academic_risk_prob = risk_pred["academic_risk_prob"]
                    ra.placement_risk_level = risk_pred["placement_risk_level"]
                    ra.placement_risk_prob = risk_pred["placement_risk_prob"]
                    ra.overall_risk_tier = risk_pred["overall_risk_tier"]
                    ra.persona_cluster = persona_pred["cluster"]
                    ra.persona_label = persona_pred["label"]
                    ra.top_risk_driver = top_driver
                    ra.calculated_at = datetime.now(timezone.utc)
                else:
                    db.add(RiskAssessment(
                        id=f"risk-{existing_stu.id}",
                        student_id=existing_stu.id,
                        academic_risk_level=risk_pred["academic_risk_level"],
                        academic_risk_prob=risk_pred["academic_risk_prob"],
                        placement_risk_level=risk_pred["placement_risk_level"],
                        placement_risk_prob=risk_pred["placement_risk_prob"],
                        overall_risk_tier=risk_pred["overall_risk_tier"],
                        persona_cluster=persona_pred["cluster"],
                        persona_label=persona_pred["label"],
                        top_risk_driver=top_driver
                    ))

                updated += 1

            else:
                # Insert brand-new student
                s_uuid = f"stu-{uuid.uuid4().hex[:12]}"
                new_student = Student(
                    id=s_uuid,
                    student_id=student_id,
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    department=dept,
                    semester=sem,
                    cohort_year=cohort,
                    mentor_name=mentor,
                    avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={first_name}+{last_name}",
                    status="Active" if risk_pred["overall_risk_tier"] != "High" else "At-Risk"
                )
                db.add(new_student)

                db.add(AcademicIndicator(
                    id=f"acad-{s_uuid}",
                    student_id=s_uuid,
                    cgpa=cgpa,
                    backlogs=backlogs,
                    internal_exam_avg=internal_exam,
                    attendance_pct=att_pct,
                    attended_classes=attended_classes,
                    total_classes=total_classes,
                    assignment_completion_pct=assign_pct,
                    certifications_count=certs
                ))

                db.add(PlacementIndicator(
                    id=f"place-{s_uuid}",
                    student_id=s_uuid,
                    coding_score=coding,
                    aptitude_score=aptitude,
                    mock_interviews_completed=mocks,
                    technical_skills_count=tech_skills,
                    soft_skills_rating=soft_skills,
                    internship_status=internship,
                    projects_count=projects
                ))

                db.add(StudentScore(
                    id=f"score-{s_uuid}",
                    student_id=s_uuid,
                    academic_index=metrics["academic_index"],
                    engagement_index=metrics["engagement_index"],
                    placement_index=metrics["placement_index"],
                    success_score=metrics["success_score"],
                    attendance_margin=metrics["attendance_margin"]
                ))

                db.add(RiskAssessment(
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
                ))

                imported += 1

        try:
            db.commit()
        except Exception as e:
            db.rollback()
            return CsvImportResultDTO(
                total_rows=row_idx - 1,
                imported_count=0,
                updated_count=0,
                failed_count=row_idx - 1,
                errors=[CsvImportRowErrorDTO(row_number=0, reason=f"Database commit error: {str(e)}")],
                message=f"Transaction rolled back: {str(e)}"
            )

        total_processed = imported + updated
        return CsvImportResultDTO(
            total_rows=row_idx - 1,
            imported_count=imported,
            updated_count=updated,
            failed_count=len(errors),
            errors=errors,
            message=f"Import complete: {imported} student records created, {updated} updated, {len(errors)} errors."
        )

    @classmethod
    def generate_sample_csv(cls) -> str:
        """Returns standard CSV template with 5 representative sample student rows."""
        headers = [
            "student_id", "first_name", "last_name", "email", "department", "semester",
            "cohort_year", "mentor_name", "cgpa", "backlogs", "attendance_pct",
            "attended_classes", "total_classes", "assignment_completion_pct",
            "certifications_count", "coding_score", "aptitude_score",
            "mock_interviews_completed", "technical_skills_count", "soft_skills_rating",
            "internship_status", "projects_count"
        ]
        sample_rows = [
            ["STU-2024-101", "Rohan", "Mehta", "rohan.mehta@campus.edu", "Computer Science & Engineering", 6, 2024, "Prof. Ananya Sen", 9.15, 0, 92.5, 93, 100, 95.0, 3, 88.0, 85.0, 4, 8, 4.5, "Completed", 3],
            ["STU-2024-102", "Pooja", "Nair", "pooja.nair@campus.edu", "Artificial Intelligence & Machine Learning", 6, 2024, "Dr. Rameshwar Sharma", 7.85, 0, 88.0, 88, 100, 84.0, 1, 48.0, 68.0, 1, 3, 3.8, "None", 2],
            ["STU-2024-103", "Vikram", "Chauhan", "vikram.chauhan@campus.edu", "Data Science", 6, 2024, "Dr. Rameshwar Sharma", 7.40, 1, 64.0, 64, 100, 72.0, 2, 84.0, 82.0, 2, 7, 3.5, "Completed", 3],
            ["STU-2024-104", "Simran", "Kaur", "simran.kaur@campus.edu", "Information Technology", 6, 2024, "Prof. Ananya Sen", 5.60, 3, 58.0, 58, 100, 52.0, 0, 42.0, 46.0, 0, 2, 3.0, "None", 1],
            ["STU-2024-105", "Aditya", "Joshi", "aditya.joshi@campus.edu", "Computer Science & Engineering", 6, 2024, "Prof. Ananya Sen", 8.20, 0, 81.0, 81, 100, 82.0, 2, 74.0, 78.0, 2, 5, 4.0, "None", 2]
        ]
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(headers)
        writer.writerows(sample_rows)
        return output.getvalue()

data_integration_service = DataIntegrationService()
