import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CompanyContactService } from './company-contact.service';
import { CompanyContactResponseDto } from './dto/company-contact-response.dto';
import { UpdateCompanyContactDto } from './dto/update-company-contact.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/database/generated/prisma/enums';

@ApiBearerAuth()
@ApiTags('Company Contact')
@Controller('company-contact')
export class CompanyContactController {
  constructor(private readonly companyContactService: CompanyContactService) {}

  // ไม่ใส่ @Roles เพื่อให้ผู้ใช้ที่ล็อกอินแล้วทุก role อ่านได้ (ลูกค้าต้องใช้)
  @Get()
  async findOne(): Promise<CompanyContactResponseDto> {
    return this.companyContactService.findOne();
  }

  @Roles(UserRole.ADMIN)
  @Patch()
  async update(
    @Body() dto: UpdateCompanyContactDto
  ): Promise<CompanyContactResponseDto> {
    return this.companyContactService.update(dto);
  }
}
