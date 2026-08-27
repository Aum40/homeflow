import { Module } from '@nestjs/common';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { UploadModule } from '@/infrastructure/upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService]
})
export class MaterialModule {}
