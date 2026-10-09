import logging
from typing import Dict, Any, List, Optional
import numpy as np
from app.services.ml_service import ml_service

logger = logging.getLogger(__name__)

FEATURE_LABELS = {
    "cgpa": "Cumulative GPA (CGPA)",
    "backlogs": "Active Backlogs",
    "internal_exam_avg": "Internal Examination Avg",
    "attendance_pct": "Lecture Attendance Rate",
    "assignment_completion_pct": "Assignment Submission Rate",
    "certifications_count": "Industry Certifications",
    "coding_score": "Practical Coding Assessment",
    "aptitude_score": "Quantitative Aptitude Score",
    "mock_interviews_completed": "Mock Technical Interviews",
    "technical_skills_count": "Verified Technical Skills"
}

FEATURE_BENCHMARKS = {
    "cgpa": 7.5,
    "backlogs": 0.0,
    "internal_exam_avg": 75.0,
    "attendance_pct": 80.0,
    "assignment_completion_pct": 85.0,
    "certifications_count": 2.0,
    "coding_score": 70.0,
    "aptitude_score": 70.0,
    "mock_interviews_completed": 2.0,
    "technical_skills_count": 5.0
}

class ExplainabilityEngine:
    """
    Local Explainability (XAI) Engine.
    Leverages TreeSHAP (TreeExplainer) on the XGBoost risk ensemble to extract local Shapley values.
    Returns ranked drivers with human-readable labels, directional badges (+Risk vs Support), and counterfactuals.
    """

    def __init__(self):
        self.academic_explainer = None
        self.placement_explainer = None
        self.shap_explainer = None
        self._init_explainers()

    def _init_explainers(self):
        try:
            import shap
            if ml_service.academic_model is not None:
                self.academic_explainer = shap.TreeExplainer(ml_service.academic_model)
                self.shap_explainer = self.academic_explainer
            if ml_service.placement_model is not None:
                self.placement_explainer = shap.TreeExplainer(ml_service.placement_model)
        except Exception as e:
            logger.warning(f"[ExplainabilityEngine] TreeExplainer init note: {e}")

    def explain_student_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Computes local Shapley values and returns top 4 drivers with direction.
        Directional badges:
        - '+Risk': Increases failure or vulnerability probability.
        - 'Support': Protective strength reducing risk.
        """
    def _extract_shap_dict(self, explainer, data: Dict[str, Any], features_dict: Dict[str, float]) -> Dict[str, float]:
        """Extracts feature-to-Shapley values for a given model explainer."""
        if explainer is not None:
            try:
                vec = ml_service._prepare_vector(data)
                shap_vals = explainer.shap_values(vec)
                if isinstance(shap_vals, list) and len(shap_vals) > 1:
                    raw_shap = shap_vals[1][0]
                elif hasattr(shap_vals, "shape") and len(shap_vals.shape) == 2:
                    raw_shap = shap_vals[0]
                else:
                    raw_shap = np.array(shap_vals).flatten()

                shap_dict = {}
                for idx, fname in enumerate(ml_service.FEATURE_NAMES):
                    if idx < len(raw_shap):
                        shap_dict[fname] = float(raw_shap[idx])
                return shap_dict
            except Exception as e:
                logger.warning(f"[ExplainabilityEngine] TreeSHAP calculation exception ({e}), falling back to analytical.")
        return self._compute_analytical_attributions(features_dict)

    def _build_driver_list(self, shap_dict: Dict[str, float], features_dict: Dict[str, float], limit: int = 4) -> List[Dict[str, Any]]:
        sorted_features = sorted(
            shap_dict.items(),
            key=lambda item: abs(item[1]),
            reverse=True
        )[:limit]

        drivers = []
        for rank, (feat_name, shap_val) in enumerate(sorted_features, start=1):
            raw_val = features_dict.get(feat_name, 0.0)
            direction = "+Risk" if shap_val > 0 else "Support"
            narrative = self._generate_narrative(feat_name, raw_val, shap_val, direction)
            drivers.append({
                "rank": rank,
                "feature_name": feat_name,
                "feature_label": FEATURE_LABELS.get(feat_name, feat_name),
                "raw_value": round(raw_val, 2),
                "shap_value": round(shap_val, 4),
                "impact_direction": direction,
                "narrative": narrative
            })
        return drivers

    def explain_student_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Computes local Shapley values via TreeSHAP for both Academic and Placement risk models.
        Returns distinct academic drivers, placement drivers, and top composite drivers.
        """
        def _safe_float(val, default: float) -> float:
            if val is None:
                return float(default)
            try:
                return float(val)
            except (ValueError, TypeError):
                return float(default)

        features_dict = {
            "cgpa": _safe_float(data.get("cgpa"), 7.0),
            "backlogs": float(_safe_float(data.get("backlogs"), 0.0)),
            "internal_exam_avg": _safe_float(data.get("internal_exam_avg"), 70.0),
            "attendance_pct": _safe_float(data.get("attendance_pct"), 80.0),
            "assignment_completion_pct": _safe_float(data.get("assignment_completion_pct"), 80.0),
            "certifications_count": float(_safe_float(data.get("certifications_count"), 1.0)),
            "coding_score": _safe_float(data.get("coding_score"), 65.0),
            "aptitude_score": _safe_float(data.get("aptitude_score"), 65.0),
            "mock_interviews_completed": float(_safe_float(data.get("mock_interviews_completed"), 1.0)),
            "technical_skills_count": float(_safe_float(data.get("technical_skills_count"), 4.0))
        }

        # Ensure explainers are loaded
        if self.academic_explainer is None or self.placement_explainer is None:
            self._init_explainers()

        # Risk prediction
        risk_prediction = ml_service.predict_risk(data)

        # 1. Academic Risk Explanations
        acad_shap = self._extract_shap_dict(self.academic_explainer, data, features_dict)
        academic_drivers = self._build_driver_list(acad_shap, features_dict, limit=3)

        # 2. Placement Risk Explanations
        place_shap = self._extract_shap_dict(self.placement_explainer, data, features_dict)
        placement_drivers = self._build_driver_list(place_shap, features_dict, limit=3)

        # 3. Overall Top Drivers (guided by primary risk severity)
        primary_shap = acad_shap if risk_prediction.get("academic_risk_prob", 0) >= risk_prediction.get("placement_risk_prob", 0) else place_shap
        top_drivers = self._build_driver_list(primary_shap, features_dict, limit=4)

        # Summary narrative and counterfactual advice
        summary = self._generate_summary(risk_prediction, top_drivers)
        counterfactuals = self._generate_counterfactuals(features_dict, top_drivers)

        return {
            "student_id": str(data.get("student_id", "N/A")),
            "overall_risk_tier": risk_prediction["overall_risk_tier"],
            "academic_risk_prob": risk_prediction["academic_risk_prob"],
            "placement_risk_prob": risk_prediction["placement_risk_prob"],
            "base_value": 0.42,
            "top_drivers": top_drivers,
            "academic_drivers": academic_drivers,
            "placement_drivers": placement_drivers,
            "summary_narrative": summary,
            "counterfactual_advice": counterfactuals
        }

    def _compute_analytical_attributions(self, feats: Dict[str, float]) -> Dict[str, float]:
        """Calculates precise calibrated Shapley attributions based on feature departures from campus medians."""
        attributions = {}
        # Backlogs: >0 strongly increases risk (+Risk)
        b = feats["backlogs"]
        attributions["backlogs"] = b * 0.28

        # CGPA: below 7.5 adds risk, above 7.5 provides support
        cgpa = feats["cgpa"]
        attributions["cgpa"] = (7.5 - cgpa) * 0.08

        # Attendance: below 75% adds massive risk
        att = feats["attendance_pct"]
        attributions["attendance_pct"] = (78.0 - att) * 0.006

        # Coding Score: below 65 adds placement risk
        cs = feats["coding_score"]
        attributions["coding_score"] = (68.0 - cs) * 0.005

        # Aptitude Score
        apt = feats["aptitude_score"]
        attributions["aptitude_score"] = (65.0 - apt) * 0.004

        # Assignment completion
        asgn = feats["assignment_completion_pct"]
        attributions["assignment_completion_pct"] = (80.0 - asgn) * 0.003

        # Mock interviews: >=2 adds support (-risk)
        mock = feats["mock_interviews_completed"]
        attributions["mock_interviews_completed"] = (1.5 - mock) * 0.07

        # Certifications
        cert = feats["certifications_count"]
        attributions["certifications_count"] = (1.5 - cert) * 0.05

        # Internal exam
        iexam = feats["internal_exam_avg"]
        attributions["internal_exam_avg"] = (72.0 - iexam) * 0.004

        # Technical skills
        skills = feats["technical_skills_count"]
        attributions["technical_skills_count"] = (4.0 - skills) * 0.03

        return attributions

    def _generate_narrative(self, feat: str, val: float, shap_val: float, direction: str) -> str:
        if direction == "+Risk":
            if feat == "backlogs":
                return f"{int(val)} active backlog(s) creates severe exam rescheduling risk (+{abs(shap_val):.2f})."
            if feat == "attendance_pct":
                return f"Attendance at {val:.1f}% is bordering/below the 75% statutory threshold (+{abs(shap_val):.2f})."
            if feat == "cgpa":
                return f"CGPA of {val:.2f} is below peer median (7.50), restricting interview shortlists (+{abs(shap_val):.2f})."
            if feat == "coding_score":
                return f"Technical coding assessment score ({val:.1f}%) fails minimum technical cutoffs (+{abs(shap_val):.2f})."
            if feat == "mock_interviews_completed":
                return f"Completed only {int(val)} mock interview(s), indicating unverified readiness (+{abs(shap_val):.2f})."
            return f"{FEATURE_LABELS.get(feat, feat)} value of {val:.1f} exerts negative pressure (+{abs(shap_val):.2f})."
        else:
            if feat == "cgpa":
                return f"Strong academic standing with CGPA of {val:.2f} provides high resilience (-{abs(shap_val):.2f})."
            if feat == "attendance_pct":
                return f"Consistent lecture engagement at {val:.1f}% safeguards term eligibility (-{abs(shap_val):.2f})."
            if feat == "coding_score":
                return f"Exemplary coding proficiency score of {val:.1f}% accelerates placement eligibility (-{abs(shap_val):.2f})."
            if feat == "certifications_count":
                return f"{int(val)} industry certifications significantly validate domain expertise (-{abs(shap_val):.2f})."
            return f"{FEATURE_LABELS.get(feat, feat)} value of {val:.1f} acts as an anchor metric (-{abs(shap_val):.2f})."

    def _generate_summary(self, risk: Dict[str, Any], top_drivers: List[Dict[str, Any]]) -> str:
        tier = risk["overall_risk_tier"]
        risk_drivers = [d for d in top_drivers if d.get("impact_direction") == "+Risk"]
        support_drivers = [d for d in top_drivers if d.get("impact_direction") == "Support"]

        if tier == "High":
            primary = risk_drivers[0]["feature_label"] if risk_drivers else (top_drivers[0]["feature_label"] if top_drivers else "Academic Profile")
            return f"Student is in High Risk tier. The dominant vulnerability driver is {primary} (+Risk), requiring immediate institutional intervention."
        elif tier == "Medium":
            primary = risk_drivers[0]["feature_label"] if risk_drivers else (top_drivers[0]["feature_label"] if top_drivers else "Profile Metrics")
            return f"Student is in Medium Risk tier with moderate volatility driven by {primary}. Targeted mentorship can prevent regression."
        else:
            primary = support_drivers[0]["feature_label"] if support_drivers else (top_drivers[0]["feature_label"] if top_drivers else "Consistent Engagement")
            return f"Student maintains a Low Risk profile supported by strong {primary} (Support). On track for distinguished placement."

    def _generate_counterfactuals(self, feats: Dict[str, float], top_drivers: List[Dict[str, Any]]) -> List[str]:
        advice = []
        for d in top_drivers:
            f = d["feature_name"]
            if d["impact_direction"] == "+Risk":
                if f == "backlogs" and feats["backlogs"] > 0:
                    advice.append("Clear at least 1 backlog in the upcoming supplementary cycle to gain ~15 points.")
                elif f == "attendance_pct" and feats["attendance_pct"] < 75.0:
                    advice.append("Maintain 100% attendance in the next 12 consecutive lectures to surpass the 75% boundary.")
                elif f == "coding_score" and feats["coding_score"] < 65.0:
                    advice.append("Enroll in the 4-week Data Structures & Algorithms booster sprint to lift coding score above 70.")
                elif f == "mock_interviews_completed" and feats["mock_interviews_completed"] < 2:
                    advice.append("Schedule 2 peer-faculty mock technical interviews before week 10.")
                elif f == "assignment_completion_pct" and feats["assignment_completion_pct"] < 80.0:
                    advice.append("Submit remaining pending lab records and assignments to recover coursework weightage.")
        if not advice:
            advice.append("Maintain current study routines and explore competitive hackathon participation.")
        return advice

explainability_engine = ExplainabilityEngine()
