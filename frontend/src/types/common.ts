export type UserRole = "student" | "faculty" | "admin";

export type RiskLevel = "Low" | "Moderate" | "High";

export type PersonaType =
  | "Consistent Achiever"
  | "Unpolished Gem"
  | "Resilient Try-Hard"
  | "Ghost / Disengaged";

export interface StatusStateProps {
  type?: "empty" | "loading" | "error";
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}
