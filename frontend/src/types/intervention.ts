import { RiskLevel } from "./common";

export type InterventionStatus = "Pending" | "In Progress" | "Completed" | "Escalated";

export interface InterventionRecord {
  id: string;
  studentId: string;
  studentName: string;
  mentorName: string;
  category: "Academic Support" | "Attendance Counseling" | "Mental Health / Well-being" | "Placement Prep";
  status: InterventionStatus;
  dateAssigned: string;
  targetCompletionDate: string;
  notes: string;
  preInterventionScore: number;
  postInterventionScore?: number;
  scoreDelta?: number;
}
