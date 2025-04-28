import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "lucide-react";
import { Course } from "@/types/models";
import { ManageEnrollments } from "./ManageEnrollments";
import { ManageMaterials } from "./ManageMaterials";

interface CourseContentProps {
  course: Course;
  isTeacher: boolean;
  activeTab: string;
  onTabChange: (value: string) => void;
  onMaterialsUpdate: () => void;
}

export const CourseContent = ({ 
  course, 
  isTeacher, 
  activeTab, 
  onTabChange,
  onMaterialsUpdate 
}: CourseContentProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="materials">Materials</TabsTrigger>
        <TabsTrigger value="students">Students</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Description</CardTitle>
            <CardDescription>Overview and details about this course</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{course.description || "No description provided."}</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="materials" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Materials</CardTitle>
            <CardDescription>Lecture notes, readings, and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <ManageMaterials
              courseId={course.id}
              materials={course.materials || []}
              onMaterialsUpdate={onMaterialsUpdate}
              isTeacher={isTeacher}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="students" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students
            </CardTitle>
            <CardDescription>Manage student enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            {isTeacher ? (
              <ManageEnrollments courseId={course.id} />
            ) : (
              <p>Only teachers can manage student enrollments.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
