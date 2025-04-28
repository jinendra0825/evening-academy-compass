
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types/models";
import { toast } from "@/components/ui/use-toast";
import { User } from "@/contexts/AuthContext";

export const useCourseManagement = (user: User | null) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    description: "",
    room: ""
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let query = supabase.from("courses").select("*");
      
      if (user?.role === "teacher") {
        query = query.eq("teacher_id", user.id);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      
      const courseData = data?.map(item => {
        let parsedMaterials: { name: string; url: string }[] = [];
        
        if (item.materials) {
          const materialsData = typeof item.materials === 'string' 
            ? JSON.parse(item.materials) 
            : item.materials;
            
          if (Array.isArray(materialsData)) {
            parsedMaterials = materialsData.map(material => {
              if (typeof material === 'object' && material !== null) {
                return {
                  name: material.name || 'Unnamed material',
                  url: material.url || '#'
                };
              }
              return { name: 'Unnamed material', url: '#' };
            });
          }
        }
        
        return {
          id: item.id,
          name: item.name,
          code: item.code,
          description: item.description || "",
          teacher_id: item.teacher_id,
          teacherId: item.teacher_id,
          room: item.room || "",
          schedule: [],
          enrolledStudents: [],
          materials: parsedMaterials
        };
      }) || [];
      
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

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  return {
    courses,
    loading,
    openDialog,
    setOpenDialog,
    newCourse,
    handleInputChange,
    handleSubmit
  };
};

