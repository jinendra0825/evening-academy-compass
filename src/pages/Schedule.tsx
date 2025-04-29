
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { CalendarDays, Plus, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddScheduleDialog } from "@/components/schedule/AddScheduleDialog";
import { ScheduleItem } from "@/components/schedule/ScheduleItem";
import { Course } from "@/types/models";

interface ScheduleEntry {
  id: string;
  course_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  course?: {
    name: string;
    code: string;
    room: string | null;
  }
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("schedule")
        .select("*, course:courses(name, code, room)");
      
      if (user?.role === "teacher") {
        // For teachers, get schedules for their courses
        const { data: courses } = await supabase
          .from("courses")
          .select("id")
          .eq("teacher_id", user.id);
          
        if (courses && courses.length > 0) {
          const courseIds = courses.map(course => course.id);
          query = query.in("course_id", courseIds);
        }
      } else if (user?.role === "student") {
        // For students, get schedules for courses they're enrolled in
        const { data: enrollments } = await supabase
          .from("course_enrollments")
          .select("course_id")
          .eq("student_id", user.id)
          .eq("status", "enrolled");
          
        if (enrollments && enrollments.length > 0) {
          const courseIds = enrollments.map(enrollment => enrollment.course_id);
          query = query.in("course_id", courseIds);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setSchedule(data || []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherCourses = async () => {
    if (isTeacher && user) {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("teacher_id", user.id);
          
        if (error) throw error;
        
        // Process course data to match Course type
        const processedCourses = data?.map(course => {
          let materials: { name: string; url: string }[] = [];
          
          if (course.materials) {
            try {
              // Handle both string and object formats
              const materialsData = typeof course.materials === 'string'
                ? JSON.parse(course.materials)
                : course.materials;
                
              if (Array.isArray(materialsData)) {
                materials = materialsData.map(material => ({
                  name: material.name || 'Unnamed material',
                  url: material.url || '#'
                }));
              }
            } catch (e) {
              console.error("Error parsing course materials", e);
            }
          }
          
          return {
            ...course,
            materials: materials
          } as Course;
        }) || [];
        
        setTeacherCourses(processedCourses);
      } catch (error) {
        console.error("Error fetching teacher courses:", error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchSchedule();
      if (isTeacher) {
        fetchTeacherCourses();
      }
    }
  }, [user]);

  const handleAddSchedule = () => {
    setOpenDialog(true);
  };

  const handleScheduleAdded = () => {
    fetchSchedule();
  };

  // Group schedule entries by day of the week
  const scheduleByDay = schedule.reduce((acc, entry) => {
    const day = entry.day_of_week;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(entry);
    return acc;
  }, {} as Record<string, ScheduleEntry[]>);

  // Sort days of the week
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const sortedDays = Object.keys(scheduleByDay).sort(
    (a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)
  );

  return (
    <MainLayout>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays />Class Schedule
          </h2>
          {isTeacher && (
            <Button onClick={handleAddSchedule}>
              <Plus className="mr-2 h-4 w-4" /> Add Schedule
            </Button>
          )}
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : schedule.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Clock className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No schedule available.</p>
              {isTeacher && (
                <Button onClick={handleAddSchedule} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Schedule
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedDays.map((day) => (
              <Card key={day}>
                <CardHeader>
                  <CardTitle>{day}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scheduleByDay[day]
                      .sort((a, b) => a.start_time.localeCompare(b.start_time))
                      .map((entry) => (
                        <ScheduleItem key={entry.id} entry={entry} isTeacher={isTeacher} onUpdate={fetchSchedule} />
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isTeacher && (
          <AddScheduleDialog 
            open={openDialog} 
            onOpenChange={setOpenDialog} 
            courses={teacherCourses}
            onScheduleAdded={handleScheduleAdded}
          />
        )}
      </div>
    </MainLayout>
  );
}
