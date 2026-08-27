import { Trim } from '@/common/decorators/trim.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChecklistItemDto {
  @IsString()
  @IsNotEmpty()
  @Trim()
  title: string;
}
