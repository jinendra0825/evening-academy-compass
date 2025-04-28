
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { ListTodo, Star, StarHalf } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface Grade {
  id: string;
  assignment_id: string;
  student_id: string;
  score: number;
  max_score: number;
  assignment?: {
    title: string;
    due_date: string;
    course_id: string;
  };
  course?: {
    name: string;
    code: string;
  };
}

export default function GradesPage() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      // For teachers, fetch all grades if needed
      if (user?.role === "teacher") {
        const { data, error } = await supabase
          .from("grades")
          .select(`
            *,
            assignment:assignment_id (
              title,
              due_date,
              course_id
            )
          `);
        if (error) throw error;
        setGrades(data || []);
      } else {
        // For students, only fetch their own grades
        const { data, error } = await supabase
          .from("grades")
          .select(`
            *,
            assignment:assignment_id (
              title,
              due_date,
              course_id
            )
          `)
          .eq('student_id', user?.id);
        if (error) throw error;
        setGrades(data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading grades:", error);
      setLoading(false);
    }
  };

  const getPerformanceIcon = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 70) {
      return <Star className="text-yellow-500" />;
    } else if (percentage >= 40) {
      return <StarHalf className="text-yellow-500" />;
    }
    return null;
  };

  const getGradeLetter = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    if (percentage >= 50) return "E";
    return "F";
  };

  return (
    <MainLayout>
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><ListTodo />Grades</h2>
        {loading ? (
          <p>Loading...</p>
        ) : grades.length === 0 ? (
          <p>No grades found. Complete an assignment to see your grades.</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell className="font-medium">
                      {grade.assignment?.title || "Unknown Assignment"}
                    </TableCell>
                    <TableCell>
                      {grade.course?.name ? (
                        <>
                          {grade.course.name}
                          <span className="text-xs text-gray-500 block">
                            {grade.course.code}
                          </span>
                        </>
                      ) : (
                        "Unknown Course"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {getPerformanceIcon(grade.score, grade.max_score)}
                        <span><b>{grade.score}</b> / {grade.max_score}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`
                        font-bold text-lg
                        ${grade.score / grade.max_score >= 0.7 ? 'text-green-600' : 
                          grade.score / grade.max_score >= 0.5 ? 'text-amber-600' : 'text-red-600'}
                      `}>
                        {getGradeLetter(grade.score, grade.max_score)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
