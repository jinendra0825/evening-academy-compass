
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Course } from "@/types/models";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  onScheduleAdded: () => void;
}

export function AddScheduleDialog({
  open,
  onOpenChange,
  courses,
  onScheduleAdded,
}: AddScheduleDialogProps) {
  const [formData, setFormData] = useState({
    courseId: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.courseId || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Add the schedule entry
      const { error: scheduleError } = await supabase.from("schedule").insert({
        course_id: formData.courseId,
        day_of_week: formData.dayOfWeek,
        start_time: formData.startTime,
        end_time: formData.endTime,
      });

      if (scheduleError) throw scheduleError;

      // Create an activity notification
      const selectedCourse = courses.find(course => course.id === formData.courseId);
      const courseTitle = selectedCourse ? selectedCourse.name : "Unknown course";
      
      toast({
        title: "Schedule created",
        description: "The schedule has been added successfully",
      });

      onScheduleAdded();
      onOpenChange(false);
      setFormData({
        courseId: "",
        dayOfWeek: "",
        startTime: "",
        endTime: "",
      });
    } catch (error) {
      console.error("Error adding schedule:", error);
      toast({
        title: "Error",
        description: "Failed to add the schedule",
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
          <DialogTitle>Add New Schedule</DialogTitle>
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
            <Label htmlFor="day" className="text-right">
              Day
            </Label>
            <Select
              value={formData.dayOfWeek}
              onValueChange={(value) => handleChange("dayOfWeek", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
