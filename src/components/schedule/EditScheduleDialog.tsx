
import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduleEntry {
  id: string;
  course_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  course?: {
    name: string;
    code: string;
    room: string | null;
  }
}

interface EditScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleEntry: ScheduleEntry;
  onScheduleUpdated: () => void;
}

export function EditScheduleDialog({
  open,
  onOpenChange,
  scheduleEntry,
  onScheduleUpdated,
}: EditScheduleDialogProps) {
  const [formData, setFormData] = useState({
    dayOfWeek: scheduleEntry.day_of_week,
    startTime: scheduleEntry.start_time,
    endTime: scheduleEntry.end_time,
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

  useEffect(() => {
    setFormData({
      dayOfWeek: scheduleEntry.day_of_week,
      startTime: scheduleEntry.start_time,
      endTime: scheduleEntry.end_time,
    });
  }, [scheduleEntry]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.dayOfWeek || !formData.startTime || !formData.endTime) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("schedule")
        .update({
          day_of_week: formData.dayOfWeek,
          start_time: formData.startTime,
          end_time: formData.endTime,
        })
        .eq("id", scheduleEntry.id);

      if (error) throw error;

      toast({
        title: "Schedule updated",
        description: "The schedule has been updated successfully",
      });

      onScheduleUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to update the schedule",
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
          <DialogTitle>Edit Schedule</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="course" className="text-right">
              Course
            </Label>
            <Input 
              value={scheduleEntry.course?.name || "Unknown Course"} 
              disabled 
              className="col-span-3" 
            />
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
            {isSubmitting ? "Updating..." : "Update Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
