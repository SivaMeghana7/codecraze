-- ============================================================================
-- Smart Campus Intelligence: Database Schema
-- Compatible with PostgreSQL 14+ and SQLite 3.35+
-- ============================================================================

-- Table 1: Students Master
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(32) UNIQUE NOT NULL,
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64) NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    department VARCHAR(64) NOT NULL,
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
    cohort_year INTEGER NOT NULL,
    mentor_name VARCHAR(128),
    avatar_url VARCHAR(255),
    status VARCHAR(32) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Academic Indicators
CREATE TABLE IF NOT EXISTS academic_indicators (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL,
    cgpa REAL NOT NULL CHECK (cgpa >= 0.0 AND cgpa <= 10.0),
    backlogs INTEGER NOT NULL DEFAULT 0 CHECK (backlogs >= 0),
    internal_exam_avg REAL NOT NULL CHECK (internal_exam_avg >= 0.0 AND internal_exam_avg <= 100.0),
    attendance_pct REAL NOT NULL CHECK (attendance_pct >= 0.0 AND attendance_pct <= 100.0),
    attended_classes INTEGER NOT NULL CHECK (attended_classes >= 0),
    total_classes INTEGER NOT NULL CHECK (total_classes >= 0),
    assignment_completion_pct REAL NOT NULL CHECK (assignment_completion_pct >= 0.0 AND assignment_completion_pct <= 100.0),
    certifications_count INTEGER NOT NULL DEFAULT 0 CHECK (certifications_count >= 0),
    lab_performance_score REAL DEFAULT 75.0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Table 3: Placement Indicators
CREATE TABLE IF NOT EXISTS placement_indicators (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL,
    coding_score REAL NOT NULL CHECK (coding_score >= 0.0 AND coding_score <= 100.0),
    aptitude_score REAL NOT NULL CHECK (aptitude_score >= 0.0 AND aptitude_score <= 100.0),
    mock_interviews_completed INTEGER NOT NULL DEFAULT 0 CHECK (mock_interviews_completed >= 0),
    technical_skills_count INTEGER NOT NULL DEFAULT 0,
    soft_skills_rating REAL NOT NULL DEFAULT 3.5 CHECK (soft_skills_rating >= 1.0 AND soft_skills_rating <= 5.0),
    internship_status VARCHAR(32) DEFAULT 'None',
    projects_count INTEGER NOT NULL DEFAULT 1,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Table 4: Student Scores (Formula-driven continuous 0-100 index)
CREATE TABLE IF NOT EXISTS student_scores (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL UNIQUE,
    academic_index REAL NOT NULL CHECK (academic_index >= 0.0 AND academic_index <= 100.0),
    engagement_index REAL NOT NULL CHECK (engagement_index >= 0.0 AND engagement_index <= 100.0),
    placement_index REAL NOT NULL CHECK (placement_index >= 0.0 AND placement_index <= 100.0),
    success_score REAL NOT NULL CHECK (success_score >= 0.0 AND success_score <= 100.0),
    attendance_margin INTEGER NOT NULL,
    percentile_rank REAL,
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Table 5: Risk Assessments & Personas
CREATE TABLE IF NOT EXISTS risk_assessments (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL UNIQUE,
    academic_risk_level VARCHAR(16) NOT NULL CHECK (academic_risk_level IN ('Low', 'Medium', 'High')),
    academic_risk_prob REAL NOT NULL CHECK (academic_risk_prob >= 0.0 AND academic_risk_prob <= 1.0),
    placement_risk_level VARCHAR(16) NOT NULL CHECK (placement_risk_level IN ('Low', 'Medium', 'High')),
    placement_risk_prob REAL NOT NULL CHECK (placement_risk_prob >= 0.0 AND placement_risk_prob <= 1.0),
    overall_risk_tier VARCHAR(16) NOT NULL CHECK (overall_risk_tier IN ('Low', 'Medium', 'High')),
    persona_cluster INTEGER NOT NULL CHECK (persona_cluster IN (0, 1, 2, 3)),
    persona_label VARCHAR(64) NOT NULL,
    top_risk_driver VARCHAR(128),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Table 6: Interventions
CREATE TABLE IF NOT EXISTS interventions (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL,
    type VARCHAR(64) NOT NULL,
    priority VARCHAR(16) NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
    status VARCHAR(32) NOT NULL DEFAULT 'Proposed' CHECK (status IN ('Proposed', 'Active', 'Completed', 'Declined')),
    assigned_to VARCHAR(128),
    reason TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    outcome_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Table 7: Faculty Feedback
CREATE TABLE IF NOT EXISTS feedback (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL,
    faculty_id VARCHAR(64) NOT NULL,
    faculty_name VARCHAR(128) NOT NULL,
    comments TEXT NOT NULL,
    rating INTEGER DEFAULT 4 CHECK (rating >= 1 AND rating <= 5),
    tags VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Indexes for lightning queries
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_semester ON students(semester);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_risk_overall ON risk_assessments(overall_risk_tier);
CREATE INDEX IF NOT EXISTS idx_risk_persona ON risk_assessments(persona_cluster);
CREATE INDEX IF NOT EXISTS idx_scores_success ON student_scores(success_score);
CREATE INDEX IF NOT EXISTS idx_interventions_student ON interventions(student_id);
CREATE INDEX IF NOT EXISTS idx_interventions_status ON interventions(status);
