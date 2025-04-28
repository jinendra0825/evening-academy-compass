
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Assignment, Course } from "@/types/assignments";
import { toast } from "@/components/ui/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { TeacherAssignmentView } from "@/components/assignments/TeacherAssignmentView";
import { CreateAssignmentForm } from "@/components/assignments/CreateAssignmentForm";
import { StudentAssignmentView } from "@/components/assignments/StudentAssignmentView";
import type { AssignmentSubmission } from "@/types/supabase";

export default function AssignmentManagement() {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const [activeTab, setActiveTab] = useState("view");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentSubmissions, setStudentSubmissions] = useState<AssignmentSubmission[]>([]);

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
    if (!isTeacher && user?.id) {
      fetchStudentSubmissions();
    }
  }, [isTeacher, user?.id]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Could not load assignments",
        description: "There was an error loading assignments. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudentSubmissions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', user.id);

      if (error) throw error;
      setStudentSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching student submissions:', error);
    }
  };

  const handleCreateAssignment = async (formData: {
    title: string;
    description: string;
    due_date: string;
    course_id: string;
  }, file: File | null) => {
    if (!file) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `assignments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assignments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicURLData } = supabase.storage
        .from('assignments')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('assignments').insert({
        ...formData,
        file_url: publicURLData.publicUrl,
        file_name: file.name,
        file_type: file.type
      });

      if (insertError) throw insertError;

      toast({
        title: "Assignment created",
        description: "Assignment was successfully created and uploaded.",
      });

      fetchAssignments();
      setActiveTab("view");

    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Failed to create assignment",
        description: "There was an error creating your assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitAssignment = async (assignmentId: string, file: File) => {
    if (!user?.id) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}-${user.id}.${fileExt}`;
      const filePath = `submissions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicURLData } = supabase.storage
        .from('submissions')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('assignment_submissions').insert({
        assignment_id: assignmentId,
        student_id: user.id,
        file_url: publicURLData.publicUrl,
        file_name: file.name,
        file_type: file.type,
        submitted_at: new Date().toISOString()
      });

      if (insertError) throw insertError;

      toast({
        title: "Assignment submitted",
        description: "Your assignment was successfully submitted.",
      });

      fetchStudentSubmissions();

    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Failed to submit assignment",
        description: "There was an error submitting your assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadFile = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isSubmitted = (assignmentId: string) => {
    return studentSubmissions.some(sub => sub.assignment_id === assignmentId);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Assignments
          </h1>
        </div>

        {isTeacher ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="view">View Assignments</TabsTrigger>
              <TabsTrigger value="create">Create Assignment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="view">
              <TeacherAssignmentView
                assignments={assignments}
                courses={courses}
                loading={loading}
                onDownload={downloadFile}
              />
            </TabsContent>

            <TabsContent value="create">
              <CreateAssignmentForm
                courses={courses}
                uploading={uploading}
                onSubmit={handleCreateAssignment}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <StudentAssignmentView
            assignments={assignments}
            courses={courses}
            loading={loading}
            uploading={uploading}
            onSubmit={handleSubmitAssignment}
            onDownload={downloadFile}
            isSubmitted={isSubmitted}
          />
        )}
      </div>
    </MainLayout>
  );
}
