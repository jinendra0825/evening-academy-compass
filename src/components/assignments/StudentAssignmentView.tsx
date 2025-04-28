
import { useState } from "react";
import { Assignment, Course } from "@/types/assignments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Download } from "lucide-react";
import { format } from "date-fns";

interface StudentAssignmentViewProps {
  assignments: Assignment[];
  courses: Course[];
  loading: boolean;
  uploading: boolean;
  onSubmit: (assignmentId: string, file: File) => void;
  onDownload: (url: string, fileName: string) => void;
  isSubmitted: (assignmentId: string) => boolean;
}

export const StudentAssignmentView = ({
  assignments,
  courses,
  loading,
  uploading,
  onSubmit,
  onDownload,
  isSubmitted,
}: StudentAssignmentViewProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-10">Loading assignments...</div>;
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No assignments have been assigned yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const course = courses.find(c => c.id === assignment.course_id);
        const submitted = isSubmitted(assignment.id);
        const dueDate = new Date(assignment.due_date);
        const isOverdue = dueDate < new Date();
        
        return (
          <Card key={assignment.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between">
                <CardTitle>{assignment.title}</CardTitle>
                <span className={`px-3 py-1 text-xs rounded-full ${
                  submitted ? 'bg-green-100 text-green-800' : 
                  isOverdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {submitted ? 'Submitted' : isOverdue ? 'Overdue' : 'Pending'}
                </span>
              </div>
              <CardDescription>
                Course: {course?.name || "Unknown Course"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  Due: {format(new Date(assignment.due_date), 'MMMM d, yyyy')}
                </div>
                
                <p className="text-sm">{assignment.description}</p>
                
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {assignment.file_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDownload(assignment.file_url!, assignment.file_name!)}
                    >
                      <Download className="h-4 w-4 mr-1" /> Download Assignment
                    </Button>
                  )}
                  
                  {!submitted && (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        type="file"
                        onChange={handleFileChange}
                        className="max-w-xs"
                      />
                      <Button
                        onClick={() => selectedFile && onSubmit(assignment.id, selectedFile)}
                        disabled={uploading || !selectedFile}
                        size="sm"
                      >
                        {uploading ? "Uploading..." : "Submit"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
