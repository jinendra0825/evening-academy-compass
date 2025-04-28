
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newCourse: {
    name: string;
    code: string;
    description: string;
    room: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CreateCourseDialog = ({
  open,
  onOpenChange,
  newCourse,
  onInputChange,
  onSubmit,
}: CreateCourseDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Introduction to Mathematics"
                value={newCourse.name}
                onChange={onInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="code">Course Code</Label>
              <Input
                id="code"
                name="code"
                placeholder="MATH101"
                value={newCourse.code}
                onChange={onInputChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                name="room"
                placeholder="Room A-101"
                value={newCourse.room}
                onChange={onInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Course description..."
                value={newCourse.description}
                onChange={onInputChange}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Course</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

