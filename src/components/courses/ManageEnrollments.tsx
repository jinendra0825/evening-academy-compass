
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCheck, UserMinus } from "lucide-react";

interface ManageEnrollmentsProps {
  courseId: string;
}

interface Enrollment {
  id: string;
  student_id: string;
  status: string;
  student?: {
    name: string;
    email: string;
  };
}

export const ManageEnrollments = ({ courseId }: ManageEnrollmentsProps) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, [courseId]);

  const loadEnrollments = async () => {
    try {
      // First get all enrollments for this course
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("course_id", courseId);

      if (enrollmentsError) throw enrollmentsError;
      
      if (!enrollmentsData || enrollmentsData.length === 0) {
        setEnrollments([]);
        setLoading(false);
        return;
      }

      // Get student profiles data
      const studentIds = enrollmentsData.map(enrollment => enrollment.student_id);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", studentIds);
        
      if (profilesError) throw profilesError;

      // Combine enrollment data with profile data
      const enrichedEnrollments = enrollmentsData.map(enrollment => {
        const studentProfile = profilesData?.find(profile => profile.id === enrollment.student_id);
        return {
          ...enrollment,
          student: studentProfile ? {
            name: studentProfile.name || "Unknown",
            email: studentProfile.email || "No email"
          } : {
            name: "Unknown",
            email: "No email"
          }
        };
      });

      setEnrollments(enrichedEnrollments);
    } catch (error) {
      console.error("Error loading enrollments:", error);
      toast({
        title: "Error",
        description: "Failed to load student enrollments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("course_enrollments")
        .update({ status })
        .eq("id", enrollmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Student ${status} successfully`,
      });

      loadEnrollments();
    } catch (error) {
      console.error("Error updating enrollment:", error);
      toast({
        title: "Error",
        description: "Failed to update enrollment status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading enrollments...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Student Enrollments</h3>
      {enrollments.length === 0 ? (
        <p className="text-muted-foreground">No pending enrollment requests</p>
      ) : (
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
                        onClick={() => updateEnrollmentStatus(enrollment.id, "approved")}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateEnrollmentStatus(enrollment.id, "rejected")}
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
      )}
    </div>
  );
};
