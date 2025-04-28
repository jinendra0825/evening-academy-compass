
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface Enrollment {
  id: string;
  student_id: string;
  status: string;
  student?: {
    name: string;
    email: string;
  };
}

export const useEnrollmentsManagement = (courseId: string) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEnrollments = async () => {
    try {
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

      const studentIds = enrollmentsData.map(enrollment => enrollment.student_id);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", studentIds);
        
      if (profilesError) throw profilesError;

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

  useEffect(() => {
    loadEnrollments();
  }, [courseId]);

  return {
    enrollments,
    loading,
    updateEnrollmentStatus
  };
};
