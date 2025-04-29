
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Course } from "@/types/models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActivityCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  onActivityAdded: () => void;
}

export function ActivityCreationDialog({
  open,
  onOpenChange,
  courses,
  onActivityAdded,
}: ActivityCreationDialogProps) {
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    message: "",
    type: "announcement" as "announcement" | "alert" | "message",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    field: string,
    value: string | "announcement" | "alert" | "message"
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.courseId || !formData.title || !formData.message) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get enrolled students for the course
      const { data: enrollments, error: enrollmentError } = await supabase
        .from("course_enrollments")
        .select("student_id")
        .eq("course_id", formData.courseId)
        .eq("status", "enrolled");

      if (enrollmentError) throw enrollmentError;

      const recipientIds = enrollments?.map((e) => e.student_id) || [];

      // Create the activity notification
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          title: formData.title,
          message: formData.message,
          date: new Date().toISOString(),
          recipientids: recipientIds, // Changed to match the database column name
          read: false,
          type: formData.type,
          course_id: formData.courseId,
        });

      if (notificationError) throw notificationError;

      toast({
        title: "Activity created",
        description: "The activity has been added successfully",
      });

      onActivityAdded();
      onOpenChange(false);
      setFormData({
        courseId: "",
        title: "",
        message: "",
        type: "announcement",
      });
    } catch (error) {
      console.error("Error adding activity:", error);
      toast({
        title: "Error",
        description: "Failed to add the activity",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Activity</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="course" className="text-right">
              Course
            </Label>
            <Select
              value={formData.courseId}
              onValueChange={(value) => handleChange("courseId", value)}
              disabled={courses.length === 0}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: "announcement" | "alert" | "message") => 
                handleChange("type", value)
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="message">Message</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="col-span-3"
              placeholder="Activity title"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              Message
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              className="col-span-3"
              placeholder="Activity details"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Activity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
