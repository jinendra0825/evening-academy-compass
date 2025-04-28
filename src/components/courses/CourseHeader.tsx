
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";
import { Course } from "@/types/models";

interface CourseHeaderProps {
  course: Course;
  isTeacher: boolean;
  onEditClick: () => void;
}

export const CourseHeader = ({ course, isTeacher, onEditClick }: CourseHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Book className="h-8 w-8" />
        {course.name}
      </h1>
      {isTeacher && (
        <Button onClick={onEditClick}>Edit Course</Button>
      )}
    </div>
  );
};
