import { ApiProperty } from '@nestjs/swagger';

export class UploadSignatureDto {
  @ApiProperty()
  cloudName: string;

  @ApiProperty()
  apiKey: string;

  @ApiProperty()
  timestamp: number;

  @ApiProperty()
  folder: string;

  @ApiProperty()
  signature: string;
}
