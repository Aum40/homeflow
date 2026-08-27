import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Material } from '@/database/generated/prisma/client';
import { isForeignKeyRestrictViolation } from '@/common/utils/prisma-error.util';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialResponseDto } from './dto/material-response.dto';
import { CloudinaryService } from '@/infrastructure/upload/cloudinary.service';

@Injectable()
export class MaterialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async create(dto: CreateMaterialDto): Promise<MaterialResponseDto> {
    const material = await this.prisma.material.create({
      data: {
        name: dto.name,
        category: dto.category,
        unit: dto.unit,
        price: dto.price,
        stock: dto.stock ?? 0
      }
    });

    return this.toResponseDto(material);
  }

  async findAll(): Promise<MaterialResponseDto[]> {
    const materials = await this.prisma.material.findMany({
      orderBy: { name: 'asc' }
    });

    return materials.map((material) => this.toResponseDto(material));
  }

  async findOne(id: string): Promise<MaterialResponseDto> {
    const material = await this.prisma.material.findUnique({
      where: { id }
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return this.toResponseDto(material);
  }

  async update(
    id: string,
    dto: UpdateMaterialDto
  ): Promise<MaterialResponseDto> {
    const existing = await this.prisma.material.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Material not found');
    }

    const material = await this.prisma.material.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category,
        unit: dto.unit,
        price: dto.price,
        stock: dto.stock
      }
    });

    return this.toResponseDto(material);
  }

  async uploadImage(
    id: string,
    file: Express.Multer.File
  ): Promise<MaterialResponseDto> {
    const existing = await this.prisma.material.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Material not found');
    }

    const imageUrl = await this.cloudinaryService.upload(file);

    const material = await this.prisma.material.update({
      where: { id },
      data: { imageUrl }
    });

    return this.toResponseDto(material);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.material.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Material not found');
    }

    try {
      await this.prisma.material.delete({ where: { id } });
    } catch (error) {
      if (isForeignKeyRestrictViolation(error)) {
        throw new ConflictException(
          'This material is already used in a project and cannot be deleted'
        );
      }
      throw error;
    }
  }

  private toResponseDto(material: Material): MaterialResponseDto {
    return {
      id: material.id,
      name: material.name,
      category: material.category,
      unit: material.unit,
      price: material.price.toString(),
      stock: material.stock,
      imageUrl: material.imageUrl,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt
    };
  }
}
