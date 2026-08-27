import { ProjectStatus } from '@/database/generated/prisma/enums';

export class ProjectResponseDto {
  id: string;

  customerId: string;

  customerName: string;

  projectManagerId: string | null;

  projectManagerName: string | null;

  houseDesignId: string | null;

  houseDesignImageUrl: string | null;

  projectName: string;

  imageUrl: string | null;

  houseType: string;

  location: string;

  latitude: string | null;

  longitude: string | null;

  estimatedBudget: string;

  actualCost: string;

  status: ProjectStatus;

  description: string | null;

  progressPercent: number;

  currentStepTitle: string | null;

  startDate: Date | null;

  endDate: Date | null;

  completedAt: Date | null;

  createdAt: Date;

  updatedAt: Date;
}
