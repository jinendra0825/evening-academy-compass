
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Users, CircleCheck, CircleX, TrendingUp, TrendingDown, Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

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

interface Student {
  id: string;
  name: string;
}

export default function AttendancePage() {
  const [attendanceByDay, setAttendanceByDay] = useState<Attendance[]>([]);
  const [attendanceByCourse, setAttendanceByCourse] = useState<CourseAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageAttendance, setAverageAttendance] = useState(0);
  const [activeTab, setActiveTab] = useState("view");
  
  // Teacher mode state
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [presentStudents, setPresentStudents] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAttendanceData();
    loadCourses();
    loadDemoStudents();
  }, []);

  const loadAttendanceData = async () => {
    try {
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
      
      // Create science courses if not enough data
      const { data: coursesData } = await supabase
        .from("courses")
        .select("*");
      
      const scienceCourses = coursesData || [];
      
      // Ensure we have 5 science courses for the demo
      if (scienceCourses.length < 5) {
        const scienceCourseNames = [
          { name: "Physics", code: "PHYS101", description: "Introduction to Physics" },
          { name: "Chemistry", code: "CHEM101", description: "General Chemistry" },
          { name: "Biology", code: "BIO101", description: "Introduction to Biology" },
          { name: "Computer Science", code: "CS101", description: "Introduction to Programming" },
          { name: "Environmental Science", code: "ENV101", description: "Environmental Studies" }
        ];
        
        // Only add missing courses
        for (let i = scienceCourses.length; i < 5; i++) {
          await supabase.from("courses").insert({
            name: scienceCourseNames[i].name,
            code: scienceCourseNames[i].code,
            description: scienceCourseNames[i].description
          });
        }
        
        // Reload courses after adding
        const { data: updatedCoursesData } = await supabase.from("courses").select("*");
        
        // Generate attendance data for each course to ensure 75% average
        const demoStudentIds = [
          crypto.randomUUID(),
          crypto.randomUUID(),
          crypto.randomUUID(),
          crypto.randomUUID(),
          crypto.randomUUID()
        ];
        
        const lastTwoMonths = Array.from({ length: 10 }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (i * 7)); // Weekly attendance
          return date.toISOString().split('T')[0]; // YYYY-MM-DD format
        });
        
        // For each course, create attendance records
        for (const course of updatedCoursesData || []) {
          for (const date of lastTwoMonths) {
            // Determine attendance rate for this record (ranging from 70-95% for an average of ~75%)
            const attendanceRate = Math.random() < 0.7 ? 
              // 70% of the time: high attendance (75-95%)
              Math.floor(Math.random() * 20) + 75 : 
              // 30% of the time: low attendance (50-75%)
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
        
        // Reload attendance data after adding
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
      
      // Process attendance by course
      const { data: latestCoursesData } = await supabase.from("courses").select("*");
      const courses = latestCoursesData || [];
      
      const courseAttendanceMap: Record<string, CourseAttendance> = {};
      
      // Initialize course attendance objects
      courses.forEach(course => {
        courseAttendanceMap[course.id] = {
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          attendanceRate: 0,
          records: []
        };
      });
      
      // Process attendance records
      const allAttendance = attendanceData || [];
      allAttendance.forEach(record => {
        if (record.course_id && courseAttendanceMap[record.course_id]) {
          courseAttendanceMap[record.course_id].records.push(record);
        }
      });
      
      // Calculate attendance rate for each course
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
      
      // Calculate overall average attendance
      const courseAttendances = Object.values(courseAttendanceMap);
      const totalAttendanceRate = courseAttendances.reduce(
        (sum, course) => sum + course.attendanceRate, 0
      );
      const averageAttendanceRate = courseAttendances.length > 0 ? 
        Math.round(totalAttendanceRate / courseAttendances.length) : 0;
      
      setAttendanceByCourse(courseAttendances);
      setAverageAttendance(averageAttendanceRate);
      
    } catch (error) {
      console.error("Error loading attendance data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadCourses = async () => {
    try {
      const { data, error } = await supabase.from("courses").select("*");
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };
  
  const loadDemoStudents = () => {
    // In a real app, fetch students from database
    // For demo, using fake student data
    const demoStudents: Student[] = [
      { id: crypto.randomUUID(), name: "John Smith" },
      { id: crypto.randomUUID(), name: "Mary Johnson" },
      { id: crypto.randomUUID(), name: "Robert Williams" },
      { id: crypto.randomUUID(), name: "Patricia Brown" },
      { id: crypto.randomUUID(), name: "Michael Davis" }
    ];
    setStudents(demoStudents);
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
    if (!selectedCourse || !attendanceDate) {
      toast({
        title: "Missing Information",
        description: "Please select a course and date",
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
      
      const { error } = await supabase.from("attendance").insert({
        course_id: selectedCourse,
        date: attendanceDate,
        present_student_ids: presentStudentsArray,
        absent_student_ids: absentStudentsArray
      });
      
      if (error) throw error;
      
      toast({
        title: "Attendance Recorded",
        description: "Attendance has been successfully recorded"
      });
      
      // Reset form and refresh data
      setSelectedCourse("");
      setAttendanceDate("");
      setPresentStudents(new Set());
      loadAttendanceData();
      
    } catch (error) {
      console.error("Error recording attendance:", error);
      toast({
        title: "Error",
        description: "Failed to record attendance",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Format date to a more readable format
  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateStr).toLocaleDateString(undefined, options);
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
            <TabsTrigger value="record">Record Attendance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-6">
                {/* Overall Attendance Stats */}
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
                
                {/* Course-wise Attendance */}
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
                
                {/* Recent Attendance Records */}
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
          
          <TabsContent value="record">
            <div className="border rounded-lg p-6 bg-white">
              <h3 className="text-lg font-bold mb-4">Record New Attendance</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Course</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input 
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Mark Student Attendance</label>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left py-2 px-4 font-medium">Student Name</th>
                          <th className="text-right py-2 px-4 font-medium">Attendance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map(student => (
                          <tr key={student.id} className="border-t">
                            <td className="py-3 px-4">{student.name}</td>
                            <td className="py-3 px-4 text-right">
                              <Button 
                                variant={presentStudents.has(student.id) ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleStudentAttendance(student.id)}
                              >
                                {presentStudents.has(student.id) ? (
                                  <><Check size={16} /> Present</>
                                ) : (
                                  <><X size={16} /> Absent</>
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSubmitAttendance} 
                  disabled={submitting}
                  className="w-full"
                >
                  Record Attendance
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
