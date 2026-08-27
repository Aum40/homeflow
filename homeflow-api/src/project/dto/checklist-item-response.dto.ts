export class ChecklistItemPhotoResponseDto {
  id: string;

  imageUrl: string;

  createdAt: Date;
}

export class ChecklistItemResponseDto {
  id: string;

  projectId: string;

  title: string;

  isCompleted: boolean;

  completedAt: Date | null;

  completedById: string | null;

  completedByName: string | null;

  photos: ChecklistItemPhotoResponseDto[];

  createdAt: Date;

  updatedAt: Date;
}
