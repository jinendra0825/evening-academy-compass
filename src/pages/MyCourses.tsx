import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Book, PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Course } from "@/types/models";
import { Link } from "react-router-dom";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuth();

  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    description: "",
    room: ""
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*");

      if (error) throw error;
      
      const courseData = data?.map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        description: item.description || "",
        teacher_id: item.teacher_id,
        teacherId: item.teacher_id,
        room: item.room || "",
        schedule: [],
        enrolledStudents: []
      })) || [];
      
      setCourses(courseData);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCourse({ ...newCourse, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCourse.name || !newCourse.code) {
      toast({
        title: "Missing fields",
        description: "Course name and code are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("courses")
        .insert([
          {
            name: newCourse.name,
            code: newCourse.code,
            description: newCourse.description,
            room: newCourse.room,
            teacher_id: user?.id
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course created successfully"
      });
      
      setNewCourse({ name: "", code: "", description: "", room: "" });
      setOpenDialog(false);
      fetchCourses();
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive"
      });
    }
  };

  const isTeacher = user?.role === "teacher";

  return (
    <MainLayout>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Book />My Courses
          </h2>
          {isTeacher && (
            <Button onClick={() => setOpenDialog(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Course
            </Button>
          )}
        </div>

        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p>No courses found. {isTeacher && "Click 'Add Course' to create your first course."}</p>
        ) : (
          <ul className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {courses.map((course) => (
              <li key={course.id} className="rounded-lg border p-4 shadow bg-white">
                <div className="font-semibold">{course.name} ({course.code})</div>
                <div className="text-gray-500 text-sm mb-2">{course.room}</div>
                <p className="text-sm mb-3">{course.description}</p>
                <Link to={`/courses/${course.id}`} className="text-primary text-sm hover:underline">
                  View details
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Introduction to Mathematics"
                  value={newCourse.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="code">Course Code</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="MATH101"
                  value={newCourse.code}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="room">Room</Label>
                <Input
                  id="room"
                  name="room"
                  placeholder="Room A-101"
                  value={newCourse.room}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Course description..."
                  value={newCourse.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Course</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
