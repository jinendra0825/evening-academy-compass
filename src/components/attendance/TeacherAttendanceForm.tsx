
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

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
  const today = new Date().toISOString().split("T")[0];
  
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
            max={today}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Mark Student Attendance</label>
          {loadingStudents ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="py-4 text-center border rounded-md bg-muted/20">
              {selectedCourse ? "No students available" : "Select a course to view students"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-right">Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name || student.email}</TableCell>
                    <TableCell className="text-right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <Button
          onClick={onSubmit}
          disabled={submitting || !selectedCourse || !attendanceDate || students.length === 0}
          className="w-full"
        >
          {submitting ? "Recording..." : "Record Attendance"}
        </Button>
      </div>
    </div>
  );
};
