import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';
import { UploadSignatureDto } from './dto/upload-signature.dto';

@ApiBearerAuth()
@ApiTags('Uploads')
@Controller('uploads')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('signature')
  createSignature(): UploadSignatureDto {
    return this.cloudinaryService.createUploadSignature();
  }
}
