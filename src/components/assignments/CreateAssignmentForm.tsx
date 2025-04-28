
import { useState } from "react";
import { Course } from "@/types/assignments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload } from "lucide-react";

interface CreateAssignmentFormProps {
  courses: Course[];
  uploading: boolean;
  onSubmit: (formData: {
    title: string;
    description: string;
    due_date: string;
    course_id: string;
  }, file: File | null) => void;
}

export const CreateAssignmentForm = ({
  courses,
  uploading,
  onSubmit,
}: CreateAssignmentFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    course_id: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, selectedFile);
    setFormData({
      title: "",
      description: "",
      due_date: "",
      course_id: "",
    });
    setSelectedFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Assignment</CardTitle>
        <CardDescription>Upload a new assignment for your course</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter assignment title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="course_id">Course</Label>
            <select
              id="course_id"
              name="course_id"
              value={formData.course_id}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-2 text-base bg-background"
              required
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              name="due_date"
              type="date"
              value={formData.due_date}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Assignment Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter assignment details and instructions"
              rows={4}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">Assignment File (PDF, DOCX, etc.)</Label>
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label htmlFor="file" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                <span className="font-medium mb-1">
                  {selectedFile ? selectedFile.name : "Click to upload a file"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {!selectedFile && "Supports PDF, DOCX, and image files"}
                </span>
              </Label>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={uploading || !selectedFile}
          >
            {uploading ? "Uploading..." : "Create Assignment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
