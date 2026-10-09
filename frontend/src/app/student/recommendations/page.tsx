import { StudentRecommendationsView } from "@/modules/student/StudentRecommendationsView";

export const metadata = {
  title: "Recommendations & Goals | Smart Campus Intelligence",
  description: "Personalized explainable actions and weekly goal milestone tracking.",
};

export default function StudentRecommendationsPage() {
  return <StudentRecommendationsView />;
}
