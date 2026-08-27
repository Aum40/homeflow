import { Trim } from '@/common/decorators/trim.decorator';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min
} from 'class-validator';

export class UpdateMaterialDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Trim()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Trim()
  category?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Trim()
  unit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock?: number;
}
