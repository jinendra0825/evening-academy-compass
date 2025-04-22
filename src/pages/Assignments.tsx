
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { FileText } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  due_date: string;
  description: string;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("assignments").select("*").then(({ data }) => {
      setAssignments(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <MainLayout>
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><FileText />Assignments</h2>
        {loading ? <p>Loading...</p> :
        assignments.length === 0 ? (
          <p>No assignments found.</p>
        ) : (
          <ul className="space-y-4">
            {assignments.map((asgn) => (
              <li key={asgn.id} className="rounded-lg border p-4 bg-white">
                <div className="font-semibold">{asgn.title}</div>
                <div className="text-gray-500 text-sm">Due: {asgn.due_date}</div>
                <p className="text-sm">{asgn.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MainLayout>
  );
}
