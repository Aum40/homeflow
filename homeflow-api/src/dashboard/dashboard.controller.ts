import { Controller, ForbiddenException, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/database/generated/prisma/enums';

@ApiBearerAuth()
@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole
  ): Promise<DashboardResponseDto> {
    if (role === UserRole.ADMIN) {
      return this.dashboardService.getAdminDashboard();
    }

    if (role === UserRole.PROJECT_MANAGER) {
      return this.dashboardService.getManagerDashboard(userId);
    }

    throw new ForbiddenException('Customers do not have a dashboard');
  }
}
