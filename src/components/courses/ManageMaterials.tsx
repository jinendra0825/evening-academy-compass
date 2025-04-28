
import { MaterialList } from "./materials/MaterialList";
import { UploadMaterial } from "./materials/UploadMaterial";
import { useMaterialsManagement } from "@/hooks/useMaterialsManagement";

interface ManageMaterialsProps {
  courseId: string;
  materials: { name: string; url: string }[];
  onMaterialsUpdate: () => void;
  isTeacher?: boolean;
}

export const ManageMaterials = ({ 
  courseId, 
  materials,
  onMaterialsUpdate,
  isTeacher = true
}: ManageMaterialsProps) => {
  const { uploading, handleFileUpload, handleDelete } = useMaterialsManagement(
    courseId,
    materials,
    onMaterialsUpdate
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Course Materials</h3>
      
      {isTeacher && (
        <UploadMaterial
          onUpload={handleFileUpload}
          uploading={uploading}
        />
      )}

      <MaterialList 
        materials={materials}
        onDelete={handleDelete}
        isTeacher={isTeacher}
      />
    </div>
  );
};
