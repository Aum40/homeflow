import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialResponseDto } from './dto/material-response.dto';
import { MessageResponseDto } from '@/common/dto/message-response.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/database/generated/prisma/enums';

@ApiBearerAuth()
@ApiTags('Materials')
@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() dto: CreateMaterialDto): Promise<MaterialResponseDto> {
    return this.materialService.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @Get()
  async findAll(): Promise<MaterialResponseDto[]> {
    return this.materialService.findAll();
  }

  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<MaterialResponseDto> {
    return this.materialService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaterialDto
  ): Promise<MaterialResponseDto> {
    return this.materialService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @Patch(':id/image')
  async uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File
  ): Promise<MaterialResponseDto> {
    return this.materialService.uploadImage(id, file);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<MessageResponseDto> {
    await this.materialService.remove(id);
    return { message: 'Material deleted successfully' };
  }
}
