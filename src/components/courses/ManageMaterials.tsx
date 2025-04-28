
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { FileUp, Trash } from "lucide-react";

interface ManageMaterialsProps {
  courseId: string;
  materials: { name: string; url: string }[];
  onMaterialsUpdate: () => void;
}

export const ManageMaterials = ({ 
  courseId, 
  materials, 
  onMaterialsUpdate 
}: ManageMaterialsProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${courseId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filePath);

      const newMaterial = {
        name: file.name,
        url: publicUrl
      };

      const { error: updateError } = await supabase
        .from('courses')
        .update({
          materials: [...materials, newMaterial]
        })
        .eq('id', courseId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Material uploaded successfully",
      });

      onMaterialsUpdate();
    } catch (error) {
      console.error("Error uploading material:", error);
      toast({
        title: "Error",
        description: "Failed to upload material",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialIndex: number) => {
    try {
      const newMaterials = materials.filter((_, index) => index !== materialIndex);
      
      const { error } = await supabase
        .from('courses')
        .update({
          materials: newMaterials
        })
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Material deleted successfully",
      });

      onMaterialsUpdate();
    } catch (error) {
      console.error("Error deleting material:", error);
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Course Materials</h3>
      
      <div className="flex items-center gap-4">
        <Input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          className="max-w-xs"
        />
        <Button disabled={uploading}>
          <FileUp className="h-4 w-4 mr-1" />
          Upload Material
        </Button>
      </div>

      {materials.length > 0 ? (
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
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">No materials uploaded yet</p>
      )}
    </div>
  );
};
