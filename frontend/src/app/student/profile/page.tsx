import { StudentProfileView } from "@/modules/student/StudentProfileView";

export const metadata = {
  title: "My Student Profile | Smart Campus Intelligence",
  description: "360-degree student portfolio, academic standing, verified credentials, and engagement.",
};

export default function StudentProfilePage() {
  return <StudentProfileView />;
}
