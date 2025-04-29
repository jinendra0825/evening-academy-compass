
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityCreationDialog } from "../schedule/ActivityCreationDialog";
import { Course, Notification } from "@/types/models";

export const RecentActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  
  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  
  const fetchActivities = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      let query = supabase
        .from("notifications")
        .select("*");
        
      if (user.role === "student") {
        // For students, show activities where they are in recipientids
        query = query.filter('recipientids', 'cs', `{${user.id}}`);
      } else if (user.role === "teacher") {
        // For teachers, get courses they teach
        const { data: teacherCoursesData } = await supabase
          .from("courses")
          .select("id")
          .eq("teacher_id", user.id);
          
        if (teacherCoursesData && teacherCoursesData.length > 0) {
          const courseIds = teacherCoursesData.map(c => c.id);
          // Get activities for these courses
          query = query.in("course_id", courseIds);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Sort by date (newest first)
      const sortedActivities = data
        ? [...data].sort((a, b) => {
            const dateA = new Date(a.date || '').getTime();
            const dateB = new Date(b.date || '').getTime();
            return dateB - dateA;
          }).slice(0, 5)
        : [];
        
      setActivities(sortedActivities as Notification[]);
    } catch (error) {
      console.error("Error fetching activities:", error);
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
        
        // Process materials to ensure compatibility with Course type
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
    fetchActivities();
    if (isTeacher) {
      fetchTeacherCourses();
    }
  }, [user]);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const handleActivityAdded = () => {
    fetchActivities();
  };

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        {isTeacher && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setOpenDialog(true)}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Activity
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading activities...</p>
        ) : activities.length > 0 ? (
          <ul className="space-y-4">
            {activities.map((activity) => (
              <li key={activity.id} className="flex items-start space-x-3">
                <div 
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'announcement' 
                      ? 'bg-blue-500' 
                      : activity.type === 'alert' 
                      ? 'bg-red-500' 
                      : 'bg-green-500'
                  }`}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <span className="text-xs text-gray-500">{formatDate(activity.date)}</span>
                  </div>
                  <p className="text-xs text-gray-500">{activity.message}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No recent activities</p>
            {isTeacher && (
              <Button 
                className="mt-4" 
                size="sm"
                onClick={() => setOpenDialog(true)}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Create First Activity
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      {isTeacher && (
        <ActivityCreationDialog 
          open={openDialog} 
          onOpenChange={setOpenDialog} 
          courses={teacherCourses}
          onActivityAdded={handleActivityAdded}
        />
      )}
    </Card>
  );
};
