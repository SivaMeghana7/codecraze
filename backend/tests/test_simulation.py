import pytest
from app.services.simulation_engine import simulation_engine

def test_simulation_engine_trajectory_positive_delta():
    baseline_payload = {
        "cgpa": 6.5,
        "backlogs": 2,
        "attendance_pct": 68.0,
        "assignment_completion_pct": 70.0,
        "certifications_count": 0,
        "coding_score": 50.0,
        "aptitude_score": 55.0,
        "mock_interviews_completed": 0,
        "total_classes": 100,
        "attended_classes": 68
    }

    # Simulate clearing backlogs, raising attendance, and learning coding
    sim_payload = {
        "cgpa": 7.2,
        "backlogs": 0,
        "attendance_pct": 82.0,
        "assignment_completion_pct": 85.0,
        "certifications_count": 2,
        "coding_score": 75.0,
        "aptitude_score": 75.0,
        "mock_interviews_completed": 3,
        "total_classes": 100,
        "attended_classes": 82
    }

    result = simulation_engine.simulate(sim_payload)

    # Check simulated success score is higher
    assert result["simulated"]["success_score"] > 65.0
    assert result["simulated"]["risk_tier"] in ["Low", "Medium"]
    assert result["simulated"]["attendance_margin"] >= 0

    # Ensure recommendations are provided
    assert len(result["recommendations"]) > 0
    assert len(result["fastest_path_to_low_risk"]) > 0

def test_simulation_risk_status_migration():
    # High risk student simulated to safe state
    sim_data = {
        "cgpa": 8.5,
        "backlogs": 0,
        "attendance_pct": 90.0,
        "assignment_completion_pct": 95.0,
        "certifications_count": 3,
        "coding_score": 85.0,
        "aptitude_score": 88.0,
        "mock_interviews_completed": 4,
        "total_classes": 100,
        "attended_classes": 90
    }
    baseline_override = {
        "academic_index": 50.0,
        "engagement_index": 50.0,
        "placement_index": 40.0,
        "success_score": 47.0,
        "attendance_margin": -15,
        "overall_risk_tier": "High",
        "persona_cluster": 3,
        "persona_label": "Critical Academic Support Needed"
    }

    result = simulation_engine.simulate(sim_data, baseline_override=baseline_override)
    assert result["deltas"]["success_score_delta"] > 0
    assert result["deltas"]["risk_status_changed"] is True
    assert result["deltas"]["risk_migration"] == "High → Low"
