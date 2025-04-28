
import { Course } from "@/types/models";
import { Link } from "react-router-dom";

interface CourseListProps {
  courses: Course[];
  loading: boolean;
  isTeacher: boolean;
}

export const CourseList = ({ courses, loading, isTeacher }: CourseListProps) => {
  if (loading) {
    return <p>Loading courses...</p>;
  }

  if (courses.length === 0) {
    return (
      <p>No courses found. {isTeacher && "Click 'Add Course' to create your first course."}</p>
    );
  }

  return (
    <ul className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {courses.map((course) => (
        <li key={course.id} className="rounded-lg border p-4 shadow bg-white">
          <div className="font-semibold">{course.name} ({course.code})</div>
          <div className="text-gray-500 text-sm mb-2">{course.room}</div>
          <p className="text-sm mb-3">{course.description}</p>
          <Link to={`/courses/${course.id}`} className="text-primary text-sm hover:underline">
            View details
          </Link>
        </li>
      ))}
    </ul>
  );
};

