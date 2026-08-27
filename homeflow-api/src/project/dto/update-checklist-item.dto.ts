import { Trim } from '@/common/decorators/trim.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateChecklistItemDto {
  @IsString()
  @IsNotEmpty()
  @Trim()
  title: string;
}
