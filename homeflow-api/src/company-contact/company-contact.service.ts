import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CompanyContact } from '@/database/generated/prisma/client';
import { CompanyContactResponseDto } from './dto/company-contact-response.dto';
import { UpdateCompanyContactDto } from './dto/update-company-contact.dto';

const EMPTY_CONTACT: CompanyContactResponseDto = {
  companyName: null,
  address: null,
  phone: null,
  email: null,
  latitude: null,
  longitude: null,
  businessHours: null,
  lineId: null,
  facebook: null,
  updatedAt: null
};

@Injectable()
export class CompanyContactService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(): Promise<CompanyContactResponseDto> {
    const contact = await this.prisma.companyContact.findUnique({
      where: { isSingleton: true }
    });

    // ยังไม่เคยตั้งค่า ให้คืนค่าว่างแทนการ throw เพื่อให้หน้า /contact แสดงได้
    return contact ? this.toResponseDto(contact) : EMPTY_CONTACT;
  }

  async update(
    dto: UpdateCompanyContactDto
  ): Promise<CompanyContactResponseDto> {
    const contact = await this.prisma.companyContact.upsert({
      where: { isSingleton: true },
      create: dto,
      update: dto
    });

    return this.toResponseDto(contact);
  }

  private toResponseDto(contact: CompanyContact): CompanyContactResponseDto {
    return {
      companyName: contact.companyName,
      address: contact.address,
      phone: contact.phone,
      email: contact.email,
      latitude: contact.latitude?.toString() ?? null,
      longitude: contact.longitude?.toString() ?? null,
      businessHours: contact.businessHours,
      lineId: contact.lineId,
      facebook: contact.facebook,
      updatedAt: contact.updatedAt
    };
  }
}
