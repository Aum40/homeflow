export class ProjectMaterialResponseDto {
  id: string;

  projectId: string;

  materialId: string;

  materialName: string;

  unit: string;

  imageUrl: string | null;

  usedQty: number;

  createdAt: Date;

  updatedAt: Date;
}
