import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import {
  HouseDesign,
  HouseDesignStep
} from '@/database/generated/prisma/client';
import { isForeignKeyRestrictViolation } from '@/common/utils/prisma-error.util';
import { CreateHouseDesignDto } from './dto/create-house-design.dto';
import { UpdateHouseDesignDto } from './dto/update-house-design.dto';
import { HouseDesignResponseDto } from './dto/house-design-response.dto';
import { CloudinaryService } from '@/infrastructure/upload/cloudinary.service';

type HouseDesignWithSteps = HouseDesign & { steps: HouseDesignStep[] };

@Injectable()
export class HouseDesignService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async create(dto: CreateHouseDesignDto): Promise<HouseDesignResponseDto> {
    const houseDesign = await this.prisma.houseDesign.create({
      data: {
        name: dto.name,
        description: dto.description,
        basePrice: dto.basePrice,
        steps: dto.steps?.length
          ? {
              create: dto.steps.map((title, index) => ({
                title,
                order: index
              }))
            }
          : undefined
      },
      include: { steps: { orderBy: { order: 'asc' } } }
    });

    return this.toResponseDto(houseDesign);
  }

  async findAll(): Promise<HouseDesignResponseDto[]> {
    const houseDesigns = await this.prisma.houseDesign.findMany({
      orderBy: { name: 'asc' },
      include: { steps: { orderBy: { order: 'asc' } } }
    });

    return houseDesigns.map((houseDesign) => this.toResponseDto(houseDesign));
  }

  async findOne(id: string): Promise<HouseDesignResponseDto> {
    const houseDesign = await this.prisma.houseDesign.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: 'asc' } } }
    });

    if (!houseDesign) {
      throw new NotFoundException('House design not found');
    }

    return this.toResponseDto(houseDesign);
  }

  async update(
    id: string,
    dto: UpdateHouseDesignDto
  ): Promise<HouseDesignResponseDto> {
    const existing = await this.prisma.houseDesign.findUnique({
      where: { id }
    });
    if (!existing) {
      throw new NotFoundException('House design not found');
    }

    const houseDesign = await this.prisma.$transaction(async (tx) => {
      if (dto.steps !== undefined) {
        await tx.houseDesignStep.deleteMany({ where: { houseDesignId: id } });
        if (dto.steps.length) {
          await tx.houseDesignStep.createMany({
            data: dto.steps.map((title, index) => ({
              houseDesignId: id,
              title,
              order: index
            }))
          });
        }
      }

      return tx.houseDesign.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          basePrice: dto.basePrice
        },
        include: { steps: { orderBy: { order: 'asc' } } }
      });
    });

    return this.toResponseDto(houseDesign);
  }

  async uploadImage(
    id: string,
    file: Express.Multer.File
  ): Promise<HouseDesignResponseDto> {
    const existing = await this.prisma.houseDesign.findUnique({
      where: { id }
    });
    if (!existing) {
      throw new NotFoundException('House design not found');
    }

    const imageUrl = await this.cloudinaryService.upload(file);

    const houseDesign = await this.prisma.houseDesign.update({
      where: { id },
      data: { imageUrl },
      include: { steps: { orderBy: { order: 'asc' } } }
    });

    return this.toResponseDto(houseDesign);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.houseDesign.findUnique({
      where: { id }
    });
    if (!existing) {
      throw new NotFoundException('House design not found');
    }

    try {
      await this.prisma.houseDesign.delete({ where: { id } });
    } catch (error) {
      if (isForeignKeyRestrictViolation(error)) {
        throw new ConflictException(
          'This house design is already used by a project and cannot be deleted'
        );
      }
      throw error;
    }
  }

  private toResponseDto(
    houseDesign: HouseDesignWithSteps
  ): HouseDesignResponseDto {
    return {
      id: houseDesign.id,
      name: houseDesign.name,
      description: houseDesign.description,
      imageUrl: houseDesign.imageUrl,
      basePrice: houseDesign.basePrice.toString(),
      steps: houseDesign.steps.map((step) => step.title),
      createdAt: houseDesign.createdAt,
      updatedAt: houseDesign.updatedAt
    };
  }
}
