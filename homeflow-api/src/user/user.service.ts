import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { UserCreateInput } from './types/user.type';
import { BcryptService } from '@/infrastructure/hash/bcrypt.service';
import { PrismaService } from '@/database/prisma.service';
import {
  PrismaClientKnownRequestError,
  UserGetPayload
} from '@/database/generated/prisma/internal/prismaNamespace';
import { User } from '@/database/generated/prisma/client';
import { UserRole } from '@/database/generated/prisma/enums';
import { CloudinaryService } from '@/infrastructure/upload/cloudinary.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async createUser(input: UserCreateInput): Promise<void> {
    const hash = await this.bcryptService.hash(input.password);

    try {
      await this.prisma.user.create({ data: { ...input, password: hash } });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exist');
        }
      }
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getUserById(
    id: string
  ): Promise<UserGetPayload<{ omit: { password: true } }> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      omit: { password: true }
    });
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto
  ): Promise<UserGetPayload<{ omit: { password: true } }>> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName
      },
      omit: { password: true }
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await this.bcryptService.compare(
      dto.currentPassword,
      user.password
    );
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hash = await this.bcryptService.hash(dto.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash }
    });
  }

  async getAllUsers(): Promise<UserGetPayload<{ omit: { password: true } }>[]> {
    return this.prisma.user.findMany({
      omit: { password: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCustomers(): Promise<
    UserGetPayload<{ omit: { password: true } }>[]
  > {
    return this.prisma.user.findMany({
      where: { role: UserRole.CUSTOMER, isActive: true },
      omit: { password: true },
      orderBy: { firstName: 'asc' }
    });
  }

  async updateUserRole(
    adminId: string,
    targetUserId: string,
    dto: UpdateUserRoleDto
  ): Promise<UserGetPayload<{ omit: { password: true } }>> {
    if (adminId === targetUserId) {
      throw new BadRequestException(
        'You cannot change your own role through this endpoint'
      );
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId }
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: dto.role },
      omit: { password: true }
    });
  }

  async updateUserStatus(
    adminId: string,
    targetUserId: string,
    dto: UpdateUserStatusDto
  ): Promise<UserGetPayload<{ omit: { password: true } }>> {
    if (adminId === targetUserId) {
      throw new BadRequestException(
        'You cannot change your own account status through this endpoint'
      );
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId }
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { isActive: dto.isActive },
      omit: { password: true }
    });
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File
  ): Promise<string> {
    const avatarUrl = await this.cloudinaryService.upload(file);
    await this.prisma.user.update({
      data: { avatarUrl },
      where: { id: userId }
    });
    return avatarUrl;
  }
}
