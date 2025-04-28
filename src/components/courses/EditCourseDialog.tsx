
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Course } from "@/types/models";

interface EditCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: {
    name: string;
    code: string;
    description: string;
    room: string;
  };
  onCourseChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
}

export const EditCourseDialog = ({
  open,
  onOpenChange,
  course,
  onCourseChange,
  onSave,
}: EditCourseDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name">Course Name</label>
            <Input
              id="name"
              name="name"
              value={course.name}
              onChange={onCourseChange}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="code">Course Code</label>
            <Input
              id="code"
              name="code"
              value={course.code}
              onChange={onCourseChange}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="room">Room</label>
            <Input
              id="room"
              name="room"
              value={course.room}
              onChange={onCourseChange}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="description">Description</label>
            <Textarea
              id="description"
              name="description"
              value={course.description}
              onChange={onCourseChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
