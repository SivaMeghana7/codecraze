import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from xgboost import XGBClassifier

MODELS_DIR = Path(__file__).resolve().parent / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

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

def generate_synthetic_dataset(n_samples: int = 1500) -> pd.DataFrame:
    """
    Generates synthetic multi-domain student success dataset with grounded
    statistical correlations matching higher-education academic distributions.
    """
    np.random.seed(42)

    cgpa = np.clip(np.random.normal(7.4, 1.2, n_samples), 4.0, 10.0)
    # Backlogs correlated negatively with CGPA
    backlog_prob = np.clip((8.0 - cgpa) / 5.0, 0.05, 0.8)
    backlogs = np.random.binomial(n=4, p=backlog_prob)

    attendance_pct = np.clip(np.random.normal(82.0, 10.0, n_samples) - (backlogs * 3.5), 45.0, 100.0)
    internal_exam_avg = np.clip(cgpa * 9.5 + np.random.normal(0, 5, n_samples), 40.0, 100.0)
    assignment_completion_pct = np.clip(attendance_pct * 0.9 + np.random.normal(10, 6, n_samples), 50.0, 100.0)
    certifications_count = np.random.poisson(lam=1.5, size=n_samples)

    coding_score = np.clip(np.random.normal(68.0, 14.0, n_samples), 25.0, 100.0)
    aptitude_score = np.clip(cgpa * 7.5 + np.random.normal(15, 8, n_samples), 35.0, 100.0)
    mock_interviews_completed = np.random.poisson(lam=1.8, size=n_samples)
    technical_skills_count = np.clip(np.random.poisson(lam=4.2, size=n_samples), 1, 12)

    # Ground truth risk labels
    # Academic risk: high if backlogs >= 2, attendance < 75%, or cgpa < 6.5
    acad_score = (cgpa * 10 * 0.7) + (np.maximum(0, 100 - backlogs * 20) * 0.3)
    acad_risk_prob = 1.0 / (1.0 + np.exp((acad_score - 65.0) / 7.0))
    y_academic_risk = (np.random.rand(n_samples) < acad_risk_prob) | (backlogs >= 2) | (attendance_pct < 75.0)
    y_academic_risk = y_academic_risk.astype(int)

    # Placement risk: high if coding_score < 60, aptitude < 60, mock interviews < 1
    place_score = (coding_score * 0.4) + (aptitude_score * 0.3) + (np.minimum(mock_interviews_completed, 5) * 20 * 0.3)
    place_risk_prob = 1.0 / (1.0 + np.exp((place_score - 62.0) / 8.0))
    y_placement_risk = (np.random.rand(n_samples) < place_risk_prob) | (coding_score < 50.0)
    y_placement_risk = y_placement_risk.astype(int)

    df = pd.DataFrame({
        "cgpa": cgpa,
        "backlogs": backlogs,
        "internal_exam_avg": internal_exam_avg,
        "attendance_pct": attendance_pct,
        "assignment_completion_pct": assignment_completion_pct,
        "certifications_count": certifications_count,
        "coding_score": coding_score,
        "aptitude_score": aptitude_score,
        "mock_interviews_completed": mock_interviews_completed,
        "technical_skills_count": technical_skills_count,
        "academic_risk": y_academic_risk,
        "placement_risk": y_placement_risk
    })
    return df

