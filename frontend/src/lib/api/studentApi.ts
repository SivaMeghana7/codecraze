import { apiClient } from "./client";
import {
  StudentDashboardResponse,
  AcademicAnalyticsData,
  AttendanceAnalyticsData,
  PlacementAnalyticsData,
  RecommendationItem,
  WeeklyGoal,
  StudentProfile,
} from "@/types/student";
import {
  mockStudentDashboardData,
  mockAcademicData,
  mockAttendanceData,
  mockPlacementData,
  mockRecommendations,
  mockWeeklyGoals,
  mockStudentProfile,
} from "../mockData";

export const studentApi = {
  /**
   * GET /api/student/dashboard
   * Fetches overall dashboard summary (Profile, KPIs, summaries)
   */
  async getDashboardSummary() {
    return apiClient<StudentDashboardResponse>(
      "/api/student/dashboard",
      { method: "GET" },
      mockStudentDashboardData
    );
  },

  /**
   * GET /api/student/academics
   * Fetches detailed academic trends, subject-level grades, and backlogs
   */
  async getAcademics() {
    return apiClient<AcademicAnalyticsData>(
      "/api/student/academics",
      { method: "GET" },
      mockAcademicData
    );
  },

  /**
   * GET /api/student/attendance
   * Fetches attendance analytics, margins, and LMS engagement
   */
  async getAttendance() {
    return apiClient<AttendanceAnalyticsData>(
      "/api/student/attendance",
      { method: "GET" },
      mockAttendanceData
    );
  },

  /**
   * GET /api/student/placement
   * Fetches placement readiness breakdown, skills, and checklist
   */
  async getPlacement() {
    return apiClient<PlacementAnalyticsData>(
      "/api/student/placement",
      { method: "GET" },
      mockPlacementData
    );
  },

  /**
   * GET /api/student/recommendations
   * Fetches personalized AI recommendations and weekly goals
   */
  async getRecommendations() {
    return apiClient<{ recommendations: RecommendationItem[]; weeklyGoals: WeeklyGoal[] }>(
      "/api/student/recommendations",
      { method: "GET" },
      { recommendations: mockRecommendations, weeklyGoals: mockWeeklyGoals }
    );
  },

  /**
   * GET /api/student/profile
   * Fetches 360-degree student profile
   */
  async getProfile() {
    return apiClient<StudentProfile>(
      "/api/student/profile",
      { method: "GET" },
      mockStudentProfile
    );
  },

  /**
   * PATCH /api/student/goals/{goalId}
   * Updates completion status of a weekly goal
   */
  async toggleGoalStatus(goalId: string, completed: boolean) {
    return apiClient<{ success: boolean; goalId: string; completed: boolean }>(
      `/api/student/goals/${goalId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ completed }),
      },
      { success: true, goalId, completed }
    );
  },

  /**
   * PATCH /api/student/recommendations/{recId}
   * Marks recommendation as completed or dismissed
   */
  async updateRecommendationStatus(recId: string, status: "Active" | "Completed" | "Dismissed") {
    return apiClient<{ success: boolean; recId: string; status: string }>(
      `/api/student/recommendations/${recId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
      { success: true, recId, status }
    );
  },
};
