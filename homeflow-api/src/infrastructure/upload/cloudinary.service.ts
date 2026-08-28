import { EnvVariable } from '@/config/env.validation';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'node:stream';
import { UploadSignatureDto } from './dto/upload-signature.dto';

/** โฟลเดอร์ปลายทางบน Cloudinary ล็อกไว้ฝั่ง server ไม่รับจาก client */
const UPLOAD_FOLDER = 'homeflow';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(
    private readonly configService: ConfigService<EnvVariable, true>
  ) {
    this.cloudName = configService.get('CLOUDINARY_CLOUD_NAME', {
      infer: true
    });
    this.apiKey = configService.get('CLOUDINARY_API_KEY', { infer: true });
    this.apiSecret = configService.get('CLOUDINARY_API_SECRET', {
      infer: true
    });

    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret
    });
  }

  /**
   * สร้าง signature ให้เบราว์เซอร์อัปไฟล์เข้า Cloudinary ได้โดยตรง
   * เลี่ยงเพดาน request body 4.5MB ของ Vercel ที่รูปจากมือถือมักเกิน
   */
  createUploadSignature(): UploadSignatureDto {
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { folder: UPLOAD_FOLDER, timestamp },
      this.apiSecret
    );

    return {
      cloudName: this.cloudName,
      apiKey: this.apiKey,
      timestamp,
      folder: UPLOAD_FOLDER,
      signature
    };
  }

  /**
   * client เป็นคนส่ง URL กลับมาเอง จึงต้องยืนยันว่าเป็นไฟล์ในบัญชี
   * Cloudinary ของเราจริง ไม่งั้นผู้ใช้ที่ล็อกอินแล้วจะยัด URL ภายนอกเข้า DB ได้
   */
  assertOwnedUrl(url: string): void {
    const prefix = `https://res.cloudinary.com/${this.cloudName}/`;
    if (!url.startsWith(prefix)) {
      throw new BadRequestException('Image URL is not a valid upload');
    }
  }

  upload(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const writableStream = cloudinary.uploader.upload_stream(
        { folder: UPLOAD_FOLDER },
        (error, result) => {
          if (error || !result) {
            this.logger.error(error);
            reject(new InternalServerErrorException('Uploaded failed'));
            return;
          }
          resolve(result.secure_url);
        }
      );

      Readable.from(file.buffer).pipe(writableStream);
    });
  }
}
