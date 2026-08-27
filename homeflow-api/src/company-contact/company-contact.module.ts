import { Module } from '@nestjs/common';
import { CompanyContactController } from './company-contact.controller';
import { CompanyContactService } from './company-contact.service';

@Module({
  controllers: [CompanyContactController],
  providers: [CompanyContactService]
})
export class CompanyContactModule {}
