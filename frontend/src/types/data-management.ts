export interface DataSourceStatus {
  sourceName: string;
  sourceType: "SIS" | "LMS Canvas" | "Biometric Attendance" | "HackerRank / Coding" | "Survey Forms" | "Placement Cell";
  lastSyncTimestamp: string;
  recordsSynced: number;
  coveragePercentage: number;
  status: "Healthy" | "Sync Delayed" | "Error";
}

export interface DataQualityAudit {
  overallCompleteness: number;
  duplicateRecordsDetected: number;
  missingIndicatorFields: number;
  unresolvedGrievances: number;
}
