import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { MessageResponseDto } from '@/common/dto/message-response.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/database/generated/prisma/enums';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('me')
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto
  ): Promise<UserResponseDto> {
    return this.userService.updateProfile(userId, dto);
  }

  @Patch('me/password')
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto
  ): Promise<MessageResponseDto> {
    await this.userService.changePassword(userId, dto);
    return { message: 'Password changed successfully' };
  }

  @UseInterceptors(FileInterceptor('avatar'))
  @Patch('me/avatar')
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('sub') userId: string
  ): Promise<string> {
    return this.userService.uploadAvatar(userId, file);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    return this.userService.getAllUsers();
  }

  @Roles(UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @Get('customers')
  async findCustomers(): Promise<UserResponseDto[]> {
    return this.userService.getCustomers();
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<UserResponseDto> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/role')
  async updateRole(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto
  ): Promise<UserResponseDto> {
    return this.userService.updateUserRole(adminId, id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto
  ): Promise<UserResponseDto> {
    return this.userService.updateUserStatus(adminId, id, dto);
  }
}

// FileInterceptor: single field => single file (@UploadedFile)
// FilesInterceptor: single field => multiple files (@UploadedFiles)
// FileFieldsInterceptor: multiple fields => multiple files (@UploadedFiles)
