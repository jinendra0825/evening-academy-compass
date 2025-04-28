
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useMaterialsManagement = (
  courseId: string,
  materials: { name: string; url: string }[],
  onMaterialsUpdate: () => void
) => {
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

  return {
    uploading,
    handleFileUpload,
    handleDelete
  };
};
