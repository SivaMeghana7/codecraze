-- ============================================================================
-- Smart Campus Intelligence: Database Seeds (SQL Reference)
-- Pre-populated archetype seeds demonstrating all 4 personas and risk tiers
-- ============================================================================

-- Archetype 1: Exemplar (Cluster 0, Low Risk)
INSERT INTO students (id, student_id, first_name, last_name, email, department, semester, cohort_year, mentor_name, avatar_url, status)
VALUES ('stu-seed-001', 'STU-2024-001', 'Aarav', 'Patel', 'aarav.patel@campus.edu', 'Computer Science & Engineering', 6, 2024, 'Dr. Rameshwar Sharma', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Active');

INSERT INTO academic_indicators (id, student_id, cgpa, backlogs, internal_exam_avg, attendance_pct, attended_classes, total_classes, assignment_completion_pct, certifications_count, lab_performance_score)
VALUES ('acad-seed-001', 'stu-seed-001', 9.25, 0, 91.0, 92.5, 93, 100, 96.0, 4, 95.0);

INSERT INTO placement_indicators (id, student_id, coding_score, aptitude_score, mock_interviews_completed, technical_skills_count, soft_skills_rating, internship_status, projects_count)
VALUES ('place-seed-001', 'stu-seed-001', 88.5, 92.0, 4, 9, 4.6, 'Completed', 3);

INSERT INTO student_scores (id, student_id, academic_index, engagement_index, placement_index, success_score, attendance_margin, percentile_rank)
VALUES ('score-seed-001', 'stu-seed-001', 94.75, 91.40, 87.00, 91.42, 23, 98.5);

INSERT INTO risk_assessments (id, student_id, academic_risk_level, academic_risk_prob, placement_risk_level, placement_risk_prob, overall_risk_tier, persona_cluster, persona_label, top_risk_driver)
VALUES ('risk-seed-001', 'stu-seed-001', 'Low', 0.04, 'Low', 0.06, 'Low', 0, 'High Academic / Placement Ready', 'Exemplary CGPA (9.25)');

-- Archetype 2: Unpolished Gem (Cluster 1, Medium Risk)
INSERT INTO students (id, student_id, first_name, last_name, email, department, semester, cohort_year, mentor_name, avatar_url, status)
VALUES ('stu-seed-002', 'STU-2024-002', 'Diya', 'Sharma', 'diya.sharma@campus.edu', 'Artificial Intelligence & Machine Learning', 6, 2024, 'Prof. Ananya Sen', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'Active');

INSERT INTO academic_indicators (id, student_id, cgpa, backlogs, internal_exam_avg, attendance_pct, attended_classes, total_classes, assignment_completion_pct, certifications_count, lab_performance_score)
VALUES ('acad-seed-002', 'stu-seed-002', 8.85, 0, 87.5, 89.0, 89, 100, 88.0, 1, 84.0);

INSERT INTO placement_indicators (id, student_id, coding_score, aptitude_score, mock_interviews_completed, technical_skills_count, soft_skills_rating, internship_status, projects_count)
VALUES ('place-seed-002', 'stu-seed-002', 46.0, 68.0, 0, 3, 3.5, 'None', 1);

INSERT INTO student_scores (id, student_id, academic_index, engagement_index, placement_index, success_score, attendance_margin, percentile_rank)
VALUES ('score-seed-002', 'stu-seed-002', 91.95, 74.80, 38.80, 70.86, 18, 64.0);

INSERT INTO risk_assessments (id, student_id, academic_risk_level, academic_risk_prob, placement_risk_level, placement_risk_prob, overall_risk_tier, persona_cluster, persona_label, top_risk_driver)
VALUES ('risk-seed-002', 'stu-seed-002', 'Low', 0.08, 'Medium', 0.48, 'Medium', 1, 'Unpolished Gems', 'Coding Readiness Shortfall (46.0%)');

INSERT INTO interventions (id, student_id, type, priority, status, assigned_to, reason, recommended_action)
VALUES ('int-seed-001', 'stu-seed-002', 'Coding Bootcamp', 'Medium', 'Proposed', 'Career & Placement Cell', 'High academic aptitude but lacks hands-on coding proficiency.', 'Enroll in Algorithmic Problem Solving Bootcamp.');

-- Archetype 3: Disengaged Talent (Cluster 2, High Risk by Attendance Deficit)
INSERT INTO students (id, student_id, first_name, last_name, email, department, semester, cohort_year, mentor_name, avatar_url, status)
VALUES ('stu-seed-003', 'STU-2024-003', 'Kabir', 'Verma', 'kabir.verma@campus.edu', 'Data Science', 6, 2024, 'Dr. Arvind Krishnan', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'At-Risk');

INSERT INTO academic_indicators (id, student_id, cgpa, backlogs, internal_exam_avg, attendance_pct, attended_classes, total_classes, assignment_completion_pct, certifications_count, lab_performance_score)
VALUES ('acad-seed-003', 'stu-seed-003', 7.40, 0, 74.0, 64.0, 64, 100, 70.0, 2, 88.0);

INSERT INTO placement_indicators (id, student_id, coding_score, aptitude_score, mock_interviews_completed, technical_skills_count, soft_skills_rating, internship_status, projects_count)
VALUES ('place-seed-003', 'stu-seed-003', 88.0, 84.0, 2, 7, 4.1, 'Completed', 2);

INSERT INTO student_scores (id, student_id, academic_index, engagement_index, placement_index, success_score, attendance_margin, percentile_rank)
VALUES ('score-seed-003', 'stu-seed-003', 81.80, 61.60, 72.40, 72.92, -15, 68.0);

INSERT INTO risk_assessments (id, student_id, academic_risk_level, academic_risk_prob, placement_risk_level, placement_risk_prob, overall_risk_tier, persona_cluster, persona_label, top_risk_driver)
VALUES ('risk-seed-003', 'stu-seed-003', 'High', 0.62, 'Low', 0.12, 'High', 2, 'Disengaged Talents', 'Attendance Deficit (64.0%)');

INSERT INTO interventions (id, student_id, type, priority, status, assigned_to, reason, recommended_action)
VALUES ('int-seed-002', 'stu-seed-003', 'Attendance Counseling', 'High', 'Active', 'Dr. Arvind Krishnan', 'Attendance margin is -15 classes below statutory 75% cutoff.', 'Execute biometric attendance recovery agreement.');

-- Archetype 4: Critical Support Needed (Cluster 3, High Risk)
INSERT INTO students (id, student_id, first_name, last_name, email, department, semester, cohort_year, mentor_name, avatar_url, status)
VALUES ('stu-seed-004', 'STU-2024-004', 'Rohan', 'Mukherjee', 'rohan.mukherjee@campus.edu', 'Information Technology', 6, 2024, 'Prof. Priya Nair', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'At-Risk');

INSERT INTO academic_indicators (id, student_id, cgpa, backlogs, internal_exam_avg, attendance_pct, attended_classes, total_classes, assignment_completion_pct, certifications_count, lab_performance_score)
VALUES ('acad-seed-004', 'stu-seed-004', 5.40, 3, 52.0, 58.0, 58, 100, 54.0, 0, 58.0);

INSERT INTO placement_indicators (id, student_id, coding_score, aptitude_score, mock_interviews_completed, technical_skills_count, soft_skills_rating, internship_status, projects_count)
VALUES ('place-seed-004', 'stu-seed-004', 38.0, 44.0, 0, 2, 2.9, 'None', 1);

INSERT INTO student_scores (id, student_id, academic_index, engagement_index, placement_index, success_score, attendance_margin, percentile_rank)
VALUES ('score-seed-004', 'stu-seed-004', 49.80, 44.80, 28.40, 41.88, -23, 8.0);

INSERT INTO risk_assessments (id, student_id, academic_risk_level, academic_risk_prob, placement_risk_level, placement_risk_prob, overall_risk_tier, persona_cluster, persona_label, top_risk_driver)
VALUES ('risk-seed-004', 'stu-seed-004', 'High', 0.91, 'High', 0.88, 'High', 3, 'Critical Academic Support Needed', '3 Active Backlogs');

INSERT INTO interventions (id, student_id, type, priority, status, assigned_to, reason, recommended_action)
VALUES ('int-seed-003', 'stu-seed-004', 'Remedial Tutoring', 'High', 'Active', 'Prof. Priya Nair', 'Multiple active backlogs (3) and severe attendance deficiency.', 'Enroll in mandatory remedial coursework with weekly mentor reviews.');
