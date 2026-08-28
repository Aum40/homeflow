import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProjectService } from './project.service';
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
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { MessageResponseDto } from '@/common/dto/message-response.dto';
import { ImageUrlDto, ImageUrlsDto } from '@/common/dto/image-url.dto';
import { UserRole } from '@/database/generated/prisma/enums';

@ApiBearerAuth()
@ApiTags('Projects')
@Roles(UserRole.CUSTOMER)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Roles(UserRole.PROJECT_MANAGER)
  @Post()
  async create(
    @CurrentUser('sub') projectManagerId: string,
    @Body() dto: CreateProjectDto
  ): Promise<ProjectResponseDto> {
    return this.projectService.createProject(projectManagerId, dto);
  }

  @Get()
  async findMine(
    @CurrentUser('sub') customerId: string
  ): Promise<ProjectResponseDto[]> {
    return this.projectService.getMyProjects(customerId);
  }

  @Roles(UserRole.PROJECT_MANAGER)
  @Get('managed')
  async findManaged(
    @CurrentUser('sub') projectManagerId: string
  ): Promise<ProjectResponseDto[]> {
    return this.projectService.getManagedProjects(projectManagerId);
  }

  @Roles(UserRole.ADMIN)
  @Get('all')
  async findAll(): Promise<ProjectResponseDto[]> {
    return this.projectService.getAllProjects();
  }

  @Roles(UserRole.CUSTOMER, UserRole.PROJECT_MANAGER, UserRole.ADMIN)
  @Get(':id')
  async findOne(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<ProjectResponseDto> {
    return this.projectService.getProjectById(userId, role, id);
  }

  @Roles(UserRole.PROJECT_MANAGER)
  @Patch(':id')
  async update(
    @CurrentUser('sub') projectManagerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto
  ): Promise<ProjectResponseDto> {
    return this.projectService.updateProject(projectManagerId, id, dto);
  }

  @Roles(UserRole.PROJECT_MANAGER)
  @Patch(':id/image')
  async uploadImage(
    @CurrentUser('sub') projectManagerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ImageUrlDto
  ): Promise<ProjectResponseDto> {
    return this.projectService.uploadImage(projectManagerId, id, dto.imageUrl);
  }

  @Roles(UserRole.PROJECT_MANAGER)
  @Delete(':id')
  async remove(
    @CurrentUser('sub') projectManagerId: string,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<MessageResponseDto> {
    await this.projectService.removeProject(projectManagerId, id);
    return { message: 'Project deleted successfully' };
  }

  // --- Material usage ---

  @Roles(UserRole.CUSTOMER, UserRole.PROJECT_MANAGER, UserRole.ADMIN)
  @Get(':id/materials')
  async findMaterials(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<ProjectMaterialResponseDto[]> {
    return this.projectService.getProjectMaterials(userId, role, id);
  }

  // --- Material withdrawal ---

  @Roles(UserRole.PROJECT_MANAGER)
  @Post(':id/materials/:materialId/withdraw')
  async withdrawMaterial(
    @CurrentUser('sub') projectManagerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('materialId', ParseUUIDPipe) materialId: string,
    @Body() dto: WithdrawMaterialDto
  ): Promise<MaterialWithdrawalResponseDto> {
    return this.projectService.withdrawMaterial(
      projectManagerId,
      id,
      materialId,
      dto
    );
  }

  @Roles(UserRole.CUSTOMER, UserRole.PROJECT_MANAGER, UserRole.ADMIN)
  @Get(':id/withdrawals')
  async findWithdrawals(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<MaterialWithdrawalResponseDto[]> {
    return this.projectService.getProjectWithdrawalHistory(userId, role, id);
  }

  // --- Progress checklist ---

  @Roles(UserRole.PROJECT_MANAGER)
  @Post(':id/checklist')
  async addChecklistItem(
    @CurrentUser('sub') projectManagerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateChecklistItemDto
  ): Promise<ChecklistItemResponseDto> {
    return this.projectService.addChecklistItem(projectManagerId, id, dto);
  }

  @Roles(UserRole.CUSTOMER, UserRole.PROJECT_MANAGER, UserRole.ADMIN)
  @Get(':id/checklist')
  async findChecklist(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<ChecklistItemResponseDto[]> {
    return this.projectService.getChecklistItems(userId, role, id);
  }

  @Roles(UserRole.PROJECT_MANAGER)
  @Patch(':id/checklist/reorder')
  async reorderChecklist(
    @CurrentUser('sub') projectManagerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderChecklistItemsDto
  ): Promise<ChecklistItemResponseDto[]> {
    return this.projectService.reorderChecklistItems(projectManagerId, id, dto);
  }

  @Roles(UserRole.PROJECT_MANAGER)
  @Patch(':id/checklist/:itemId')
  async updateChecklistItem(
    @CurrentUser('sub') projectManagerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateChecklistItemDto
  ): Promise<ChecklistItemResponseDto> {
    return this.projectService.updateChecklistItem(
      projectManagerId,
      id,
      itemId,
      dto
    );
  }

  @Roles(UserRole.PROJECT_MANAGER)
  @Patch(':id/checklist/:itemId/complete')
  async toggleChecklistItem(
    @CurrentUser('sub') projectManagerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: ToggleChecklistItemDto
  ): Promise<ChecklistItemResponseDto> {
    return this.projectService.toggleChecklistItem(
      projectManagerId,
      id,
      itemId,
      dto
    );
  }

  @Roles(UserRole.PROJECT_MANAGER)
  @Delete(':id/checklist/:itemId')
  async removeChecklistItem(
    @CurrentUser('sub') projectManagerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string
  ): Promise<MessageResponseDto> {
    await this.projectService.removeChecklistItem(projectManagerId, id, itemId);
    return { message: 'Checklist item removed' };
  }

  @Roles(UserRole.PROJECT_MANAGER)
  @Post(':id/checklist/:itemId/photos')
  async addChecklistItemPhotos(
    @CurrentUser('sub') projectManagerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: ImageUrlsDto
  ): Promise<ChecklistItemResponseDto> {
    return this.projectService.addChecklistItemPhotos(
      projectManagerId,
      id,
      itemId,
      dto.imageUrls
    );
  }

  @Roles(UserRole.PROJECT_MANAGER)
  @Delete(':id/checklist/:itemId/photos/:photoId')
  async removeChecklistItemPhoto(
    @CurrentUser('sub') projectManagerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Param('photoId', ParseUUIDPipe) photoId: string
  ): Promise<ChecklistItemResponseDto> {
    return this.projectService.removeChecklistItemPhoto(
      projectManagerId,
      id,
      itemId,
      photoId
    );
  }

  // --- Budget tracking ---

  @Roles(UserRole.CUSTOMER, UserRole.PROJECT_MANAGER, UserRole.ADMIN)
  @Get(':id/budget')
  async findBudget(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<BudgetResponseDto> {
    return this.projectService.getBudget(userId, role, id);
  }
}
