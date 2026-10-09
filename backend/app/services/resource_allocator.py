from typing import Dict, Any, List
from app.schemas.common import InterventionType, InterventionPriority
from app.schemas.intervention import PrescriptiveRecommendationDTO

class ResourceAllocator:
    """
    Prescriptive Intervention Matrix Engine.
    Analyzes student vulnerability profiles, XAI drivers, and persona archetypes
    to prescribe high-impact, closed-loop institutional interventions with projected score gains.
    """

    def prescribe_interventions(self, student_data: Dict[str, Any]) -> List[PrescriptiveRecommendationDTO]:
        recommendations: List[PrescriptiveRecommendationDTO] = []

        cgpa = float(student_data.get("cgpa", 7.0))
        backlogs = int(student_data.get("backlogs", 0))
        attendance = float(student_data.get("attendance_pct", 80.0))
        margin = int(student_data.get("attendance_margin", 0))
        coding = float(student_data.get("coding_score", 65.0))
        mocks = int(student_data.get("mock_interviews_completed", 1))
        acad_tier = student_data.get("academic_risk_level", "Low")
        place_tier = student_data.get("placement_risk_level", "Low")
        persona_cluster = int(student_data.get("persona_cluster", 0))

        # 1. Critical Remedial Tutoring (Academic Distress)
        if backlogs >= 1 or acad_tier == "High" or cgpa < 6.0:
            prio = InterventionPriority.HIGH if (backlogs >= 2 or cgpa < 5.8) else InterventionPriority.MEDIUM
            recommendations.append(PrescriptiveRecommendationDTO(
                intervention_type=InterventionType.REMEDIAL_TUTORING,
                priority=prio,
                confidence_score=0.94,
                trigger_driver=f"{backlogs} Backlog(s) / CGPA {cgpa:.2f}",
                rationale="Academic index is depressed below institutional safe boundaries. Subject mastery gap requires targeted tutorial assistance.",
                action_plan="Enroll in 6-week faculty-led remedial tutorials with bi-weekly mock unit tests.",
                projected_success_gain=14.5
            ))

        # 2. Statutory Attendance Counseling (Deficit Margin)
        if margin < 0 or attendance < 75.0:
            recommendations.append(PrescriptiveRecommendationDTO(
                intervention_type=InterventionType.ATTENDANCE_COUNSELING,
                priority=InterventionPriority.HIGH,
                confidence_score=0.98,
                trigger_driver=f"Attendance Margin ({margin} classes) / {attendance:.1f}%",
                rationale="Student is in immediate danger of statutory exam debarment. Proactive advisory meeting required.",
                action_plan="Schedule mandatory counseling session, execute biometric attendance recovery agreement.",
                projected_success_gain=12.0
            ))

        # 3. Intensive Coding Bootcamp (Practical Skill Deficit or Unpolished Gem)
        if coding < 65.0 or persona_cluster == 1:
            prio = InterventionPriority.HIGH if (coding < 55.0 or place_tier == "High") else InterventionPriority.MEDIUM
            recommendations.append(PrescriptiveRecommendationDTO(
                intervention_type=InterventionType.CODING_BOOTCAMP,
                priority=prio,
                confidence_score=0.91,
                trigger_driver=f"Coding Assessment Score ({coding:.1f}%)",
                rationale="Theoretical grades are intact but technical coding benchmark fails corporate recruiter filters.",
                action_plan="Register in 4-week algorithmic bootcamp focusing on DSA, live problem sets, and LeetCode sprints.",
                projected_success_gain=15.0
            ))

        # 4. Placement Mentorship (Mock Interviews & Industry Polish)
        if mocks < 2 or place_tier == "Medium" or place_tier == "High":
            recommendations.append(PrescriptiveRecommendationDTO(
                intervention_type=InterventionType.PLACEMENT_MENTORSHIP,
                priority=InterventionPriority.MEDIUM,
                confidence_score=0.86,
                trigger_driver=f"Completed {mocks} Mock Interview(s)",
                rationale="Interview readiness gap exposes candidate to early-round elimination in campus placements.",
                action_plan="Assign alumni corporate mentor for resume teardown and 2 simulated technical rounds.",
                projected_success_gain=9.5
            ))

        # 5. Peer Study Group (General Enhancement)
        if not recommendations:
            recommendations.append(PrescriptiveRecommendationDTO(
                intervention_type=InterventionType.PEER_STUDY_GROUP,
                priority=InterventionPriority.LOW,
                confidence_score=0.75,
                trigger_driver="Consistent Track Record",
                rationale="Student is thriving. Directing leadership towards peer study groups solidifies expertise and soft skills.",
                action_plan="Invite student to lead departmental study group in advanced electives.",
                projected_success_gain=4.0
            ))

        return recommendations

resource_allocator = ResourceAllocator()
