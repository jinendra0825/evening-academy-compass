
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Users } from "lucide-react";

interface Attendance {
  id: string;
  course_id: string;
  date: string;
  present_student_ids: string[];
  absent_student_ids: string[];
}

export default function AttendancePage() {
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("attendance").select("*").then(({ data }) => {
      setAttendanceList(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <MainLayout>
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Users />Attendance</h2>
        {loading ? (
          <p>Loading...</p>
        ) : attendanceList.length === 0 ? (
          <p>No attendance records.</p>
        ) : (
          <ul className="space-y-3">
            {attendanceList.map((item) => (
              <li key={item.id} className="rounded border p-4 bg-white">
                <div>Date: <b>{item.date}</b></div>
                <div>Course: {item.course_id}</div>
                <div>
                  Present: {item.present_student_ids.join(', ') || "None"}
                </div>
                <div>
                  Absent: {item.absent_student_ids.join(', ') || "None"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MainLayout>
  );
}
