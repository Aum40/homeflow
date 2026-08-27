import { Trim } from '@/common/decorators/trim.decorator';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString
} from 'class-validator';

export class CreateHouseDesignDto {
  @IsString()
  @IsNotEmpty()
  @Trim()
  name: string;

  @IsOptional()
  @IsString()
  @Trim()
  description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  basePrice: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  steps?: string[];
}