def train_and_serialize_models():
    print("[TrainModels] Synthesizing student performance dataset (N=1500)...")
    df = generate_synthetic_dataset(1500)
    X = df[FEATURE_NAMES].values
    y_acad = df["academic_risk"].values
    y_place = df["placement_risk"].values

    # Train/Test Split (80% Train, 20% Test)
    print("[TrainModels] Splitting dataset into train (80%) and holdout test (20%)...")
    X_train, X_test, y_acad_train, y_acad_test, y_place_train, y_place_test = train_test_split(
        X, y_acad, y_place, test_size=0.20, random_state=42, stratify=y_acad
    )

    # 1. Fit Standard Scaler on training data ONLY
    print("[TrainModels] Fitting StandardScaler on training set...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    scaler_path = MODELS_DIR / "scaler.pkl"
    joblib.dump(scaler, scaler_path)
    print(f" -> Saved {scaler_path}")

    # 2. Train Academic Risk XGBoost Model
    print("[TrainModels] Training Academic Risk XGBClassifier...")
    xgb_acad = XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        eval_metric="logloss"
    )
    xgb_acad.fit(X_train_scaled, y_acad_train)
    joblib.dump(xgb_acad, MODELS_DIR / "xgb_academic_risk.pkl")

    # Evaluate Academic Risk Model on Test Set
    y_acad_pred = xgb_acad.predict(X_test_scaled)
    y_acad_prob = xgb_acad.predict_proba(X_test_scaled)[:, 1]
    acad_metrics = {
        "accuracy": float(round(accuracy_score(y_acad_test, y_acad_pred), 4)),
        "precision": float(round(precision_score(y_acad_test, y_acad_pred, zero_division=0), 4)),
        "recall": float(round(recall_score(y_acad_test, y_acad_pred, zero_division=0), 4)),
        "f1": float(round(f1_score(y_acad_test, y_acad_pred, zero_division=0), 4)),
        "roc_auc": float(round(roc_auc_score(y_acad_test, y_acad_prob), 4))
    }
    print(f" -> Academic Risk Test Metrics: {acad_metrics}")

    # 3. Train Placement Risk XGBoost Model
    print("[TrainModels] Training Placement Risk XGBClassifier...")
    xgb_place = XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        eval_metric="logloss"
    )
    xgb_place.fit(X_train_scaled, y_place_train)
    joblib.dump(xgb_place, MODELS_DIR / "xgb_placement_risk.pkl")

    # Evaluate Placement Risk Model on Test Set
    y_place_pred = xgb_place.predict(X_test_scaled)
    y_place_prob = xgb_place.predict_proba(X_test_scaled)[:, 1]
    place_metrics = {
        "accuracy": float(round(accuracy_score(y_place_test, y_place_pred), 4)),
        "precision": float(round(precision_score(y_place_test, y_place_pred, zero_division=0), 4)),
        "recall": float(round(recall_score(y_place_test, y_place_pred, zero_division=0), 4)),
        "f1": float(round(f1_score(y_place_test, y_place_pred, zero_division=0), 4)),
        "roc_auc": float(round(roc_auc_score(y_place_test, y_place_prob), 4))
    }
    print(f" -> Placement Risk Test Metrics: {place_metrics}")

    # Unified risk model bundle for convenience
    unified = {
        "academic_model": xgb_acad,
        "placement_model": xgb_place,
        "feature_names": FEATURE_NAMES
    }
    joblib.dump(unified, MODELS_DIR / "xgb_risk_model.pkl")
    print(f" -> Saved unified model to {MODELS_DIR / 'xgb_risk_model.pkl'}")

    # 4. Fit K-Means Clusterer (K=4 Personas)
    print("[TrainModels] Training K-Means behavioral clustering (K=4)...")
    cluster_features = ["cgpa", "backlogs", "attendance_pct", "coding_score", "internal_exam_avg"]
    X_cluster = df[cluster_features].values
    cluster_scaler = StandardScaler()
    X_cluster_scaled = cluster_scaler.fit_transform(X_cluster)
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    kmeans.fit(X_cluster_scaled)

    # Inspect centroid characteristics and determine empirical mapping to archetypes
    centers = cluster_scaler.inverse_transform(kmeans.cluster_centers_)
    print("[TrainModels] K-Means Learned Centroids (in original feature units):")
    for i, c in enumerate(centers):
        print(f"   Cluster raw {i}: CGPA={c[0]:.2f}, Backlogs={c[1]:.2f}, Attendance={c[2]:.1f}%, Coding={c[3]:.1f}, Internal={c[4]:.1f}")

    # Map raw cluster indices to the 4 canonical archetypes:
    # 0: High Academic / Placement Ready (highest CGPA & high placement)
    # 1: Unpolished Gems (solid/high CGPA, low coding score)
    # 2: Disengaged Talents (strong coding, lower attendance)
    # 3: Critical Support Needed (lowest CGPA, highest backlogs)
    raw_clusters = list(range(4))
    # Identify cluster with lowest CGPA / highest backlogs as cluster 3 (Critical Support)
    c3 = int(np.lexsort((-centers[:, 1], centers[:, 0]))[0])  # lowest CGPA or highest backlog
    remaining = [c for c in raw_clusters if c != c3]
    # Identify cluster with highest CGPA among remaining as cluster 0 (High Academic)
    c0 = max(remaining, key=lambda c: centers[c][0])
    remaining = [c for c in remaining if c != c0]
    # Identify remaining cluster with lower coding as cluster 1 (Unpolished Gem: High Theory, Low Practical)
    c1 = min(remaining, key=lambda c: centers[c][3])  # lowest coding
    remaining = [c for c in remaining if c != c1]
    c2 = remaining[0]  # remaining is cluster 2 (Technical specialist / Disengaged)

    cluster_to_persona_map = {
        int(c0): 0,  # High Academic / Placement Ready
        int(c1): 1,  # Unpolished Gems
        int(c2): 2,  # Disengaged Talents
        int(c3): 3   # Critical Academic Support Needed
    }
    print(f"[TrainModels] Empirical Centroid -> Archetype Mapping: {cluster_to_persona_map}")

    joblib.dump(kmeans, MODELS_DIR / "kmeans_segmentation.pkl")
    joblib.dump(cluster_scaler, MODELS_DIR / "cluster_scaler.pkl")
    joblib.dump(cluster_to_persona_map, MODELS_DIR / "cluster_mapping.pkl")
    print(f" -> Saved K-Means model to {MODELS_DIR / 'kmeans_segmentation.pkl'}")
    print(f" -> Saved Cluster Scaler to {MODELS_DIR / 'cluster_scaler.pkl'}")
    print(f" -> Saved Cluster Mapping to {MODELS_DIR / 'cluster_mapping.pkl'}")

    # 5. Serialize Feature Names Metadata
    joblib.dump(FEATURE_NAMES, MODELS_DIR / "model_features.pkl")
    print(f" -> Saved feature catalog to {MODELS_DIR / 'model_features.pkl'}")

    # 6. Save Model Evaluation Report
    metrics_report = {
        "dataset": {
            "total_samples": 1500,
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "feature_count": len(FEATURE_NAMES),
            "data_source": "Synthetic benchmark cohort calibrated on engineering campus distributions"
        },
        "academic_risk_classifier": {
            "algorithm": "XGBoost (XGBClassifier)",
            "hyperparameters": {
                "n_estimators": 100,
                "max_depth": 4,
                "learning_rate": 0.08,
                "subsample": 0.85
            },
            "test_metrics": acad_metrics
        },
        "placement_risk_classifier": {
            "algorithm": "XGBoost (XGBClassifier)",
            "hyperparameters": {
                "n_estimators": 100,
                "max_depth": 4,
                "learning_rate": 0.08,
                "subsample": 0.85
            },
            "test_metrics": place_metrics
        },
        "clustering_segmentation": {
            "algorithm": "K-Means (k=4)",
            "features": cluster_features,
            "cluster_to_persona_map": cluster_to_persona_map
        },
        "disclaimer": "Metrics evaluated on holdout synthetic benchmark test set (N=300). Real-world campus deployment will require continuous retraining on live institutional data."
    }

    with open(MODELS_DIR / "model_metrics.json", "w") as f:
        json.dump(metrics_report, f, indent=2)
    print(f" -> Saved evaluation metrics to {MODELS_DIR / 'model_metrics.json'}")

    print("[TrainModels] Successfully trained, evaluated, and serialized all ML artifacts!")

if __name__ == "__main__":
    train_and_serialize_models()
