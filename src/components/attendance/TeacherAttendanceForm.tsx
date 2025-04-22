
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Updated to match the StudentProfile from Attendance.tsx
export type Profile = {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
};

interface TeacherAttendanceFormProps {
  courses: { id: string; name: string; code: string }[];
  students: Profile[];
  selectedCourse: string;
  setSelectedCourse: (courseId: string) => void;
  attendanceDate: string;
  setAttendanceDate: (date: string) => void;
  presentStudents: Set<string>;
  setPresentStudents: (present: Set<string>) => void;
  submitting: boolean;
  onSubmit: () => void;
  toggleStudentAttendance: (studentId: string) => void;
  loadingStudents: boolean;
}

export const TeacherAttendanceForm: React.FC<TeacherAttendanceFormProps> = ({
  courses,
  students,
  selectedCourse,
  setSelectedCourse,
  attendanceDate,
  setAttendanceDate,
  presentStudents,
  submitting,
  onSubmit,
  toggleStudentAttendance,
  loadingStudents
}) => {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-lg font-bold mb-4">Record New Attendance</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Course</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mark Student Attendance</label>
          {loadingStudents ? (
            <div className="py-4 text-center border rounded-md bg-muted/20">
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div className="py-4 text-center border rounded-md bg-muted/20">
              No students available
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left py-2 px-4 font-medium">Student Name</th>
                    <th className="text-right py-2 px-4 font-medium">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-t">
                      <td className="py-3 px-4">{student.name}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant={presentStudents.has(student.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleStudentAttendance(student.id)}
                        >
                          {presentStudents.has(student.id) ? (
                            <>
                              <Check size={16} className="mr-1" /> Present
                            </>
                          ) : (
                            <>
                              <X size={16} className="mr-1" /> Absent
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Button
          onClick={onSubmit}
          disabled={submitting || !selectedCourse || !attendanceDate}
          className="w-full"
        >
          {submitting ? "Recording..." : "Record Attendance"}
        </Button>
      </div>
    </div>
  );
};
