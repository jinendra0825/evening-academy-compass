
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { ListTodo } from "lucide-react";

interface Grade {
  id: string;
  assignment_id: string;
  student_id: string;
  score: number;
  max_score: number;
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("grades").select("*").then(({ data }) => {
      setGrades(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <MainLayout>
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><ListTodo />Grades</h2>
        {loading ? (
          <p>Loading...</p>
        ) : grades.length === 0 ? (
          <p>No grades found.</p>
        ) : (
          <ul className="space-y-3">
            {grades.map((grade) => (
              <li key={grade.id} className="rounded border p-4 bg-white">
                <div className="font-semibold">Assignment ID: {grade.assignment_id}</div>
                <div>Score: <b>{grade.score}</b> / {grade.max_score}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MainLayout>
  );
}
