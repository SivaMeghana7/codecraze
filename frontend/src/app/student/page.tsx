import { StudentOverviewView } from "@/modules/student/StudentOverviewView";

export const metadata = {
  title: "Student Overview | Smart Campus Intelligence",
  description: "Comprehensive student overview dashboard tracking success score, risk, and placement velocity.",
};

export default function StudentOverviewPage() {
  return <StudentOverviewView />;
}
