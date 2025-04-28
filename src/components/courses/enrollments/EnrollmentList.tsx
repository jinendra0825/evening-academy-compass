
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserCheck, UserMinus } from "lucide-react";

interface Enrollment {
  id: string;
  student_id: string;
  status: string;
  student?: {
    name: string;
    email: string;
  };
}

interface EnrollmentListProps {
  enrollments: Enrollment[];
  onUpdateStatus: (enrollmentId: string, status: string) => void;
}

export const EnrollmentList = ({ enrollments, onUpdateStatus }: EnrollmentListProps) => {
  if (enrollments.length === 0) {
    return <p className="text-muted-foreground">No pending enrollment requests</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {enrollments.map((enrollment) => (
          <TableRow key={enrollment.id}>
            <TableCell>{enrollment.student?.name || "Unknown"}</TableCell>
            <TableCell>{enrollment.student?.email || "No email"}</TableCell>
            <TableCell className="capitalize">{enrollment.status}</TableCell>
            <TableCell className="text-right">
              {enrollment.status === "pending" && (
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    onClick={() => onUpdateStatus(enrollment.id, "approved")}
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onUpdateStatus(enrollment.id, "rejected")}
                  >
                    <UserMinus className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
