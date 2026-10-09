from typing import Dict, Any, List
from app.services.scoring_engine import scoring_engine
from app.services.ml_service import ml_service
from app.services.clustering_engine import clustering_engine

class SimulationEngine:
    """
    Real-Time Digital Twin Trajectory Simulation Engine.
    Enables What-If parameter exploration with sub-50ms deterministic recalculation,
    risk migration tracking, and sensitivity-based ROI recommendations.
    """

    def simulate(self, data: Dict[str, Any], baseline_override: Dict[str, Any] = None) -> Dict[str, Any]:
        sim_cgpa = float(data.get("cgpa", 7.0))
        sim_backlogs = int(data.get("backlogs", 0))
        sim_attendance = float(data.get("attendance_pct", 80.0))
        sim_assignment = float(data.get("assignment_completion_pct", 80.0))
        sim_certs = int(data.get("certifications_count", 1))
        sim_coding = float(data.get("coding_score", 65.0))
        sim_aptitude = float(data.get("aptitude_score", 65.0))
        sim_mocks = int(data.get("mock_interviews_completed", 1))

        # Attended & total classes for margin
        raw_total = data.get("total_classes")
        total_cls = int(raw_total) if raw_total is not None else 100

        raw_attended = data.get("attended_classes")
        sim_attended = int(raw_attended) if raw_attended is not None else int(round(sim_attendance * total_cls / 100))

        # 1. Compute Simulated State
        sim_scores = scoring_engine.compute_all_metrics(
            cgpa=sim_cgpa,
            backlogs=sim_backlogs,
            attendance_pct=sim_attendance,
            attended_classes=sim_attended,
            total_classes=total_cls,
            assignment_completion_pct=sim_assignment,
            certifications_count=sim_certs,
            coding_score=sim_coding,
            aptitude_score=sim_aptitude,
            mock_interviews_completed=sim_mocks
        )
        sim_risk = ml_service.predict_risk({
            "cgpa": sim_cgpa,
            "backlogs": sim_backlogs,
            "attendance_pct": sim_attendance,
            "assignment_completion_pct": sim_assignment,
            "certifications_count": sim_certs,
            "coding_score": sim_coding,
            "aptitude_score": sim_aptitude,
            "mock_interviews_completed": sim_mocks
        })
        sim_persona = clustering_engine.segment_student({
            "cgpa": sim_cgpa,
            "backlogs": sim_backlogs,
            "attendance_pct": sim_attendance,
            "coding_score": sim_coding,
            "assignment_completion_pct": sim_assignment
        })

        # 2. Compute or Use Baseline
        if baseline_override is not None:
            base_acad = baseline_override.get("academic_index", sim_scores["academic_index"])
            base_eng = baseline_override.get("engagement_index", sim_scores["engagement_index"])
            base_place = baseline_override.get("placement_index", sim_scores["placement_index"])
            base_success = baseline_override.get("success_score", sim_scores["success_score"])
            base_margin = baseline_override.get("attendance_margin", sim_scores["attendance_margin"])
            base_risk_tier = baseline_override.get("overall_risk_tier", sim_risk["overall_risk_tier"])
            base_cluster = baseline_override.get("persona_cluster", sim_persona["cluster"])
            base_persona_label = baseline_override.get("persona_label", sim_persona["label"])
        else:
            base_acad = sim_scores["academic_index"]
            base_eng = sim_scores["engagement_index"]
            base_place = sim_scores["placement_index"]
            base_success = sim_scores["success_score"]
            base_margin = sim_scores["attendance_margin"]
            base_risk_tier = sim_risk["overall_risk_tier"]
            base_cluster = sim_persona["cluster"]
            base_persona_label = sim_persona["label"]

        # 3. Deltas
        delta_success = round(sim_scores["success_score"] - base_success, 2)
        delta_acad = round(sim_scores["academic_index"] - base_acad, 2)
        delta_eng = round(sim_scores["engagement_index"] - base_eng, 2)
        delta_place = round(sim_scores["placement_index"] - base_place, 2)
        delta_margin = sim_scores["attendance_margin"] - base_margin
        risk_changed = (sim_risk["overall_risk_tier"] != base_risk_tier)
        risk_migration = f"{base_risk_tier} → {sim_risk['overall_risk_tier']}"

        # 4. Generate Strategic Recommendations
        recommendations = self._generate_recommendations(
            sim_cgpa, sim_backlogs, sim_attendance, sim_coding, sim_mocks, sim_certs, delta_success
        )
        fastest_path = self._generate_fastest_path(
            sim_cgpa, sim_backlogs, sim_attendance, sim_coding, sim_risk["overall_risk_tier"]
        )

        return {
            "baseline": {
                "academic_index": base_acad,
                "engagement_index": base_eng,
                "placement_index": base_place,
                "success_score": base_success,
                "attendance_margin": base_margin,
                "risk_tier": base_risk_tier,
                "persona_cluster": base_cluster,
                "persona_label": base_persona_label
            },
            "simulated": {
                "academic_index": sim_scores["academic_index"],
                "engagement_index": sim_scores["engagement_index"],
                "placement_index": sim_scores["placement_index"],
                "success_score": sim_scores["success_score"],
                "attendance_margin": sim_scores["attendance_margin"],
                "risk_tier": sim_risk["overall_risk_tier"],
                "persona_cluster": sim_persona["cluster"],
                "persona_label": sim_persona["label"]
            },
            "deltas": {
                "success_score_delta": delta_success,
                "academic_index_delta": delta_acad,
                "engagement_index_delta": delta_eng,
                "placement_index_delta": delta_place,
                "margin_delta": delta_margin,
                "risk_status_changed": risk_changed,
                "risk_migration": risk_migration
            },
            "recommendations": recommendations,
            "fastest_path_to_low_risk": fastest_path
        }

    def _generate_recommendations(
        self,
        cgpa: float,
        backlogs: int,
        attendance: float,
        coding: float,
        mocks: int,
        certs: int,
        delta: float
    ) -> List[str]:
        recs = []
        if backlogs > 0:
            recs.append(f"Clearing {backlogs} backlog(s) yields up to +{backlogs * 6.0:.1f} net points on Academic Index.")
        if attendance < 75.0:
            deficit = 75.0 - attendance
            recs.append(f"Recovering {deficit:.1f}% attendance prevents statutory debarment and unlocks +{deficit * 0.12:.1f} Engagement points.")
        if coding < 75.0:
            recs.append("Advancing coding score above 75 unlocks tier-1 corporate recruitment shortlisting.")
        if mocks < 3:
            recs.append(f"Completing {3 - mocks} more mock interview(s) will boost Placement Index by +{(3 - mocks) * 6.0:.1f} points.")
        if not recs:
            recs.append("Trajectory is exceptionally optimized! Recommend applying for prestigious honors and leadership tracks.")
        return recs

    def _generate_fastest_path(
        self,
        cgpa: float,
        backlogs: int,
        attendance: float,
        coding: float,
        tier: str
    ) -> List[str]:
        if tier == "Low":
            return ["Currently maintaining Low Risk profile. Sustain existing attendance and problem-solving cadence."]

        steps = []
        if backlogs > 0:
            steps.append(f"Step 1: Priority remedial enrollment to clear active {backlogs} backlog(s).")
        if attendance < 75.0:
            steps.append("Step 2: Attend all scheduled lectures for the next 3 weeks without unauthorized absences.")
        if coding < 65.0:
            steps.append("Step 3: Complete daily problem-solving modules to lift coding score past 65%.")
        if cgpa < 7.0:
            steps.append("Step 4: Target internal test scores of 80%+ to pull CGPA trajectory towards 7.0.")
        if not steps:
            steps.append("Step 1: Consolidate placement readiness by targeting 80+ in mock technical evaluations to solidify Low Risk standing.")
        return steps

simulation_engine = SimulationEngine()
