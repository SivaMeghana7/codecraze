from pathlib import Path
from typing import Dict, Any
import numpy as np
import joblib
from app.config import settings

import logging

logger = logging.getLogger(__name__)

PERSONAS_METADATA = {
    0: {
        "cluster": 0,
        "label": "High Academic / Placement Ready",
        "tagline": "Top Tier Achiever",
        "badge_color": "emerald",
        "description": "Exemplary CGPA, robust technical proficiency, and high corporate placement readiness.",
        "recommended_strategy": "Nominate for tier-1 product firm drives, high-stakes research grants, and student mentorship roles.",
        "archetype": "Exemplar"
    },
    1: {
        "cluster": 1,
        "label": "Unpolished Gems",
        "tagline": "High Theory, Low Practical",
        "badge_color": "blue",
        "description": "High theoretical academic performance (CGPA >= 7.8) but lacking hands-on coding or project exposure.",
        "recommended_strategy": "Mandatory enrollment in hands-on Coding Bootcamps, GitHub portfolio development, and hackathons.",
        "archetype": "Theorist"
    },
    2: {
        "cluster": 2,
        "label": "Disengaged Talents",
        "tagline": "High Tech Aptitude, Low Attendance",
        "badge_color": "amber",
        "description": "High natural technical aptitude and coding skill, but chronic attendance deficiencies risking exam debarment.",
        "recommended_strategy": "Faculty mentoring, attendance counseling, and project-based attendance credit incentives.",
        "archetype": "Maverick"
    },
    3: {
        "cluster": 3,
        "label": "Critical Academic Support Needed",
        "tagline": "Multi-Dimensional Risk",
        "badge_color": "rose",
        "description": "Active backlogs, low CGPA, and struggling engagement metrics requiring comprehensive remedial intervention.",
        "recommended_strategy": "Immediate 1-on-1 remedial tutoring, parent-faculty consultation, and backlog clearance roadmap.",
        "archetype": "At-Risk"
    }
}

class ClusteringEngine:
    """
    Unsupervised Behavioral Persona Segmentation Engine.
    Segments students into 4 strategic behavioral archetypes using K-Means and normalized multi-domain vectors.
    """

    def __init__(self):
        self.kmeans = None
        self.scaler = None
        self.cluster_mapping = None
        self._load_cluster_model()

    def _load_cluster_model(self):
        try:
            kpath = Path(settings.MODELS_DIR) / "kmeans_segmentation.pkl"
            # Prioritize dedicated cluster_scaler.pkl (5 features)
            spath = Path(settings.MODELS_DIR) / "cluster_scaler.pkl"
            mpath = Path(settings.MODELS_DIR) / "cluster_mapping.pkl"
            if not spath.exists():
                spath = Path(settings.MODELS_DIR) / "scaler.pkl"

            if kpath.exists():
                self.kmeans = joblib.load(kpath)
            if spath.exists():
                loaded_scaler = joblib.load(spath)
                # Verify scaler expects 5 features
                if hasattr(loaded_scaler, "n_features_in_") and loaded_scaler.n_features_in_ == 5:
                    self.scaler = loaded_scaler
                elif not hasattr(loaded_scaler, "n_features_in_"):
                    self.scaler = loaded_scaler
                else:
                    logger.warning(f"[ClusteringEngine] Scaler feature count mismatch ({getattr(loaded_scaler, 'n_features_in_', '?')} != 5).")
            if mpath.exists():
                self.cluster_mapping = joblib.load(mpath)
        except Exception as e:
            logger.error(f"[ClusteringEngine] Error loading cluster model: {e}")
            self.kmeans = None

    def segment_student(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Determines the persona cluster (0, 1, 2, 3) and attaches full metadata.
        Uses K-Means if trained model is present, otherwise executes canonical KPMG rule heuristics.
        """
        def _safe_float(val, default):
            if val is None:
                return float(default)
            try:
                return float(val)
            except (ValueError, TypeError):
                return float(default)

        def _safe_int(val, default):
            if val is None:
                return int(default)
            try:
                return int(val)
            except (ValueError, TypeError):
                return int(default)

        cgpa = _safe_float(data.get("cgpa"), 7.0)
        backlogs = _safe_int(data.get("backlogs"), 0)
        attendance = _safe_float(data.get("attendance_pct"), 80.0)
        coding = _safe_float(data.get("coding_score"), 65.0)
        internal = _safe_float(data.get("internal_exam_avg"), 70.0)

        cluster_id = None

        if self.kmeans is not None:
            try:
                vec = np.array([[cgpa, backlogs, attendance, coding, internal]], dtype=np.float64)
                if self.scaler is not None:
                    vec = self.scaler.transform(vec)
                raw_cluster = int(self.kmeans.predict(vec)[0])
                if self.cluster_mapping and raw_cluster in self.cluster_mapping:
                    cluster_id = self.cluster_mapping[raw_cluster]
                else:
                    cluster_id = raw_cluster
            except Exception as e:
                logger.warning(f"[ClusteringEngine] K-Means segmentation failed ({e}). Falling back to heuristics.")
                cluster_id = None

        if cluster_id is None:
            cluster_id = self._heuristic_cluster(cgpa, backlogs, attendance, coding)

        persona = PERSONAS_METADATA.get(cluster_id, PERSONAS_METADATA[0])
        assignment_pct = _safe_float(data.get("assignment_completion_pct"), 75.0)
        return {
            **persona,
            "radar_coordinates": {
                "academic": round(cgpa * 10, 1),
                "attendance": round(attendance, 1),
                "technical": round(coding, 1),
                "consistency": round(assignment_pct, 1)
            }
        }

    def _heuristic_cluster(self, cgpa: float, backlogs: int, attendance: float, coding: float) -> int:
        # Cluster 3: Critical Support Needed
        if backlogs >= 2 or (cgpa < 6.2 and attendance < 72.0) or (cgpa < 5.8):
            return 3
        # Cluster 2: Disengaged Talents (High tech skill >= 70, attendance < 76)
        if attendance < 76.0 and coding >= 68.0:
            return 2
        # Cluster 1: Unpolished Gems (High CGPA >= 7.8, low practical coding < 65)
        if cgpa >= 7.8 and coding < 65.0:
            return 1
        # Cluster 0: High Academic / Placement Ready
        if cgpa >= 7.2 and coding >= 68.0:
            return 0
        
        # Intermediate fallbacks
        if coding < 60.0:
            return 1
        elif attendance < 75.0:
            return 2
        return 0

clustering_engine = ClusteringEngine()
