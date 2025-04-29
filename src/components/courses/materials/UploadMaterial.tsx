
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";

interface UploadMaterialProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

export const UploadMaterial = ({ onUpload, uploading }: UploadMaterialProps) => {
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Handle file selection with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check file size (50MB max as configured in Supabase)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type
    const allowedTypes = [
      "application/pdf", 
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
      "image/jpeg", 
      "image/png"
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, Word document, or image files (JPEG/PNG)",
        variant: "destructive",
      });
      return;
    }
    
    setFileName(file.name);
    
    // Simulate progress while uploading
    if (!uploading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);
      
      // Call the parent's upload handler
      onUpload(e);
      
      // Clean up interval on completion
      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        // Reset after upload completes
        setTimeout(() => {
          setProgress(0);
          setFileName(null);
        }, 2000);
      }, 2000);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          className="max-w-xs"
          accept=".pdf,.doc,.docx,.jpeg,.jpg,.png"
        />
        <Button disabled={uploading} type="button">
          <FileUp className="h-4 w-4 mr-2" />
          Upload Material
        </Button>
      </div>
      
      {(uploading || progress > 0) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {fileName && fileName}
            </span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
};
