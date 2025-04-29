
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
      // Generate a unique filename to avoid collisions
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${courseId}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('course-materials')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filePath);

      const newMaterial = {
        name: file.name,
        url: publicUrl
      };

      // Update the course with the new material
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
    } catch (error: any) {
      console.error("Error uploading material:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload material",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialIndex: number) => {
    try {
      // Extract the filepath from the URL to delete from storage
      const materialToDelete = materials[materialIndex];
      const url = materialToDelete.url;
      
      // Get the path after the bucket name in the URL
      const urlParts = url.split('course-materials/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        // Try to delete the file from storage (this might fail if the file doesn't exist)
        try {
          await supabase.storage
            .from('course-materials')
            .remove([filePath]);
        } catch (storageError) {
          console.error("Error removing file from storage:", storageError);
          // Continue even if storage removal fails - file might have been deleted already
        }
      }

      // Remove the material from the course's materials array
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
    } catch (error: any) {
      console.error("Error deleting material:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete material",
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
