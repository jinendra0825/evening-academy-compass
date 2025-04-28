
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface MaterialListProps {
  materials: { name: string; url: string }[];
  onDelete: (index: number) => void;
  isTeacher: boolean;
}

export const MaterialList = ({ materials, onDelete, isTeacher }: MaterialListProps) => {
  if (materials.length === 0) {
    return <p className="text-muted-foreground">No materials uploaded yet</p>;
  }

  return (
    <ul className="space-y-2">
      {materials.map((material, index) => (
        <li key={index} className="flex items-center justify-between p-2 border rounded">
          <a 
            href={material.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {material.name}
          </a>
          {isTeacher && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(index)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
};
