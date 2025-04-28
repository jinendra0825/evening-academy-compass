
import { MainLayout } from "@/components/layout/MainLayout";
import { Book, PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { CreateCourseDialog } from "@/components/courses/CreateCourseDialog";
import { CourseList } from "@/components/courses/CourseList";
import { useCourseManagement } from "@/hooks/useCourseManagement";

export default function MyCoursesPage() {
  const { user } = useAuth();
  const {
    courses,
    loading,
    openDialog,
    setOpenDialog,
    newCourse,
    handleInputChange,
    handleSubmit
  } = useCourseManagement(user);

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

        <CourseList
          courses={courses}
          loading={loading}
          isTeacher={isTeacher}
        />

        <CreateCourseDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          newCourse={newCourse}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      </div>
    </MainLayout>
  );
}

