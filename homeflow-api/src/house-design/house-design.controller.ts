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
import { HouseDesignService } from './house-design.service';
import { CreateHouseDesignDto } from './dto/create-house-design.dto';
import { UpdateHouseDesignDto } from './dto/update-house-design.dto';
import { HouseDesignResponseDto } from './dto/house-design-response.dto';
import { MessageResponseDto } from '@/common/dto/message-response.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/database/generated/prisma/enums';

@ApiBearerAuth()
@ApiTags('House Designs')
@Controller('house-designs')
export class HouseDesignController {
  constructor(private readonly houseDesignService: HouseDesignService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async create(
    @Body() dto: CreateHouseDesignDto
  ): Promise<HouseDesignResponseDto> {
    return this.houseDesignService.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.CUSTOMER)
  @Get()
  async findAll(): Promise<HouseDesignResponseDto[]> {
    return this.houseDesignService.findAll();
  }

  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.CUSTOMER)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<HouseDesignResponseDto> {
    return this.houseDesignService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHouseDesignDto
  ): Promise<HouseDesignResponseDto> {
    return this.houseDesignService.update(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @Patch(':id/image')
  async uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File
  ): Promise<HouseDesignResponseDto> {
    return this.houseDesignService.uploadImage(id, file);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<MessageResponseDto> {
    await this.houseDesignService.remove(id);
    return { message: 'House design deleted successfully' };
  }
}
