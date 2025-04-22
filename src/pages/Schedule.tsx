
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { CalendarDays } from "lucide-react";

interface ScheduleEntry {
  id: string;
  course_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("schedule").select("*").then(({ data }) => {
      setSchedule(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <MainLayout>
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><CalendarDays />Class Schedule</h2>
        {loading ? (
          <p>Loading...</p>
        ) : schedule.length === 0 ? (
          <p>No schedule available.</p>
        ) : (
          <ul className="space-y-3">
            {schedule.map((entry) => (
              <li key={entry.id} className="rounded border p-4 bg-white">
                <div>Course ID: <b>{entry.course_id}</b></div>
                <div>Day: {entry.day_of_week}</div>
                <div>Time: {entry.start_time} - {entry.end_time}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MainLayout>
  );
}
