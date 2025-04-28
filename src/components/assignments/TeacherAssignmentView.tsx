
import { useState } from "react";
import { Assignment, Course } from "@/types/assignments";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

interface TeacherAssignmentViewProps {
  assignments: Assignment[];
  courses: Course[];
  loading: boolean;
  onDownload: (url: string, fileName: string) => void;
}

export const TeacherAssignmentView = ({
  assignments,
  courses,
  loading,
  onDownload,
}: TeacherAssignmentViewProps) => {
  if (loading) {
    return <div className="flex justify-center py-10">Loading assignments...</div>;
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No assignments found. Create your first assignment using the "Create Assignment" tab.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Assignments</CardTitle>
        <CardDescription>View and manage all assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>File</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => {
              const course = courses.find(c => c.id === assignment.course_id);
              return (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell>{course?.name || "Unknown Course"}</TableCell>
                  <TableCell>
                    {assignment.due_date ? format(new Date(assignment.due_date), 'MMM dd, yyyy') : 'No date set'}
                  </TableCell>
                  <TableCell>
                    {assignment.file_url ? assignment.file_name : 'No file'}
                  </TableCell>
                  <TableCell className="text-right">
                    {assignment.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownload(assignment.file_url!, assignment.file_name!)}
                      >
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
