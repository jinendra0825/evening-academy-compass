
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleEntry {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  course: {
    id: string;
    name: string;
    code: string;
    room: string | null;
    teacher_id: string | null;
  };
  teacher?: {
    name: string | null;
  };
}

export const UpcomingClasses = () => {
  const { user } = useAuth();
  const [todayClasses, setTodayClasses] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Function to get today's day name
  const getTodayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };
  
  const today = getTodayName();
  
  useEffect(() => {
    const fetchTodayClasses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        let query = supabase
          .from("schedule")
          .select("*, course:courses(*)")
          .eq("day_of_week", today);
        
        if (user.role === "teacher") {
          // For teachers, get schedules for their courses
          const { data: courses } = await supabase
            .from("courses")
            .select("id")
            .eq("teacher_id", user.id);
            
          if (courses && courses.length > 0) {
            const courseIds = courses.map(course => course.id);
            query = query.in("course_id", courseIds);
          }
        } else if (user.role === "student") {
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
        
        // Sort by start time
        const sortedData = data
          ? [...data].sort((a, b) => a.start_time.localeCompare(b.start_time))
          : [];
          
        // For each course, fetch teacher information
        const classesWithTeachers = await Promise.all(
          sortedData.map(async (entry) => {
            if (entry.course?.teacher_id) {
              const { data: teacherData } = await supabase
                .from("profiles")
                .select("name")
                .eq("id", entry.course.teacher_id)
                .single();
                
              return {
                ...entry,
                teacher: teacherData || { name: null }
              };
            }
            return entry;
          })
        );
        
        setTodayClasses(classesWithTeachers);
      } catch (error) {
        console.error("Error fetching today's classes:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTodayClasses();
  }, [user, today]);
  
  // Format display time
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      const displayMinute = minute.toString().padStart(2, '0');
      
      return `${displayHour}:${displayMinute} ${period}`;
    } catch (e) {
      return timeString;
    }
  };

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Today's Classes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-6 text-muted-foreground">Loading classes...</p>
        ) : todayClasses.length > 0 ? (
          <div className="space-y-4">
            {todayClasses.map(entry => {
              return (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-4">
                    <div className="w-1 h-12 bg-primary rounded-full"></div>
                    <div>
                      <h3 className="font-medium">{entry.course?.name || "Unknown Class"}</h3>
                      <p className="text-sm text-gray-500">
                        {entry.teacher?.name || "No teacher"} · 
                        {entry.course?.room ? ` Room ${entry.course.room}` : " No room assigned"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                    </p>
                    <p className="text-sm text-gray-500">{entry.course?.code || ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-6 text-muted-foreground">
            No classes scheduled for today.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
