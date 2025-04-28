
import { useEnrollmentsManagement } from "@/hooks/useEnrollmentsManagement";
import { EnrollmentList } from "./enrollments/EnrollmentList";

interface ManageEnrollmentsProps {
  courseId: string;
}

export const ManageEnrollments = ({ courseId }: ManageEnrollmentsProps) => {
  const { enrollments, loading, updateEnrollmentStatus } = useEnrollmentsManagement(courseId);

  if (loading) {
    return <div>Loading enrollments...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Student Enrollments</h3>
      <EnrollmentList 
        enrollments={enrollments}
        onUpdateStatus={updateEnrollmentStatus}
      />
    </div>
  );
};
