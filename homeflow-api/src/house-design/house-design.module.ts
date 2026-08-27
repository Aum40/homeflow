import { Module } from '@nestjs/common';
import { HouseDesignController } from './house-design.controller';
import { HouseDesignService } from './house-design.service';
import { UploadModule } from '@/infrastructure/upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [HouseDesignController],
  providers: [HouseDesignService],
  exports: [HouseDesignService]
})
export class HouseDesignModule {}
