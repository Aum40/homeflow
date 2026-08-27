import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Project } from '@/database/generated/prisma/client';
import { UserRole } from '@/database/generated/prisma/enums';
import {
  AdminDashboardResponseDto,
  ManagerDashboardResponseDto
} from './dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminDashboard(): Promise<AdminDashboardResponseDto> {
    const [
      totalProjectManagers,
      totalProjects,
      projectsByStatusRaw,
      totalMaterials,
      lowStockMaterials
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.PROJECT_MANAGER } }),
      this.prisma.project.count(),
      this.prisma.project.groupBy({ by: ['status'], _count: true }),
      this.prisma.material.count(),
      this.prisma.material.count({ where: { stock: { lt: 10 } } })
    ]);

    return {
      role: 'ADMIN',
      totalProjectManagers,
      totalProjects,
      projectsByStatus: this.toStatusMap(projectsByStatusRaw),
      totalMaterials,
      lowStockMaterials
    };
  }

  async getManagerDashboard(
    projectManagerId: string
  ): Promise<ManagerDashboardResponseDto> {
    const projects = await this.prisma.project.findMany({
      where: { projectManagerId }
    });

    return {
      role: 'PROJECT_MANAGER',
      ...this.summarizeProjects(projects)
    };
  }

  private summarizeProjects(projects: Project[]) {
    const projectsByStatus = projects.reduce<Record<string, number>>(
      (acc, project) => {
        acc[project.status] = (acc[project.status] ?? 0) + 1;
        return acc;
      },
      {}
    );

    const totalEstimatedBudget = projects.reduce(
      (sum, project) => sum + Number(project.estimatedBudget),
      0
    );
    const totalActualCost = projects.reduce(
      (sum, project) => sum + Number(project.actualCost),
      0
    );

    return {
      totalProjects: projects.length,
      projectsByStatus,
      totalEstimatedBudget: totalEstimatedBudget.toFixed(2),
      totalActualCost: totalActualCost.toFixed(2)
    };
  }

  private toStatusMap(
    groups: { status: string; _count: number }[]
  ): Record<string, number> {
    return groups.reduce<Record<string, number>>((acc, group) => {
      acc[group.status] = group._count;
      return acc;
    }, {});
  }
}
