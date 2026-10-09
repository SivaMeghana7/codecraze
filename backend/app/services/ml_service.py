import os
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
import joblib
import numpy as np
from app.config import settings

class MLService:
    """
    High-Performance Machine Learning Inference Service.
    Loads pre-trained XGBoost classifiers and standard scalers in-memory for <50ms dual risk inference.
    Includes deterministic enterprise heuristic fallback to guarantee 100% uptime if artifacts are missing.
    """

    FEATURE_NAMES = [
        "cgpa",
        "backlogs",
        "internal_exam_avg",
        "attendance_pct",
        "assignment_completion_pct",
        "certifications_count",
        "coding_score",
        "aptitude_score",
        "mock_interviews_completed",
        "technical_skills_count"
    ]

    def __init__(self):
        self.academic_model = None
        self.placement_model = None
        self.scaler = None
        self.is_loaded = False
        self.load_models()

    def load_models(self) -> bool:
        """Attempts to load serialized models from disk into memory."""
        try:
            models_dir = Path(settings.MODELS_DIR)
            acad_path = models_dir / "xgb_academic_risk.pkl"
            place_path = models_dir / "xgb_placement_risk.pkl"
            scaler_path = models_dir / "scaler.pkl"

            if acad_path.exists():
                self.academic_model = joblib.load(acad_path)
            if place_path.exists():
                self.placement_model = joblib.load(place_path)
            if scaler_path.exists():
                self.scaler = joblib.load(scaler_path)

            # Fallback to unified bundle if separate artifacts missing
            if self.academic_model is None or self.placement_model is None:
                unified_path = models_dir / "xgb_risk_model.pkl"
                if unified_path.exists():
                    unified = joblib.load(unified_path)
                    if isinstance(unified, dict):
                        if not self.academic_model:
                            self.academic_model = unified.get("academic_model")
                        if not self.placement_model:
                            self.placement_model = unified.get("placement_model")

            self.is_loaded = (self.academic_model is not None and self.placement_model is not None)
            return self.is_loaded
        except Exception as e:
            print(f"[MLService] Warning: Failed to load ML artifacts from disk ({e}). Falling back to calibrated heuristics.")
            self.is_loaded = False
            return False

    @staticmethod
    def _safe_float(val, default: float) -> float:
        if val is None:
            return float(default)
        try:
            return float(val)
        except (ValueError, TypeError):
            return float(default)

    @staticmethod
    def _safe_int(val, default: int) -> int:
        if val is None:
            return int(default)
        try:
            return int(val)
        except (ValueError, TypeError):
            return int(default)

    def _prepare_vector(self, data: Dict[str, Any]) -> np.ndarray:
        vec = [
            self._safe_float(data.get("cgpa"), 7.0),
            float(self._safe_int(data.get("backlogs"), 0)),
            self._safe_float(data.get("internal_exam_avg"), 70.0),
            self._safe_float(data.get("attendance_pct"), 80.0),
            self._safe_float(data.get("assignment_completion_pct"), 80.0),
            float(self._safe_int(data.get("certifications_count"), 1)),
            self._safe_float(data.get("coding_score"), 65.0),
            self._safe_float(data.get("aptitude_score"), 65.0),
            float(self._safe_int(data.get("mock_interviews_completed"), 1)),
            float(self._safe_int(data.get("technical_skills_count"), 4))
        ]
        arr = np.array(vec, dtype=np.float32).reshape(1, -1)
        if self.scaler is not None:
            try:
                arr = self.scaler.transform(arr)
            except Exception:
                pass
        return arr

    def _heuristic_academic_risk(self, data: Dict[str, Any]) -> float:
        """Calibrated fallback logistic probability for Academic Risk."""
        cgpa = self._safe_float(data.get("cgpa"), 7.0)
        backlogs = float(self._safe_int(data.get("backlogs"), 0))
        att = self._safe_float(data.get("attendance_pct"), 80.0)
        assign = self._safe_float(data.get("assignment_completion_pct"), 80.0)

        # Higher backlogs & lower CGPA increase risk
        z = 0.0
        z += (7.0 - cgpa) * 1.3
        z += backlogs * 1.8
        z += (75.0 - att) * 0.08
        z += (75.0 - assign) * 0.04

        prob = 1.0 / (1.0 + np.exp(-z))
        return float(np.clip(prob, 0.02, 0.98))

    def _heuristic_placement_risk(self, data: Dict[str, Any]) -> float:
        """Calibrated fallback logistic probability for Placement Risk."""
        coding = self._safe_float(data.get("coding_score"), 65.0)
        aptitude = self._safe_float(data.get("aptitude_score"), 65.0)
        mocks = float(self._safe_int(data.get("mock_interviews_completed"), 1))
        cgpa = self._safe_float(data.get("cgpa"), 7.0)

        z = 0.0
        z += (65.0 - coding) * 0.07
        z += (65.0 - aptitude) * 0.05
        z += (2.0 - mocks) * 0.6
        z += (6.5 - cgpa) * 0.5

        prob = 1.0 / (1.0 + np.exp(-z))
        return float(np.clip(prob, 0.02, 0.98))

    def predict_risk(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates Academic and Placement risk independently.
        Distinguishes genuine XGBoost inference from rule-based fallback outputs.
        Enforces KPMG threshold rule:
        - High: Prob >= 0.60 OR attendance < 75% OR backlogs >= 2
        - Medium: 0.35 <= Prob < 0.60
        - Low: Prob < 0.35
        """
        attendance = self._safe_float(data.get("attendance_pct"), 80.0)
        backlogs = self._safe_int(data.get("backlogs"), 0)

        # 1. Academic Risk Inference
        acad_source = "heuristic_fallback"
        if self.academic_model is not None:
            try:
                features = self._prepare_vector(data)
                acad_prob = float(self.academic_model.predict_proba(features)[0][1])
                acad_source = "xgboost_model"
            except Exception:
                acad_prob = self._heuristic_academic_risk(data)
        else:
            acad_prob = self._heuristic_academic_risk(data)

        # 2. Placement Risk Inference
        place_source = "heuristic_fallback"
        if self.placement_model is not None:
            try:
                features = self._prepare_vector(data)
                place_prob = float(self.placement_model.predict_proba(features)[0][1])
                place_source = "xgboost_model"
            except Exception:
                place_prob = self._heuristic_placement_risk(data)
        else:
            place_prob = self._heuristic_placement_risk(data)

        # 3. Apply Hard Boundary Rules & Risk Tiers
        hard_triggers = []
        if attendance < 75.0:
            hard_triggers.append(f"Statutory Attendance Deficit ({attendance:.1f}% < 75%)")
        if backlogs >= 2:
            hard_triggers.append(f"Critical Backlog Count ({backlogs} >= 2)")

        acad_level = self._classify_tier(acad_prob, attendance, backlogs)
        place_level = self._classify_tier(place_prob, attendance=100.0, backlogs=0)

        # Overall Tier is the maximum risk severity between Academic and Placement
        overall_prob = max(acad_prob, place_prob)
        if acad_level == "High" or place_level == "High" or len(hard_triggers) > 0:
            overall_tier = "High"
        elif acad_level == "Medium" or place_level == "Medium" or overall_prob >= 0.35:
            overall_tier = "Medium"
        else:
            overall_tier = "Low"

        return {
            "academic_risk_level": acad_level,
            "academic_risk_prob": round(acad_prob, 4),
            "academic_model_source": acad_source,
            "placement_risk_level": place_level,
            "placement_risk_prob": round(place_prob, 4),
            "placement_model_source": place_source,
            "overall_risk_tier": overall_tier,
            "overall_risk_prob": round(overall_prob, 4),
            "is_fallback": (acad_source == "heuristic_fallback" or place_source == "heuristic_fallback"),
            "hard_rule_triggers": hard_triggers
        }

    def _classify_tier(self, prob: float, attendance: float, backlogs: int) -> str:
        if prob >= 0.60 or attendance < 75.0 or backlogs >= 2:
            return "High"
        elif prob >= 0.35:
            return "Medium"
        return "Low"

    def get_evaluation_metrics(self) -> Dict[str, Any]:
        """Loads documented test-set evaluation metrics from artifact disk."""
        metrics_file = Path(settings.MODELS_DIR) / "model_metrics.json"
        if metrics_file.exists():
            try:
                import json
                with open(metrics_file, "r") as f:
                    return json.load(f)
            except Exception:
                pass
        return {
            "status": "unavailable",
            "message": "Model evaluation report has not yet been generated."
        }

ml_service = MLService()
