import { RiskLevel, PersonaType } from "./common";

export interface AdminMetrics {
  totalStudents: number;
  averageCgpa: number;
  overallAttendanceRate: number;
  placementRateProjected: number;
  highRiskCount: number;
  moderateRiskCount: number;
  lowRiskCount: number;
}

export interface DepartmentMetric {
  department: string;
  headOfDept: string;
  studentCount: number;
  avgCgpa: number;
  avgAttendance: number;
  activeBacklogsCount: number;
  placementReadinessAvg: number;
}

export interface PlacementFunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface CohortForecastPoint {
  month: string;
  historicalPlaced: number | null;
  predictedPlaced: number;
  lowerBound: number;
  upperBound: number;
}
