
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Book, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Course } from "@/types/models";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;

      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (error) throw error;
        setCourse(data);
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

    fetchCourseDetails();
  }, [courseId]);

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

  const isTeacher = user?.role === "teacher";

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Book className="h-8 w-8" />
            {course.name}
          </h1>
          {isTeacher && (
            <Button>Edit Course</Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Card className="w-full md:w-auto md:flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Course Code</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{course.code}</p>
            </CardContent>
          </Card>
          
          <Card className="w-full md:w-auto md:flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{course.room || "Not specified"}</p>
            </CardContent>
          </Card>
          
          <Card className="w-full md:w-auto md:flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {course.enrolledStudents?.length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Description</CardTitle>
                <CardDescription>Overview and details about this course</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{course.description || "No description provided."}</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="materials" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Materials</CardTitle>
                <CardDescription>Lecture notes, readings, and resources</CardDescription>
              </CardHeader>
              <CardContent>
                {isTeacher ? (
                  <div className="space-y-4">
                    <Button>
                      <FileText className="mr-2 h-4 w-4" />
                      Upload Material
                    </Button>
                    <p className="text-sm text-muted-foreground">No materials have been uploaded yet.</p>
                  </div>
                ) : (
                  <p>No course materials available yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="students" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Students
                </CardTitle>
                <CardDescription>Students enrolled in this course</CardDescription>
              </CardHeader>
              <CardContent>
                {isTeacher ? (
                  <div className="space-y-4">
                    <Button>Manage Students</Button>
                    <p className="text-sm text-muted-foreground">
                      No students are currently enrolled in this course.
                    </p>
                  </div>
                ) : (
                  <p>No student information available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
