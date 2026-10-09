import { StudentAcademicsView } from "@/modules/student/StudentAcademicsView";

export const metadata = {
  title: "Academic Performance | Smart Campus Intelligence",
  description: "Semester grade trajectories, marks distribution, and backlog audits.",
};

export default function StudentAcademicsPage() {
  return <StudentAcademicsView />;
}
