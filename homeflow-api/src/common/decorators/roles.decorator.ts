import { UserRole } from '@/database/generated/prisma/enums';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'ROLES';

export function Roles(...roles: UserRole[]) {
  return SetMetadata(ROLES_KEY, roles);
}
