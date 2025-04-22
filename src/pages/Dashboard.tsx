
import { MainLayout } from "@/components/layout/MainLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingClasses } from "@/components/dashboard/UpcomingClasses";
import { useAuth } from "@/contexts/AuthContext";
import { getCoursesForStudent, getCoursesForTeacher, students, teachers, courses, parents, grades, getStudentsForParent } from "@/services/mockData";
import { Users, GraduationCap, Book, Calendar } from "lucide-react";
import { useEffect, useMemo } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  
  // Calculate stats based on user role
  const stats = useMemo(() => {
    if (!user) return [];

    switch (user.role) {
      case "admin":
        return [
          {
            title: "Total Students",
            value: students.length,
            icon: <Users />,
            description: "Active enrollments"
          },
          {
            title: "Total Teachers",
            value: teachers.length,
            icon: <GraduationCap />,
            description: "Faculty members"
          },
          {
            title: "Total Courses",
            value: courses.length,
            icon: <Book />,
            description: "Active courses"
          },
          {
            title: "Total Parents",
            value: parents.length,
            icon: <Users />,
            description: "Registered guardians"
          }
        ];
      case "teacher":
        const teacherCourses = getCoursesForTeacher(user.id);
        const uniqueStudents = new Set(
          teacherCourses.flatMap(course => course.enrolledStudents)
        );
        
        return [
          {
            title: "My Courses",
            value: teacherCourses.length,
            icon: <Book />,
            description: "Courses you teach"
          },
          {
            title: "My Students",
            value: uniqueStudents.size,
            icon: <Users />,
            description: "Students in your classes"
          },
          {
            title: "Next Class",
            value: teacherCourses.length > 0 ? "Today" : "N/A",
            icon: <Calendar />,
            description: teacherCourses.length > 0 ? "Check schedule" : "No classes today"
          }
        ];
      case "student":
        const studentCourses = getCoursesForStudent(user.id);
        // Get grades for this student
        const studentGrades = grades.filter(g => g.studentId === user.id);
        // Calculate average grade
        const averageGrade = studentGrades.length > 0
          ? Math.round(studentGrades.reduce((acc, curr) => acc + (curr.score / curr.maxScore) * 100, 0) / studentGrades.length)
          : "N/A";
        
        return [
          {
            title: "My Courses",
            value: studentCourses.length,
            icon: <Book />,
            description: "Enrolled courses"
          },
          {
            title: "Next Class",
            value: studentCourses.length > 0 ? "Today" : "N/A",
            icon: <Calendar />,
            description: studentCourses.length > 0 ? "Check schedule" : "No classes today"
          },
          {
            title: "Average Grade",
            value: averageGrade,
            icon: <GraduationCap />,
            description: "Overall performance"
          }
        ];
      case "parent":
        const parentStudents = getStudentsForParent(user.id);
        return [
          {
            title: "My Children",
            value: parentStudents.length,
            icon: <Users />,
            description: "Enrolled students"
          },
          {
            title: "Total Courses",
            value: parentStudents.flatMap(student => 
              getCoursesForStudent(student.id)
            ).length,
            icon: <Book />,
            description: "Enrolled courses"
          }
        ];
      default:
        return [];
    }
  }, [user]);

  useEffect(() => {
    // Set page title
    document.title = "Dashboard | Evening Academy";
  }, []);

  return (
    <MainLayout>
      <div className="sms-container">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-sms-blue">
            {user ? `Welcome, ${user.name}` : "Dashboard"}
          </h2>
          <p className="text-muted-foreground">
            {user ? `Here's what's happening with your ${user.role} account today.` : "Loading your information..."}
          </p>
        </div>

        {/* Dashboard stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, i) => (
            <StatsCard
              key={i}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              description={stat.description}
            />
          ))}
        </div>

        {/* Main content area */}
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          <UpcomingClasses />
          <RecentActivity />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
