export class AdminDashboardResponseDto {
  role: 'ADMIN';

  totalProjectManagers: number;

  totalProjects: number;

  projectsByStatus: Record<string, number>;

  totalMaterials: number;

  lowStockMaterials: number;
}

export class ManagerDashboardResponseDto {
  role: 'PROJECT_MANAGER';

  totalProjects: number;

  projectsByStatus: Record<string, number>;

  totalEstimatedBudget: string;

  totalActualCost: string;
}

export type DashboardResponseDto =
  AdminDashboardResponseDto | ManagerDashboardResponseDto;
