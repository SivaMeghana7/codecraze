import { RiskLevel, PersonaType } from "./common";

export interface StudentProfile {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  department: string;
  degree: string;
  academicYear: string;
  semester: number;
  section: string;
  batch: string;
  mentorName: string;
  mentorEmail: string;
  persona: PersonaType;
  bio: string;
  address: string;
  admissionCategory: string;
}

export interface KpiCardData {
  title: string;
  value: number | string;
  unit?: string;
  explanation: string;
  riskLevel?: RiskLevel;
  previousValue?: number | string;
  changeDirection?: "up" | "down" | "neutral";
  changeText?: string;
  target?: number;
  progressValue?: number;
}

export interface SemesterTrend {
  semester: string;
  gpa: number;
  cgpa: number;
  credits: number;
  classAvg: number;
}

export interface SubjectMark {
  code: string;
  name: string;
  credits: number;
  internalMarks: number;
  maxInternal: number;
  midtermMarks: number;
  maxMidterm: number;
  assignmentMarks: number;
  maxAssignment: number;
  totalMarks: number;
  maxTotal: number;
  grade: string;
  gradePoint: number;
  attendancePercentage: number;
  status: "Passed" | "Active Backlog";
  instructor: string;
}

export interface AcademicAnalyticsData {
  currentCgpa: number;
  previousSemesterCgpa: number;
  currentSemesterGpa: number;
  totalCreditsEarned: number;
  activeBacklogs: number;
  strongestSubjects: string[];
  weakestSubjects: string[];
  trends: SemesterTrend[];
  currentSubjects: SubjectMark[];
  pastSemesters: {
    semesterNumber: number;
    gpa: number;
    subjects: SubjectMark[];
  }[];
}

export interface SubjectAttendance {
  code: string;
  name: string;
  attended: number;
  conducted: number;
  percentage: number;
  threshold: number;
  status: "Safe" | "Warning" | "Critical";
  missableClassesCount: number; // Positive if can miss, negative if needed to recover
  recommendation: string;
}

export interface LmsActivityData {
  loginFrequencyDaysPerWeek: number;
  weeklyHoursSpent: number;
  assignmentCompletionRate: number;
  pendingAssignmentsCount: number;
  submittedOnTimeCount: number;
  lateSubmissionsCount: number;
  dailyLogins: { day: string; hours: number; modulesCompleted: number }[];
  recentActivities: {
    id: string;
    course: string;
    title: string;
    type: "Quiz" | "Assignment" | "Lab" | "Lecture Video";
    status: "Completed" | "Pending" | "Overdue";
    dueDate: string;
    score?: string;
  }[];
}

export interface AttendanceAnalyticsData {
  overallPercentage: number;
  configuredThreshold: number;
  totalClassesAttended: number;
  totalClassesConducted: number;
  subjects: SubjectAttendance[];
  belowThresholdCount: number;
  marginDaysBeforeCritical: number;
  lms: LmsActivityData;
}

export interface SkillItem {
  id: string;
  name: string;
  levelPercentage: number;
  category: "Technical" | "Soft" | "Domain";
  proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  verifiedDate?: string;
}

export interface PlacementAssessmentBreakdown {
  aptitudeScore: number;
  codingScore: number;
  mockInterviewScore: number;
  technicalSkillsScore: number;
  softSkillsScore: number;
}

export interface PlacementChecklistItem {
  id: string;
  title: string;
  category: "Resume" | "Coding" | "Aptitude" | "System Design" | "Mock Interview";
  dueDate: string;
  completed: boolean;
  priority: "High" | "Medium" | "Low";
}

export interface CareerMatchVector {
  roleTitle: string;
  matchPercentage: number;
  matchStatus: "Strong Match" | "Moderate Match" | "Development Needed";
  topMatchingSkills: string[];
  skillsToAcquire: string[];
  industryDemand: "High" | "Very High" | "Moderate";
}

export interface PlacementAnalyticsData {
  overallReadinessScore: number;
  previousPeriodScore: number;
  disclaimer: string;
  assessmentScores: PlacementAssessmentBreakdown;
  skills: SkillItem[];
  strongestSkills: string[];
  skillsRequiringImprovement: { name: string; gapDescription: string; recommendedAction: string }[];
  checklist: PlacementChecklistItem[];
  careerMatches: CareerMatchVector[];
}

export type RecommendationCategory =
  | "Academics"
  | "Attendance"
  | "LMS and Learning"
  | "Placement"
  | "Technical Skills"
  | "Soft Skills"
  | "Engagement";

export interface RecommendationItem {
  id: string;
  title: string;
  category: RecommendationCategory;
  priority: "High" | "Medium" | "Low";
  reason: string;
  suggestedAction: string;
  targetDate: string;
  status: "Active" | "Completed" | "Dismissed";
  relatedMetric: string;
  metricCurrentValue: string;
  actionButtonLabel: string;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  category: string;
  targetCount: number;
  currentCount: number;
  unit: string;
  completed: boolean;
  deadline: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  skillsTagged: string[];
}

export interface EngagementItem {
  id: string;
  activityTitle: string;
  category: "Hackathon" | "Club Activity" | "Workshop" | "Volunteering" | "Sports";
  role: string;
  date: string;
  achievementBadge?: string;
  verified: boolean;
}

export interface StudentDashboardResponse {
  profile: StudentProfile;
  kpis: {
    successScore: KpiCardData;
    academicRisk: KpiCardData;
    placementReadiness: KpiCardData;
    attendanceRate: KpiCardData;
  };
  academics: AcademicAnalyticsData;
  attendance: AttendanceAnalyticsData;
  placement: PlacementAnalyticsData;
  recommendations: RecommendationItem[];
  weeklyGoals: WeeklyGoal[];
  certifications: CertificationItem[];
  engagement: EngagementItem[];
}
