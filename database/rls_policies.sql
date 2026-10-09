-- ============================================================================
-- Smart Campus Intelligence: Row-Level Security (RLS) Policies
-- PostgreSQL 14+ RLS Specification for Enterprise RBAC (Admin, Faculty, Student)
-- ============================================================================

-- Enable RLS on core student data tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 1. ADMIN POLICIES (Full Access across all departments)
-- ----------------------------------------------------------------------------
CREATE POLICY admin_full_access_students ON students
    FOR ALL
    TO authenticated
    USING (current_setting('request.jwt.claim.role', true) = 'admin')
    WITH CHECK (current_setting('request.jwt.claim.role', true) = 'admin');

CREATE POLICY admin_full_access_scores ON student_scores
    FOR ALL
    TO authenticated
    USING (current_setting('request.jwt.claim.role', true) = 'admin');

CREATE POLICY admin_full_access_interventions ON interventions
    FOR ALL
    TO authenticated
    USING (current_setting('request.jwt.claim.role', true) = 'admin');

-- ----------------------------------------------------------------------------
-- 2. FACULTY POLICIES (Departmental / Assigned Cohort Access)
-- ----------------------------------------------------------------------------
CREATE POLICY faculty_department_students ON students
    FOR SELECT
    TO authenticated
    USING (
        current_setting('request.jwt.claim.role', true) = 'faculty'
        AND (
            department = current_setting('request.jwt.claim.department', true)
            OR mentor_name = current_setting('request.jwt.claim.name', true)
        )
    );

CREATE POLICY faculty_interventions ON interventions
    FOR ALL
    TO authenticated
    USING (
        current_setting('request.jwt.claim.role', true) = 'faculty'
        AND student_id IN (
            SELECT id FROM students WHERE department = current_setting('request.jwt.claim.department', true)
        )
    );

CREATE POLICY faculty_feedback ON feedback
    FOR ALL
    TO authenticated
    USING (
        current_setting('request.jwt.claim.role', true) = 'faculty'
    );

-- ----------------------------------------------------------------------------
-- 3. STUDENT POLICIES (Self-Access Only: Privacy-Preserving)
-- ----------------------------------------------------------------------------
CREATE POLICY student_self_view ON students
    FOR SELECT
    TO authenticated
    USING (
        current_setting('request.jwt.claim.role', true) = 'student'
        AND id = current_setting('request.jwt.claim.student_id', true)
    );

CREATE POLICY student_self_academic ON academic_indicators
    FOR SELECT
    TO authenticated
    USING (
        current_setting('request.jwt.claim.role', true) = 'student'
        AND student_id = current_setting('request.jwt.claim.student_id', true)
    );

CREATE POLICY student_self_scores ON student_scores
    FOR SELECT
    TO authenticated
    USING (
        current_setting('request.jwt.claim.role', true) = 'student'
        AND student_id = current_setting('request.jwt.claim.student_id', true)
    );

CREATE POLICY student_self_interventions ON interventions
    FOR SELECT
    TO authenticated
    USING (
        current_setting('request.jwt.claim.role', true) = 'student'
        AND student_id = current_setting('request.jwt.claim.student_id', true)
    );
