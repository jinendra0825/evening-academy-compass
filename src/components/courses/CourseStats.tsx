
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Course } from "@/types/models";

interface CourseStatsProps {
  course: Course;
}

export const CourseStats = ({ course }: CourseStatsProps) => {
  return (
    <div className="flex flex-wrap gap-4">
      <Card className="w-full md:w-auto md:flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Course Code</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{course.code}</p>
        </CardContent>
      </Card>
      
      <Card className="w-full md:w-auto md:flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Location</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{course.room || "Not specified"}</p>
        </CardContent>
      </Card>
    </div>
  );
};
