import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
  MaterialWithdrawal,
  Project,
  ProjectChecklistItem,
  ProjectChecklistItemPhoto,
  ProjectMaterial
} from '@/database/generated/prisma/client';
import { ProjectStatus, UserRole } from '@/database/generated/prisma/enums';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { WithdrawMaterialDto } from './dto/withdraw-material.dto';
import { ProjectMaterialResponseDto } from './dto/project-material-response.dto';
import { MaterialWithdrawalResponseDto } from './dto/material-withdrawal-response.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { ToggleChecklistItemDto } from './dto/toggle-checklist-item.dto';
import { ChecklistItemResponseDto } from './dto/checklist-item-response.dto';
import { ReorderChecklistItemsDto } from './dto/reorder-checklist-items.dto';
import { BudgetResponseDto } from './dto/budget-response.dto';
import { CloudinaryService } from '@/infrastructure/upload/cloudinary.service';

type ProjectMaterialWithMaterial = ProjectMaterial & {
  material: { name: string; unit: string; imageUrl: string | null };
};

type MaterialWithdrawalWithRelations = MaterialWithdrawal & {
  projectMaterial: { material: { name: string } };
  withdrawnBy: { firstName: string; lastName: string };
};

type ChecklistItemWithRelations = ProjectChecklistItem & {
  completedBy: { firstName: string; lastName: string } | null;
  photos: ProjectChecklistItemPhoto[];
};

type ProjectWithRelations = Project & {
  customer: { firstName: string; lastName: string };
  projectManager: { firstName: string; lastName: string } | null;
  houseDesign: { imageUrl: string | null } | null;
  checklistItems: { title: string; isCompleted: boolean }[];
};

@Injectable()
export class ProjectService {
  private readonly projectResponseInclude = {
    customer: { select: { firstName: true, lastName: true } },
    projectManager: { select: { firstName: true, lastName: true } },
    houseDesign: { select: { imageUrl: true } },
    checklistItems: {
      select: { title: true, isCompleted: true },
      orderBy: [{ order: 'asc' as const }, { createdAt: 'asc' as const }]
    }
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async createProject(
    projectManagerId: string,
    dto: CreateProjectDto
  ): Promise<ProjectResponseDto> {
    const customer = await this.prisma.user.findUnique({
      where: { id: dto.customerId }
    });
    if (!customer || customer.role !== UserRole.CUSTOMER) {
      throw new NotFoundException('Customer not found');
    }

    const houseDesign = await this.prisma.houseDesign.findUnique({
      where: { id: dto.houseDesignId },
      include: { steps: { orderBy: { order: 'asc' } } }
    });
    if (!houseDesign) {
      throw new NotFoundException('House design not found');
    }

    const project = await this.prisma.project.create({
      data: {
        customerId: customer.id,
        projectManagerId,
        houseDesignId: houseDesign.id,
        projectName: dto.projectName,
        houseType: houseDesign.name,
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
        estimatedBudget: houseDesign.basePrice,
        description: dto.description,
        status: ProjectStatus.PLANNING,
        // วันที่เริ่มต้นโครงการ = วันที่ส่งคำขอ ไม่ให้กรอกเอง
        startDate: new Date(),
        checklistItems: houseDesign.steps.length
          ? {
              create: houseDesign.steps.map((step, index) => ({
                title: step.title,
                order: index
              }))
            }
          : undefined
      },
      include: this.projectResponseInclude
    });

    return this.toResponseDto(project);
  }

  async getMyProjects(customerId: string): Promise<ProjectResponseDto[]> {
    const projects = await this.prisma.project.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: this.projectResponseInclude
    });

