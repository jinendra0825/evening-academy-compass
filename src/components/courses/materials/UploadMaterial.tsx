
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp } from "lucide-react";

interface UploadMaterialProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

export const UploadMaterial = ({ onUpload, uploading }: UploadMaterialProps) => {
  return (
    <div className="flex items-center gap-4">
      <Input
        type="file"
        onChange={onUpload}
        disabled={uploading}
        className="max-w-xs"
      />
      <Button disabled={uploading}>
        <FileUp className="h-4 w-4 mr-1" />
        Upload Material
      </Button>
    </div>
  );
};
