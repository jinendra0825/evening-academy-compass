
import { Button } from "@/components/ui/button";
import { Trash, FileIcon, FileText, Image, File } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MaterialListProps {
  materials: { name: string; url: string }[];
  onDelete: (index: number) => void;
  isTeacher: boolean;
}

export const MaterialList = ({ materials, onDelete, isTeacher }: MaterialListProps) => {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (!extension) return <File className="h-5 w-5" />;
    
    if (['pdf'].includes(extension)) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (['doc', 'docx'].includes(extension)) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (['jpg', 'jpeg', 'png'].includes(extension)) {
      return <Image className="h-5 w-5 text-green-500" />;
    } else {
      return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (materials.length === 0) {
    return <p className="text-muted-foreground italic">No materials uploaded yet</p>;
  }

  return (
    <ul className="space-y-3">
      {materials.map((material, index) => (
        <li key={index}>
          <Card className="p-3 hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getFileIcon(material.name)}
                <a 
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate max-w-xs"
                  title={material.name}
                >
                  {material.name}
                </a>
              </div>
              {isTeacher && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(index)}
                  aria-label={`Delete ${material.name}`}
                  title="Delete material"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
};