    return projects.map((project) => this.toResponseDto(project));
  }

  async getProjectById(
    userId: string,
    role: UserRole,
    projectId: string
  ): Promise<ProjectResponseDto> {
    const project = await this.findProjectOr404(projectId);
    this.assertCanView(project, userId, role);

    const enriched = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: this.projectResponseInclude
    });

    return this.toResponseDto(enriched!);
  }

  async getManagedProjects(
    projectManagerId: string
  ): Promise<ProjectResponseDto[]> {
    const projects = await this.prisma.project.findMany({
      where: { projectManagerId },
      orderBy: { createdAt: 'desc' },
      include: this.projectResponseInclude
    });

    return projects.map((project) => this.toResponseDto(project));
  }

  async getAllProjects(): Promise<ProjectResponseDto[]> {
    const projects = await this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: this.projectResponseInclude
    });

    return projects.map((project) => this.toResponseDto(project));
  }

  async updateProject(
    projectManagerId: string,
    projectId: string,
    dto: UpdateProjectDto
  ): Promise<ProjectResponseDto> {
    const project = await this.findProjectOr404(projectId);
    this.assertIsManager(project, projectManagerId);

    if (dto.status === ProjectStatus.REQUESTED) {
      throw new BadRequestException('Status cannot be reverted to REQUESTED');
    }

    const startDate = dto.startDate ?? project.startDate;
    const endDate = dto.endDate ?? project.endDate;
    if (startDate && endDate && endDate < startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }

    const completedAt =
      dto.status === undefined
        ? undefined
        : dto.status === ProjectStatus.COMPLETED
          ? new Date()
          : null;

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        projectName: dto.projectName,
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
        estimatedBudget: dto.estimatedBudget,
        startDate: dto.startDate,
        endDate: dto.endDate,
        status: dto.status,
        completedAt
      },
      include: this.projectResponseInclude
    });

    return this.toResponseDto(updated);
  }

  async uploadImage(
    projectManagerId: string,
    projectId: string,
    file: Express.Multer.File
  ): Promise<ProjectResponseDto> {
    const project = await this.findProjectOr404(projectId);
    this.assertIsManager(project, projectManagerId);

    const imageUrl = await this.cloudinaryService.upload(file);

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: { imageUrl },
      include: this.projectResponseInclude
    });

    return this.toResponseDto(updated);
  }

  async removeProject(
    projectManagerId: string,
    projectId: string
  ): Promise<void> {
    const project = await this.findProjectOr404(projectId);
    this.assertIsManager(project, projectManagerId);

    // Withdrawals permanently decrement global material stock and add to
    // actualCost, so a project that has any must keep its audit trail.
    const withdrawalCount = await this.prisma.materialWithdrawal.count({
      where: { projectMaterial: { projectId } }
    });
    if (withdrawalCount > 0) {
      throw new ConflictException(
        'This project already has material withdrawals and cannot be deleted'
      );
    }

    await this.prisma.$transaction([
      this.prisma.projectChecklistItemPhoto.deleteMany({
        where: { checklistItem: { projectId } }
      }),
      this.prisma.projectChecklistItem.deleteMany({ where: { projectId } }),
      this.prisma.projectMaterial.deleteMany({ where: { projectId } }),
      this.prisma.project.delete({ where: { id: projectId } })
    ]);
  }

  // --- Material usage ---

  async getProjectMaterials(
    userId: string,
    role: UserRole,
    projectId: string
  ): Promise<ProjectMaterialResponseDto[]> {
    const project = await this.findProjectOr404(projectId);
    this.assertCanView(project, userId, role);

    const projectMaterials = await this.prisma.projectMaterial.findMany({
      where: { projectId },
      include: {
        material: { select: { name: true, unit: true, imageUrl: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    return projectMaterials.map((pm) => this.toProjectMaterialResponseDto(pm));
  }

  // --- Material withdrawal ---

  async withdrawMaterial(
    projectManagerId: string,
    projectId: string,
    materialId: string,
    dto: WithdrawMaterialDto
  ): Promise<MaterialWithdrawalResponseDto> {
    const project = await this.findProjectOr404(projectId);
    this.assertIsManager(project, projectManagerId);

    const material = await this.prisma.material.findUnique({
      where: { id: materialId }
    });
    if (!material) {
      throw new NotFoundException('Material not found');
    }

    if (material.stock < dto.qty) {
      throw new ConflictException(
        'Not enough stock available for this withdrawal'
      );
    }

    const projectMaterial = await this.prisma.projectMaterial.upsert({
      where: { projectId_materialId: { projectId, materialId } },
      create: { projectId, materialId },
      update: {}
    });

    const unitPrice = material.price;
    const cost = unitPrice.mul(dto.qty);

    const [withdrawal] = await this.prisma.$transaction([
      this.prisma.materialWithdrawal.create({
        data: {
          projectMaterialId: projectMaterial.id,
          qty: dto.qty,
          unitPriceAtTime: unitPrice,
          withdrawnById: projectManagerId
        },
        include: {
          withdrawnBy: { select: { firstName: true, lastName: true } },
          projectMaterial: {
            include: { material: { select: { name: true } } }
          }
        }
      }),
      this.prisma.material.update({
        where: { id: materialId },
        data: { stock: { decrement: dto.qty } }
      }),
      this.prisma.projectMaterial.update({
        where: { id: projectMaterial.id },
        data: { usedQty: { increment: dto.qty } }
      }),
      this.prisma.project.update({
        where: { id: projectId },
        data: { actualCost: { increment: cost } }
      })
    ]);

    return this.toWithdrawalResponseDto(withdrawal);
  }

  async getProjectWithdrawalHistory(
    userId: string,
    role: UserRole,
    projectId: string
  ): Promise<MaterialWithdrawalResponseDto[]> {
    const project = await this.findProjectOr404(projectId);
    this.assertCanView(project, userId, role);

    const withdrawals = await this.prisma.materialWithdrawal.findMany({
      where: { projectMaterial: { projectId } },
      include: {
        withdrawnBy: { select: { firstName: true, lastName: true } },
        projectMaterial: {
          include: { material: { select: { name: true } } }
        }
      },
      orderBy: { withdrawnAt: 'desc' }
    });

    return withdrawals.map((w) => this.toWithdrawalResponseDto(w));
  }

  // --- Progress checklist ---

  async addChecklistItem(
    projectManagerId: string,
    projectId: string,
    dto: CreateChecklistItemDto
  ): Promise<ChecklistItemResponseDto> {
    const project = await this.findProjectOr404(projectId);
    this.assertIsManager(project, projectManagerId);

    const order = await this.prisma.projectChecklistItem.count({
      where: { projectId }
    });

    const item = await this.prisma.projectChecklistItem.create({
      data: { projectId, title: dto.title, order },
      include: {
        completedBy: { select: { firstName: true, lastName: true } },
        photos: true
      }
    });

    return this.toChecklistItemResponseDto(item);
  }

  async getChecklistItems(
    userId: string,
    role: UserRole,
    projectId: string
  ): Promise<ChecklistItemResponseDto[]> {
    const project = await this.findProjectOr404(projectId);
    this.assertCanView(project, userId, role);

    const items = await this.prisma.projectChecklistItem.findMany({
      where: { projectId },
      include: {
        completedBy: { select: { firstName: true, lastName: true } },
        photos: true
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
    });

    return items.map((item) => this.toChecklistItemResponseDto(item));
  }

  async reorderChecklistItems(
    projectManagerId: string,
    projectId: string,
    dto: ReorderChecklistItemsDto
  ): Promise<ChecklistItemResponseDto[]> {
    const project = await this.findProjectOr404(projectId);
    this.assertIsManager(project, projectManagerId);

    const existing = await this.prisma.projectChecklistItem.findMany({
      where: { projectId },
      select: { id: true }
    });
    const existingIds = new Set(existing.map((item) => item.id));

    if (
      dto.itemIds.length !== existingIds.size ||
      !dto.itemIds.every((id) => existingIds.has(id))
    ) {
      throw new BadRequestException(
        "itemIds must exactly match the project's checklist items"
      );
    }

    await this.prisma.$transaction(
      dto.itemIds.map((id, index) =>
        this.prisma.projectChecklistItem.update({
          where: { id },
          data: { order: index }
        })
      )
    );

    return this.getChecklistItems(
      projectManagerId,
      UserRole.PROJECT_MANAGER,
      projectId
    );
  }

  async updateChecklistItem(
    projectManagerId: string,
    projectId: string,
    itemId: string,
    dto: UpdateChecklistItemDto
  ): Promise<ChecklistItemResponseDto> {
    const project = await this.findProjectOr404(projectId);
    this.assertIsManager(project, projectManagerId);
    await this.findChecklistItemOr404(projectId, itemId);

    const updated = await this.prisma.projectChecklistItem.update({
      where: { id: itemId },
      data: { title: dto.title },
      include: {
        completedBy: { select: { firstName: true, lastName: true } },
        photos: true
      }
    });

    return this.toChecklistItemResponseDto(updated);
  }

  async toggleChecklistItem(
    projectManagerId: string,
    projectId: string,
    itemId: string,
    dto: ToggleChecklistItemDto
  ): Promise<ChecklistItemResponseDto> {
    const project = await this.findProjectOr404(projectId);
    this.assertIsManager(project, projectManagerId);
    await this.findChecklistItemOr404(projectId, itemId);

    const updated = await this.prisma.projectChecklistItem.update({
      where: { id: itemId },
      data: dto.isCompleted
        ? {
            isCompleted: true,
            completedAt: new Date(),
            completedById: projectManagerId
          }
        : { isCompleted: false, completedAt: null, completedById: null },
      include: {
        completedBy: { select: { firstName: true, lastName: true } },
        photos: true
      }
    });

    return this.toChecklistItemResponseDto(updated);
  }

  async removeChecklistItem(
    projectManagerId: string,
    projectId: string,
    itemId: string
  ): Promise<void> {
    const project = await this.findProjectOr404(projectId);
    this.assertIsManager(project, projectManagerId);
    await this.findChecklistItemOr404(projectId, itemId);

    await this.prisma.projectChecklistItemPhoto.deleteMany({
      where: { checklistItemId: itemId }
    });
    await this.prisma.projectChecklistItem.delete({ where: { id: itemId } });
  }

  async addChecklistItemPhotos(
    projectManagerId: string,
    projectId: string,
    itemId: string,
    files: Express.Multer.File[]
  ): Promise<ChecklistItemResponseDto> {
    const project = await this.findProjectOr404(projectId);
    this.assertIsManager(project, projectManagerId);
    await this.findChecklistItemOr404(projectId, itemId);

    const imageUrls = await Promise.all(
      files.map((file) => this.cloudinaryService.upload(file))
    );

    await this.prisma.projectChecklistItemPhoto.createMany({
      data: imageUrls.map((imageUrl) => ({
        checklistItemId: itemId,
        imageUrl
      }))
    });

    const updated = await this.prisma.projectChecklistItem.findUnique({
      where: { id: itemId },
      include: {
        completedBy: { select: { firstName: true, lastName: true } },
        photos: true
      }
    });

    return this.toChecklistItemResponseDto(updated!);
  }

  async removeChecklistItemPhoto(
    projectManagerId: string,
    projectId: string,
    itemId: string,
    photoId: string
  ): Promise<ChecklistItemResponseDto> {
    const project = await this.findProjectOr404(projectId);
    this.assertIsManager(project, projectManagerId);
    await this.findChecklistItemOr404(projectId, itemId);

    const photo = await this.prisma.projectChecklistItemPhoto.findUnique({
      where: { id: photoId }
    });
    if (!photo || photo.checklistItemId !== itemId) {
      throw new NotFoundException('Photo not found');
    }

    await this.prisma.projectChecklistItemPhoto.delete({
      where: { id: photoId }
    });

    const updated = await this.prisma.projectChecklistItem.findUnique({
      where: { id: itemId },
      include: {
        completedBy: { select: { firstName: true, lastName: true } },
        photos: true
      }
    });

    return this.toChecklistItemResponseDto(updated!);
  }

  // --- Budget tracking ---

  async getBudget(
    userId: string,
    role: UserRole,
    projectId: string
  ): Promise<BudgetResponseDto> {
    const project = await this.findProjectOr404(projectId);
    this.assertCanView(project, userId, role);

    const estimatedBudget = Number(project.estimatedBudget);
    const actualCost = Number(project.actualCost);
    const remainingBudget = estimatedBudget - actualCost;
    const usagePercent =
      estimatedBudget > 0
        ? Math.round((actualCost / estimatedBudget) * 1000) / 10
        : 0;

    return {
      estimatedBudget: project.estimatedBudget.toString(),
      actualCost: project.actualCost.toString(),
      remainingBudget: remainingBudget.toFixed(2),
      usagePercent,
      isOverBudget: actualCost > estimatedBudget
    };
  }

  // --- Helpers ---

  private async findProjectOr404(projectId: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  private assertIsManager(project: Project, projectManagerId: string): void {
    if (project.projectManagerId !== projectManagerId) {
      throw new ForbiddenException(
        'You are not the project manager assigned to this project'
      );
    }
  }

  /**
   * ADMIN ดูได้ทุกโครงการ (อ่านอย่างเดียว — ไม่มีสิทธิ์แก้ไขหรือลบ)
   * ส่วน role อื่นต้องเป็นเจ้าของโครงการหรือ PM ที่รับผิดชอบเท่านั้น
   */
  private assertCanView(
    project: Project,
    userId: string,
    role: UserRole
  ): void {
    if (role === UserRole.ADMIN) {
      return;
    }

    if (project.customerId !== userId && project.projectManagerId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }
  }

  private async findChecklistItemOr404(
    projectId: string,
    itemId: string
  ): Promise<ProjectChecklistItem> {
    const item = await this.prisma.projectChecklistItem.findUnique({
      where: { id: itemId }
    });

    if (!item || item.projectId !== projectId) {
      throw new NotFoundException('Checklist item not found for this project');
    }

    return item;
  }

  private toResponseDto(project: ProjectWithRelations): ProjectResponseDto {
    const totalSteps = project.checklistItems.length;
    const completedSteps = project.checklistItems.filter(
      (item) => item.isCompleted
    ).length;
    const currentStep = project.checklistItems.find(
      (item) => !item.isCompleted
    );

    return {
      id: project.id,
      customerId: project.customerId,
      customerName: `${project.customer.firstName} ${project.customer.lastName}`,
      projectManagerId: project.projectManagerId,
      projectManagerName: project.projectManager
        ? `${project.projectManager.firstName} ${project.projectManager.lastName}`
        : null,
      houseDesignId: project.houseDesignId,
      houseDesignImageUrl: project.houseDesign
        ? project.houseDesign.imageUrl
        : null,
      projectName: project.projectName,
      imageUrl: project.imageUrl,
      houseType: project.houseType,
      location: project.location,
      latitude: project.latitude ? project.latitude.toString() : null,
      longitude: project.longitude ? project.longitude.toString() : null,
      estimatedBudget: project.estimatedBudget.toString(),
      actualCost: project.actualCost.toString(),
      status: project.status,
      description: project.description,
      progressPercent: totalSteps
        ? Math.round((completedSteps / totalSteps) * 100)
        : 0,
      currentStepTitle: currentStep ? currentStep.title : null,
      startDate: project.startDate,
      endDate: project.endDate,
      completedAt: project.completedAt,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };
  }

  private toProjectMaterialResponseDto(
    projectMaterial: ProjectMaterialWithMaterial
  ): ProjectMaterialResponseDto {
    return {
      id: projectMaterial.id,
      projectId: projectMaterial.projectId,
      materialId: projectMaterial.materialId,
      materialName: projectMaterial.material.name,
      unit: projectMaterial.material.unit,
      imageUrl: projectMaterial.material.imageUrl,
      usedQty: projectMaterial.usedQty,
      createdAt: projectMaterial.createdAt,
      updatedAt: projectMaterial.updatedAt
    };
  }

  private toWithdrawalResponseDto(
    withdrawal: MaterialWithdrawalWithRelations
  ): MaterialWithdrawalResponseDto {
    return {
      id: withdrawal.id,
      projectMaterialId: withdrawal.projectMaterialId,
      materialName: withdrawal.projectMaterial.material.name,
      qty: withdrawal.qty,
      unitPriceAtTime: withdrawal.unitPriceAtTime.toString(),
      withdrawnById: withdrawal.withdrawnById,
      withdrawnByName: `${withdrawal.withdrawnBy.firstName} ${withdrawal.withdrawnBy.lastName}`,
      withdrawnAt: withdrawal.withdrawnAt
    };
  }

  private toChecklistItemResponseDto(
    item: ChecklistItemWithRelations
  ): ChecklistItemResponseDto {
    return {
      id: item.id,
      projectId: item.projectId,
      title: item.title,
      isCompleted: item.isCompleted,
      completedAt: item.completedAt,
      completedById: item.completedById,
      completedByName: item.completedBy
        ? `${item.completedBy.firstName} ${item.completedBy.lastName}`
        : null,
      photos: item.photos.map((photo) => ({
        id: photo.id,
        imageUrl: photo.imageUrl,
        createdAt: photo.createdAt
      })),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  }
}
