
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Users, CircleCheck, CircleX, TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { TeacherAttendanceForm } from "@/components/attendance/TeacherAttendanceForm";

// Define separate interface to avoid conflict with imported Profile
interface StudentProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

interface Attendance {
  id: string;
  course_id: string;
  date: string;
  present_student_ids: string[];
  absent_student_ids: string[];
  course?: {
    name: string;
    code: string;
  };
}

interface CourseAttendance {
  courseId: string;
  courseName: string;
  courseCode: string;
  attendanceRate: number;
  records: Attendance[];
}

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendanceByDay, setAttendanceByDay] = useState<Attendance[]>([]);
  const [attendanceByCourse, setAttendanceByCourse] = useState<CourseAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageAttendance, setAverageAttendance] = useState(0);
  const [activeTab, setActiveTab] = useState("view");
  
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [presentStudents, setPresentStudents] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === 'teacher') {
      loadCourses();
    }
    loadAttendanceData();
  }, [user]);

  // Only load students when a course is selected
  useEffect(() => {
    if (selectedCourse && user?.role === 'teacher') {
      loadStudents();
    }
  }, [selectedCourse, user]);

  const loadStudents = async () => {
    if (!selectedCourse) return;
    
    setLoadingStudents(true);
    setPresentStudents(new Set()); // Reset selected students
    
    try {
      // Use 'eq' instead of direct comparison in the filter
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .eq('role', 'student');
      
      if (error) throw error;
      
      const validStudents: StudentProfile[] = data?.map(student => ({
        id: student.id,
        name: student.name || '',
        email: student.email || '',
        role: student.role as 'student' | 'teacher' | 'admin'
      })) || [];
      
      setStudents(validStudents);
      
      // Pre-populate with existing attendance data if available for the selected date and course
      if (attendanceDate) {
        const { data: existingAttendance } = await supabase
          .from('attendance')
          .select('present_student_ids')
          .eq('course_id', selectedCourse)
          .eq('date', attendanceDate)
          .single();
          
        if (existingAttendance?.present_student_ids?.length) {
          setPresentStudents(new Set(existingAttendance.present_student_ids));
        }
      }
      
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        title: "Error",
        description: "Could not load student list. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      
      // First load courses if needed
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*");
        
      if (coursesError) throw coursesError;
      
      // Load attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select(`
          *,
          course:course_id (
            name,
            code
          )
        `)
        .order('date', { ascending: false });
      
      if (attendanceError) throw attendanceError;
      
      // If no data, seed some demo data
      const scienceCourses = coursesData || [];
      
      if (scienceCourses.length < 5) {
        await seedDemoData(scienceCourses);
        // After seeding, refresh the data
        const { data: refreshedData } = await supabase
          .from("attendance")
          .select(`
            *,
            course:course_id (
              name,
              code
            )
          `)
          .order('date', { ascending: false });
          
        setAttendanceByDay(refreshedData || []);
      } else {
        setAttendanceByDay(attendanceData || []);
      }
      
      // Process course attendance data
      const { data: latestCoursesData } = await supabase.from("courses").select("*");
      const courses = latestCoursesData || [];
      
      processAttendanceData(courses, attendanceData || []);
      
    } catch (error) {
      console.error("Error loading attendance data:", error);
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const seedDemoData = async (scienceCourses: any[]) => {
    const scienceCourseNames = [
      { name: "Physics", code: "PHYS101", description: "Introduction to Physics" },
      { name: "Chemistry", code: "CHEM101", description: "General Chemistry" },
      { name: "Biology", code: "BIO101", description: "Introduction to Biology" },
      { name: "Computer Science", code: "CS101", description: "Introduction to Programming" },
      { name: "Environmental Science", code: "ENV101", description: "Environmental Studies" }
    ];
    
    for (let i = scienceCourses.length; i < 5; i++) {
      await supabase.from("courses").insert({
        name: scienceCourseNames[i].name,
        code: scienceCourseNames[i].code,
        description: scienceCourseNames[i].description
      });
    }
    
    const { data: updatedCoursesData } = await supabase.from("courses").select("*");
    
    const demoStudentIds = [
      crypto.randomUUID(),
      crypto.randomUUID(),
      crypto.randomUUID(),
      crypto.randomUUID(),
      crypto.randomUUID()
    ];
    
    const lastTwoMonths = Array.from({ length: 10 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      return date.toISOString().split('T')[0];
    });
    
    for (const course of updatedCoursesData || []) {
      for (const date of lastTwoMonths) {
        const attendanceRate = Math.random() < 0.7 ? 
          Math.floor(Math.random() * 20) + 75 : 
          Math.floor(Math.random() * 25) + 50;
          
        const presentCount = Math.floor(demoStudentIds.length * (attendanceRate / 100));
        const presentStudents = demoStudentIds.slice(0, presentCount);
        const absentStudents = demoStudentIds.slice(presentCount);
        
        await supabase.from("attendance").insert({
          course_id: course.id,
          date: date,
          present_student_ids: presentStudents,
          absent_student_ids: absentStudents
        });
      }
    }
  };

  const processAttendanceData = (courses: any[], attendanceRecords: Attendance[]) => {
    const courseAttendanceMap: Record<string, CourseAttendance> = {};
    
    courses.forEach(course => {
      courseAttendanceMap[course.id] = {
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        attendanceRate: 0,
        records: []
      };
    });
    
    attendanceRecords.forEach(record => {
      if (record.course_id && courseAttendanceMap[record.course_id]) {
        courseAttendanceMap[record.course_id].records.push(record);
      }
    });
    
    Object.values(courseAttendanceMap).forEach(courseAttendance => {
      if (courseAttendance.records.length > 0) {
        let totalPresent = 0;
        let totalStudents = 0;
        
        courseAttendance.records.forEach(record => {
          totalPresent += record.present_student_ids?.length || 0;
          totalStudents += (record.present_student_ids?.length || 0) + (record.absent_student_ids?.length || 0);
        });
        
        courseAttendance.attendanceRate = totalStudents > 0 ? 
          Math.round((totalPresent / totalStudents) * 100) : 0;
      }
    });
    
    const courseAttendances = Object.values(courseAttendanceMap);
    const totalAttendanceRate = courseAttendances.reduce(
      (sum, course) => sum + course.attendanceRate, 0
    );
    const averageAttendanceRate = courseAttendances.length > 0 ? 
      Math.round(totalAttendanceRate / courseAttendances.length) : 0;
    
    setAttendanceByCourse(courseAttendances);
    setAverageAttendance(averageAttendanceRate);
  };

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase.from("courses").select("*");
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error loading courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      });
    }
  };

  const toggleStudentAttendance = (studentId: string) => {
    setPresentStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSubmitAttendance = async () => {
    if (user?.role !== 'teacher') {
      toast({
        title: "Unauthorized",
        description: "Only teachers can mark attendance",
        variant: "destructive"
      });
      return;
    }
    if (!selectedCourse || !attendanceDate) {
      toast({
        title: "Missing Information",
        description: "Please select a course and date",
        variant: "destructive"
      });
      return;
    }
    if (students.length === 0) {
      toast({
        title: "No Students",
        description: "There are no students available to mark attendance for",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    try {
      const presentStudentsArray = Array.from(presentStudents);
      const absentStudentsArray = students
        .filter(student => !presentStudents.has(student.id))
        .map(student => student.id);

      // Check if attendance record already exists for this date and course
      const { data: existingRecord } = await supabase
        .from("attendance")
        .select("id")
        .eq("course_id", selectedCourse)
        .eq("date", attendanceDate)
        .maybeSingle();

      let error;
      
      if (existingRecord?.id) {
        // Update existing record
        const result = await supabase
          .from("attendance")
          .update({
            present_student_ids: presentStudentsArray,
            absent_student_ids: absentStudentsArray
          })
          .eq("id", existingRecord.id);
          
        error = result.error;
      } else {
        // Insert new record
        const result = await supabase
          .from("attendance")
          .insert({
            course_id: selectedCourse,
            date: attendanceDate,
            present_student_ids: presentStudentsArray,
            absent_student_ids: absentStudentsArray
          });
          
        error = result.error;  
      }

      if (error) throw error;

      toast({
        title: "Attendance Recorded",
        description: "Attendance has been successfully recorded"
      });

      // Reset form and reload data
      setSelectedCourse("");
      setAttendanceDate("");
      setPresentStudents(new Set());
      loadAttendanceData();
      setActiveTab("view"); // Switch back to view tab after successful submission
    } catch (error: any) {
      console.error("Error recording attendance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record attendance. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // Extract AttendanceSummary component from the rendering logic
  const renderRecordAttendanceTab = () => {
    if (user?.role !== 'teacher') return null;
    return (
      <TabsContent value="record">
        <TeacherAttendanceForm
          courses={courses}
          students={students}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          attendanceDate={attendanceDate}
          setAttendanceDate={setAttendanceDate}
          presentStudents={presentStudents}
          setPresentStudents={setPresentStudents}
          submitting={submitting}
          onSubmit={handleSubmitAttendance}
          toggleStudentAttendance={toggleStudentAttendance}
          loadingStudents={loadingStudents}
        />
      </TabsContent>
    );
  };

  return (
    <MainLayout>
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users />Attendance
        </h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="view">View Attendance</TabsTrigger>
            {user?.role === 'teacher' && (
              <TabsTrigger value="record">Record Attendance</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="view">
            {loading ? (
              <div className="py-8 text-center">
                <div className="animate-pulse h-8 w-40 bg-muted rounded mx-auto mb-4"></div>
                <div className="animate-pulse h-4 w-60 bg-muted rounded mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Overall Attendance</CardTitle>
                    <CardDescription>Science Stream Courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-3xl font-bold">
                          {averageAttendance}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Average attendance across all courses
                        </div>
                      </div>
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                        {averageAttendance >= 75 ? (
                          <TrendingUp className="h-7 w-7 text-green-600" />
                        ) : (
                          <TrendingDown className="h-7 w-7 text-red-600" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {attendanceByCourse.slice(0, 5).map((courseData) => (
                    <Card key={courseData.courseId}>
                      <CardHeader className="pb-2">
                        <CardTitle>{courseData.courseName}</CardTitle>
                        <CardDescription>{courseData.courseCode}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="text-2xl font-bold">
                            {courseData.attendanceRate}%
                          </div>
                          <div className="flex gap-2">
                            <div className="flex items-center">
                              <CircleCheck className="h-5 w-5 text-green-500 mr-1" />
                              <span className="text-sm">
                                {courseData.records.reduce((sum, record) => 
                                  sum + (record.present_student_ids?.length || 0), 0)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <CircleX className="h-5 w-5 text-red-500 mr-1" />
                              <span className="text-sm">
                                {courseData.records.reduce((sum, record) => 
                                  sum + (record.absent_student_ids?.length || 0), 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 h-2 w-full bg-muted rounded">
                          <div 
                            className={`h-2 rounded ${
                              courseData.attendanceRate >= 75 ? 'bg-green-500' : 
                              courseData.attendanceRate >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${courseData.attendanceRate}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <h3 className="text-lg font-semibold mt-6 mb-2">Recent Attendance</h3>
                <ul className="space-y-3">
                  {attendanceByDay.slice(0, 5).map((item) => (
                    <li key={item.id} className="rounded border p-4 bg-white">
                      <div className="font-medium">
                        {item.course?.name || "Unknown Course"} 
                        <span className="text-sm text-muted-foreground ml-1">
                          ({item.course?.code})
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Date: {formatDate(item.date)}
                      </div>
                      <div className="mt-2 flex justify-between">
                        <div className="flex items-center gap-1">
                          <CircleCheck className="h-4 w-4 text-green-500" />
                          <span>Present: {item.present_student_ids.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CircleX className="h-4 w-4 text-red-500" />
                          <span>Absent: {item.absent_student_ids.length}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
          
          {renderRecordAttendanceTab()}
        </Tabs>
      </div>
    </MainLayout>
  );
}
