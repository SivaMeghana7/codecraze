import { StudentLmsView } from "@/modules/student/StudentLmsView";

export const metadata = {
  title: "LMS & Coursework | Smart Campus Intelligence",
  description: "Canvas & Moodle integrated LMS tracking assignment completion, reading hours, and module progression.",
};

export default function StudentLmsPage() {
  return <StudentLmsView />;
}
