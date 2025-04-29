
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Trash, Building, BookOpen, Edit } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { EditScheduleDialog } from "./EditScheduleDialog";

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

interface ScheduleItemProps {
  entry: ScheduleEntry;
  isTeacher: boolean;
  onUpdate: () => void;
}

export function ScheduleItem({ entry, isTeacher, onUpdate }: ScheduleItemProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Format times for display
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      const displayMinute = minute.toString().padStart(2, '0');
      
      return `${displayHour}:${displayMinute} ${period}`;
    } catch (e) {
      return timeString;
    }
  };
  
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('schedule')
        .delete()
        .eq('id', entry.id);
        
      if (error) throw error;
      
      toast({
        title: "Schedule deleted",
        description: "The schedule entry was successfully removed.",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete the schedule entry.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  return (
    <div className="flex items-center justify-between p-3 bg-card border rounded-md shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="h-10 w-1 bg-primary rounded-full"></div>
        <div>
          <h3 className="font-medium">{entry.course?.name || "Unknown Course"}</h3>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> {entry.course?.code || "No code"}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            {entry.course?.room && (
              <>
                <Building className="h-3 w-3" /> Room {entry.course.room}
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="text-right mr-4">
          <div className="font-medium flex items-center">
            <Clock className="h-3 w-3 mr-1" /> 
            {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
          </div>
        </div>
        
        {isTeacher && (
          <div className="flex space-x-2">
            <Button size="icon" variant="outline" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this schedule entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {editDialogOpen && (
        <EditScheduleDialog 
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          scheduleEntry={entry}
          onScheduleUpdated={onUpdate}
        />
      )}
    </div>
  );
}
