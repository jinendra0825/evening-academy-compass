
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
import { ManageEnrollments } from "@/components/courses/ManageEnrollments";
import { ManageMaterials } from "@/components/courses/ManageMaterials";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

  console.log("User role:", user?.role);
  console.log("Course teacher_id:", course?.teacher_id);
  console.log("User id:", user?.id);
  console.log("Is teacher:", isTeacher);

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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Book className="h-8 w-8" />
            {course.name}
          </h1>
          {isTeacher && (
            <Button onClick={() => setEditDialogOpen(true)}>Edit Course</Button>
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
                  <ManageMaterials
                    courseId={course.id}
                    materials={course.materials || []}
                    onMaterialsUpdate={fetchCourseDetails}
                  />
                ) : (
                  course.materials && course.materials.length > 0 ? (
                    <ul className="space-y-2">
                      {course.materials.map((material, index) => (
                        <li key={index}>
                          <a
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {material.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No course materials available yet.</p>
                  )
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
                <CardDescription>Manage student enrollments</CardDescription>
              </CardHeader>
              <CardContent>
                {isTeacher ? (
                  <ManageEnrollments courseId={course.id} />
                ) : (
                  <p>Only teachers can manage student enrollments.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name">Course Name</label>
              <Input
                id="name"
                name="name"
                value={editedCourse.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="code">Course Code</label>
              <Input
                id="code"
                name="code"
                value={editedCourse.code}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="room">Room</label>
              <Input
                id="room"
                name="room"
                value={editedCourse.room}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description">Description</label>
              <Textarea
                id="description"
                name="description"
                value={editedCourse.description}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCourse}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
