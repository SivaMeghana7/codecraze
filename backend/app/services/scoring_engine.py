import math
from typing import Dict, Any

class ScoringEngine:
    """
    Deterministic Student Success Score & Health Engine.
    Implements the KPMG 5-domain continuous normalized index formula bounded between 0.00 and 100.00.
    Handles missing and incomplete data through explicit calibrated imputation defaults.
    Weights are fully configurable and transparently documented.
    """

    # Configurable Master Weights (sum to 1.0)
    DEFAULT_WEIGHTS = {
        "academic": 0.40,
        "engagement": 0.30,
        "placement": 0.30,
    }

    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or self.DEFAULT_WEIGHTS.copy()

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

    @classmethod
    def calculate_academic_index(cls, cgpa: Any, backlogs: Any) -> float:
        """
        Academic Index (40% Default Weight in Master Success Score):
        Formula: (CGPA * 10 * 0.70) + (max(0, 100 - backlogs * 20) * 0.30)
        Handles missing data: cgpa defaults to 6.5, backlogs defaults to 0.
        """
        safe_cgpa = min(10.0, max(0.0, cls._safe_float(cgpa, 6.5)))
        safe_backlogs = max(0, cls._safe_int(backlogs, 0))

        cgpa_component = (safe_cgpa * 10.0) * 0.70
        backlog_penalty_score = max(0.0, 100.0 - (safe_backlogs * 20.0)) * 0.30
        raw_index = cgpa_component + backlog_penalty_score
        return round(min(100.0, max(0.0, raw_index)), 2)

    @classmethod
    def calculate_engagement_index(
        cls,
        attendance_pct: Any,
        assignment_completion_pct: Any,
        certifications_count: Any
    ) -> float:
        """
        Engagement Index (30% Default Weight in Master Success Score):
        Formula: (attendance_pct * 0.40) + (assignment_completion_pct * 0.40) + (min(certifications_count, 5) * 20 * 0.20)
        Handles missing data: attendance defaults to 75.0, assignment defaults to 75.0, certs to 0.
        """
        safe_att = min(100.0, max(0.0, cls._safe_float(attendance_pct, 75.0)))
        safe_assign = min(100.0, max(0.0, cls._safe_float(assignment_completion_pct, 75.0)))
        safe_certs = max(0, cls._safe_int(certifications_count, 0))

        att_comp = safe_att * 0.40
        assign_comp = safe_assign * 0.40
        cert_comp = min(float(safe_certs), 5.0) * 20.0 * 0.20
        raw_index = att_comp + assign_comp + cert_comp
        return round(min(100.0, max(0.0, raw_index)), 2)

    @classmethod
    def calculate_placement_index(
        cls,
        coding_score: Any,
        aptitude_score: Any,
        mock_interviews_completed: Any
    ) -> float:
        """
        Placement Readiness Index (30% Default Weight in Master Success Score):
        Formula: (coding_score * 0.40) + (aptitude_score * 0.30) + (min(mock_interviews_completed, 5) * 20 * 0.30)
        Handles missing data: coding defaults to 60.0, aptitude defaults to 60.0, mocks to 0.
        """
        safe_coding = min(100.0, max(0.0, cls._safe_float(coding_score, 60.0)))
        safe_apt = min(100.0, max(0.0, cls._safe_float(aptitude_score, 60.0)))
        safe_mocks = max(0, cls._safe_int(mock_interviews_completed, 0))

        coding_comp = safe_coding * 0.40
        apt_comp = safe_apt * 0.30
        mock_comp = min(float(safe_mocks), 5.0) * 20.0 * 0.30
        raw_index = coding_comp + apt_comp + mock_comp
        return round(min(100.0, max(0.0, raw_index)), 2)

    def calculate_success_score(
        self,
        academic_index: float,
        engagement_index: float,
        placement_index: float
    ) -> float:
        """
        Master Continuous Success Score (0.00 - 100.00):
        Formula: (Academic Index * w_acad) + (Engagement Index * w_eng) + (Placement Index * w_place)
        """
        w_acad = self.weights.get("academic", 0.40)
        w_eng = self.weights.get("engagement", 0.30)
        w_place = self.weights.get("placement", 0.30)

        raw_score = (academic_index * w_acad) + (engagement_index * w_eng) + (placement_index * w_place)
        return round(min(100.0, max(0.0, raw_score)), 2)

    @classmethod
    def calculate_attendance_margin(cls, attended_classes: Any, total_classes: Any) -> int:
        """
        Attendance Margin Health Formula:
        Margin = floor( (Attended Classes - (0.75 * Total Classes)) / 0.75 )
        
        Interpretation:
        - If Margin >= 0: Number of future lectures student can safely skip without breaching 75%.
        - If Margin < 0: Deficit indicating non-compliance.
        """
        att = cls._safe_int(attended_classes, 75)
        tot = cls._safe_int(total_classes, 100)
        if tot <= 0:
            return 0
        numerator = float(att) - (0.75 * float(tot))
        return math.floor(numerator / 0.75)

    @classmethod
    def calculate_consecutive_classes_needed(cls, attended_classes: Any, total_classes: Any) -> int:
        """
        Calculates consecutive classes needed to restore attendance to at least 75%.
        (Attended + k) / (Total + k) >= 0.75 => 0.25k >= 0.75*Total - Attended
        """
        att = cls._safe_int(attended_classes, 75)
        tot = cls._safe_int(total_classes, 100)
        if tot <= 0:
            return 0
        deficit = (0.75 * float(tot)) - float(att)
        if deficit <= 0:
            return 0
        return math.ceil(deficit / 0.25)

    def compute_all_metrics(
        self,
        cgpa: Any = None,
        backlogs: Any = None,
        attendance_pct: Any = None,
        attended_classes: Any = None,
        total_classes: Any = None,
        assignment_completion_pct: Any = None,
        certifications_count: Any = None,
        coding_score: Any = None,
        aptitude_score: Any = None,
        mock_interviews_completed: Any = None
    ) -> Dict[str, Any]:
        """Convenience comprehensive calculator returning all metrics with explicit missing handling."""
        # Derive attendance_pct if only attended/total classes provided
        if attendance_pct is None and attended_classes is not None and total_classes:
            tot = self._safe_int(total_classes, 100)
            att = self._safe_int(attended_classes, 75)
            attendance_pct = round((att / max(1, tot)) * 100, 1)

        # Derive attended classes if only attendance_pct provided
        if attended_classes is None and attendance_pct is not None:
            tot = self._safe_int(total_classes, 100)
            pct = self._safe_float(attendance_pct, 75.0)
            attended_classes = int(round((pct / 100.0) * tot))

        acad = self.calculate_academic_index(cgpa, backlogs)
        eng = self.calculate_engagement_index(attendance_pct, assignment_completion_pct, certifications_count)
        place = self.calculate_placement_index(coding_score, aptitude_score, mock_interviews_completed)
        success = self.calculate_success_score(acad, eng, place)
        margin = self.calculate_attendance_margin(attended_classes, total_classes)
        needed = self.calculate_consecutive_classes_needed(attended_classes, total_classes)

        return {
            "academic_index": acad,
            "engagement_index": eng,
            "placement_index": place,
            "success_score": success,
            "attendance_margin": margin,
            "consecutive_classes_needed": needed,
            "weights_used": self.weights
        }

    def get_weight_configuration(self) -> Dict[str, float]:
        return self.weights.copy()

scoring_engine = ScoringEngine()
