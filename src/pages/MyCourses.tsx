
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Book } from "lucide-react";

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  room: string;
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("courses").select("*").then(({ data }) => {
      setCourses(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <MainLayout>
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Book />My Courses</h2>
        {loading ? (
          <p>Loading...</p>
        ) : courses.length === 0 ? (
          <p>No courses found.</p>
        ) : (
          <ul className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {courses.map((course) => (
              <li key={course.id} className="rounded-lg border p-4 shadow bg-white">
                <div className="font-semibold">{course.name} ({course.code})</div>
                <div className="text-gray-500 text-sm mb-2">{course.room}</div>
                <p className="text-sm">{course.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MainLayout>
  );
}
