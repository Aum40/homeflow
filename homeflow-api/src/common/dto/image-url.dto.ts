import { Trim } from '@/common/decorators/trim.decorator';
import { ArrayNotEmpty, IsArray, IsString, IsUrl } from 'class-validator';

const URL_OPTIONS = { protocols: ['https'], require_protocol: true };

/** ใช้กับ endpoint ที่ client อัปรูปเข้า Cloudinary เองแล้วส่ง URL กลับมา */
export class ImageUrlDto {
  @IsString()
  @Trim()
  @IsUrl(URL_OPTIONS)
  imageUrl: string;
}

export class ImageUrlsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUrl(URL_OPTIONS, { each: true })
  imageUrls: string[];
}
