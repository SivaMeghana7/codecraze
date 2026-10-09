import { RiskLevel, PersonaType } from "./common";

export interface StudentRosterItem {
  id: string;
  studentId: string;
  name: string;
  avatarUrl: string;
  department: string;
  semester: number;
  cgpa: number;
  attendancePercentage: number;
  academicRisk: RiskLevel;
  placementRisk: RiskLevel;
  persona: PersonaType;
  lastActive: string;
  pendingInterventions: number;
}

export interface ShapFactor {
  featureName: string;
  attributionValue: number; // positive = pushes risk higher, negative = lowers risk
  featureDisplay: string;
  impactLabel: "Increases Risk" | "Reduces Risk";
}

export interface EarlyWarningItem {
  id: string;
  studentName: string;
  studentId: string;
  triggerType: "Attendance Drop" | "Midterm Fail" | "LMS Inactive" | "Multiple Backlogs";
  description: string;
  severity: "Critical" | "Warning";
  timestamp: string;
}
