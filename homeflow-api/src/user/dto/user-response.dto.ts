import { UserRole } from '@/database/generated/prisma/enums';

export class UserResponseDto {
  id: string;

  email: string;

  firstName: string;

  lastName: string;

  role: UserRole;

  isActive: boolean;

  avatarUrl: string | null;

  createdAt: Date;

  updatedAt: Date;
}
