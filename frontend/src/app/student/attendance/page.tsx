import { StudentAttendanceView } from "@/modules/student/StudentAttendanceView";

export const metadata = {
  title: "Attendance & Learning | Smart Campus Intelligence",
  description: "Attendance ledger, safe margin buffers, and LMS study activity.",
};

export default function StudentAttendancePage() {
  return <StudentAttendanceView />;
}
