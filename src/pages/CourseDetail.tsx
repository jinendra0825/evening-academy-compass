
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Course } from "@/types/models";
import { CourseHeader } from "@/components/courses/CourseHeader";
import { CourseStats } from "@/components/courses/CourseStats";
import { CourseContent } from "@/components/courses/CourseContent";
import { EditCourseDialog } from "@/components/courses/EditCourseDialog";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedCourse, setEditedCourse] = useState({
    name: "",
    code: "",
    description: "",
    room: ""
  });

  const fetchCourseDetails = async () => {
    if (!courseId) return;

    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (error) throw error;
      
      // Ensure materials is properly parsed as an array of objects
      const parsedMaterials = Array.isArray(data.materials) 
        ? data.materials 
        : (typeof data.materials === 'string' ? JSON.parse(data.materials) : []);
      
      setCourse({
        ...data,
        materials: parsedMaterials,
        teacherId: data.teacher_id // Make sure to map teacher_id to teacherId for compatibility
      });
      
      setEditedCourse({
        name: data.name,
        code: data.code,
        description: data.description || "",
        room: data.room || ""
      });
    } catch (error) {
      console.error("Error fetching course details:", error);
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateCourse = async () => {
    try {
      const { error } = await supabase
        .from("courses")
        .update({
          name: editedCourse.name,
          code: editedCourse.code,
          description: editedCourse.description,
          room: editedCourse.room
        })
        .eq("id", courseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course updated successfully"
      });

      setEditDialogOpen(false);
      fetchCourseDetails();
    } catch (error) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive"
      });
    }
  };

  // Check if the current user is the teacher of this course
  const isTeacher = user?.role === "teacher" && course?.teacher_id === user?.id;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading course details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p>The course you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <CourseHeader 
          course={course}
          isTeacher={isTeacher}
          onEditClick={() => setEditDialogOpen(true)}
        />
        
        <CourseStats course={course} />
        
        <CourseContent
          course={course}
          isTeacher={isTeacher}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onMaterialsUpdate={fetchCourseDetails}
        />
        
        <EditCourseDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          course={editedCourse}
          onCourseChange={handleInputChange}
          onSave={handleUpdateCourse}
        />
      </div>
    </MainLayout>
  );
}
