
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { courses, getStudentById, getTeacherById } from "@/services/mockData";
import { useAuth } from "@/contexts/AuthContext";

export const UpcomingClasses = () => {
  const { user } = useAuth();
  
  // Function to get today's day name
  const getTodayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };
  
  const today = getTodayName();
  
  // Filter courses based on user role and current day
  const filteredCourses = courses.filter(course => {
    if (!user) return false;
    
    // Only show today's classes
    const hasTodayClass = course.schedule.some(s => s.day === today);
    if (!hasTodayClass) return false;
    
    // Filter by user role
    if (user.role === 'admin') return true;
    if (user.role === 'teacher') return course.teacherId === user.id;
    if (user.role === 'student') return course.enrolledStudents.includes(user.id);
    
    // For parents, show classes of their children
    if (user.role === 'parent') {
      return course.enrolledStudents.some(studentId => {
        const student = getStudentById(studentId);
        return student?.parentId === user.id;
      });
    }
    
    return false;
  });
  
  // Sort by start time
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const aTime = a.schedule.find(s => s.day === today)?.startTime || '';
    const bTime = b.schedule.find(s => s.day === today)?.startTime || '';
    return aTime.localeCompare(bTime);
  });

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Today's Classes</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedCourses.length > 0 ? (
          <div className="space-y-4">
            {sortedCourses.map(course => {
              const schedule = course.schedule.find(s => s.day === today);
              const teacher = getTeacherById(course.teacherId);
              
              return (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-4">
                    <div className="w-1 h-12 bg-primary rounded-full"></div>
                    <div>
                      <h3 className="font-medium">{course.name}</h3>
                      <p className="text-sm text-gray-500">
                        {teacher?.name} · Room {course.room}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{schedule?.startTime} - {schedule?.endTime}</p>
                    <p className="text-sm text-gray-500">{course.code}</p>
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
};
