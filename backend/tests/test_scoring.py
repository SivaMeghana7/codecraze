import pytest
from app.services.scoring_engine import scoring_engine

def test_academic_index_calculation():
    # CGPA = 8.0, backlogs = 0 -> (8.0 * 10 * 0.70) + (100 * 0.30) = 56 + 30 = 86.0
    idx = scoring_engine.calculate_academic_index(8.0, 0)
    assert idx == 86.0

    # CGPA = 6.0, backlogs = 2 -> (6.0 * 10 * 0.70) + (60 * 0.30) = 42 + 18 = 60.0
    idx_backlogs = scoring_engine.calculate_academic_index(6.0, 2)
    assert idx_backlogs == 60.0

    # Backlog penalty floor at 0 (backlogs >= 5)
    idx_floor = scoring_engine.calculate_academic_index(5.0, 6)
    assert idx_floor == 35.0  # 50 * 0.70 + 0

def test_engagement_index_calculation():
    # attendance = 80%, assignment = 90%, certs = 2
    # 80 * 0.4 + 90 * 0.4 + 2 * 20 * 0.2 = 32 + 36 + 8 = 76.0
    eng = scoring_engine.calculate_engagement_index(80.0, 90.0, 2)
    assert eng == 76.0

    # Cap on certifications at 5
    eng_capped = scoring_engine.calculate_engagement_index(100.0, 100.0, 10)
    assert eng_capped == 100.0  # 40 + 40 + 20

def test_placement_index_calculation():
    # coding = 70, aptitude = 80, mock_interviews = 2
    # 70 * 0.4 + 80 * 0.3 + 2 * 20 * 0.3 = 28 + 24 + 12 = 64.0
    place = scoring_engine.calculate_placement_index(70.0, 80.0, 2)
    assert place == 64.0

def test_master_success_score():
    # Acad = 80, Eng = 70, Place = 60
    # 80 * 0.40 + 70 * 0.30 + 60 * 0.30 = 32 + 21 + 18 = 71.0
    score = scoring_engine.calculate_success_score(80.0, 70.0, 60.0)
    assert score == 71.0
    assert 0.0 <= score <= 100.0

def test_attendance_margin_formula():
    # 100 total classes, attended 85 -> floor((85 - 75) / 0.75) = floor(10 / 0.75) = floor(13.33) = 13
    margin = scoring_engine.calculate_attendance_margin(85, 100)
    assert margin == 13

    # Exactly 75 attended out of 100 -> (75 - 75) / 0.75 = 0
    margin_exact = scoring_engine.calculate_attendance_margin(75, 100)
    assert margin_exact == 0

    # Attended 60 out of 100 -> (60 - 75) / 0.75 = -15 / 0.75 = -20
    margin_defaulter = scoring_engine.calculate_attendance_margin(60, 100)
    assert margin_defaulter == -20

    # Classes needed to restore attendance: deficit is 15 -> ceil(15 / 0.25) = 60 classes
    needed = scoring_engine.calculate_consecutive_classes_needed(60, 100)
    assert needed == 60
